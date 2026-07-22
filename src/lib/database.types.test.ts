import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('./database.types.ts', import.meta.url), 'utf8');

describe('database.types — Ciclo 3', () => {
  it('inclui todos os campos expandidos de sme_demandas', () => {
    for (const field of [
      'responsavel_id',
      'proxima_acao',
      'proxima_acao_em',
      'limite1_situacao',
      'limite1_justificativa',
      'limite2_situacao',
      'limite2_justificativa',
      'link_origem',
      'origem',
      'deleted_at',
      'deleted_by',
      'deletion_reason',
    ]) {
      expect(source).toContain(field);
    }
  });

  it('inclui o contrato expandido de sme_historico', () => {
    for (const field of ['tipo_evento', 'status_anterior', 'alteracoes']) {
      expect(source).toContain(field);
    }
  });

  it('mantém os novos campos disponíveis em Row, Insert e Update', () => {
    expect(source.match(/responsavel_id/g)?.length).toBeGreaterThanOrEqual(3);
    expect(source.match(/limite1_situacao/g)?.length).toBeGreaterThanOrEqual(3);
    expect(source.match(/tipo_evento/g)?.length).toBeGreaterThanOrEqual(2);
  });
});
