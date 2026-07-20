import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildDryRunArgs,
  runDryRun,
  validateDryRunEnvironment,
} from './dry-run-import.mjs';

const tempDirs = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

const payload = [{
  source_line: 2,
  numero: 'SME-PRO-2025/00001-A',
  tipo: 'Processo',
  assunto: 'Consulta',
  responsavel: 'Ana',
  limite1: '',
  limite2: '',
  status: 'Tramitado',
  setor: 'E/CTRH',
  classificacao: 'Outros',
}];

const manifest = {
  sourceAggregateSha256: 'a'.repeat(64),
  payloadSha256: 'b'.repeat(64),
};

const actorId = '11111111-1111-4111-8111-111111111111';

describe('dry-run da importação no Supabase', () => {
  it('monta somente parâmetros de validação, sem autorização de escrita', () => {
    expect(buildDryRunArgs({ payload, manifest, actorId })).toEqual({
      p_lote: payload,
      p_source_hash: 'a'.repeat(64),
      p_client_payload_hash: 'b'.repeat(64),
      p_expected_server_payload_hash: null,
      p_expected_count: 1,
      p_expected_db_fingerprint: null,
      p_expected_historico_fingerprint: null,
      p_actor_id: actorId,
      p_apply: false,
    });
  });

  it('recusa ambiente sem URL, chave secreta ou ator administrativo', () => {
    expect(() => validateDryRunEnvironment({})).toThrow('SUPABASE_URL');
    expect(() => validateDryRunEnvironment({ SUPABASE_URL: 'https://example.supabase.co' }))
      .toThrow('SUPABASE_SECRET_KEY');
    expect(() => validateDryRunEnvironment({
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SECRET_KEY: 'secret',
    })).toThrow('MIGRATION_ACTOR_ID');
  });

  it('invoca a RPC em dry-run e grava recibo sem incluir a chave secreta', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        status: 'dry_run_ok',
        batch_hash: 'c'.repeat(64),
        validated_count: 1,
        db_fingerprint: 'db-fingerprint',
        historico_fingerprint: 'history-fingerprint',
      },
      error: null,
    });
    const outputDir = await mkdtemp(join(tmpdir(), 'ctrh-dry-run-'));
    tempDirs.push(outputDir);
    const receiptPath = join(outputDir, 'dry-run-receipt.json');

    await runDryRun({
      client: { rpc },
      payload,
      manifest,
      actorId,
      receiptPath,
    });

    expect(rpc).toHaveBeenCalledWith(
      'importar_sme_demandas_lote',
      expect.objectContaining({ p_apply: false, p_expected_count: 1 }),
    );
    const receiptText = await readFile(receiptPath, 'utf8');
    expect(receiptText).toContain('dry_run_ok');
    expect(receiptText).not.toContain('SUPABASE_SECRET_KEY');
    expect(receiptText).not.toContain('secret');
  });
});
