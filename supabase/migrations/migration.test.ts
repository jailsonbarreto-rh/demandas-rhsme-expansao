import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const migrationsDir = dirname(fileURLToPath(import.meta.url));
const migrationPath = resolve(migrationsDir, '20260707000000_sme_demandas.sql');
const revokeAnonPath = resolve(migrationsDir, '20260713211616_revoke_anon_operational_rpcs.sql');
const indexesPath = resolve(migrationsDir, '20260713211703_add_foreign_key_indexes.sql');
const batchImportPath = resolve(migrationsDir, '20260717002408_batch_import_audit_20260716.sql');
const batchImportDomainFixPath = resolve(migrationsDir, '20260717003552_batch_import_allow_legacy_classifications.sql');
const centralWorkExpandPath = resolve(migrationsDir, '20260722090000_central_trabalho_expand.sql');

const readSql = (path: string) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n').toLowerCase();
const readOptionalSql = (path: string) => existsSync(path) ? readSql(path) : '';

const sql = readSql(migrationPath);
const revokeAnonSql = readSql(revokeAnonPath);
const indexesSql = readSql(indexesPath);
const batchImportSql = readSql(batchImportPath);
const batchImportDomainFixSql = readSql(batchImportDomainFixPath);
const centralWorkExpandSql = readOptionalSql(centralWorkExpandPath);

describe('migração Supabase', () => {
  it('protege todas as tabelas públicas com RLS', () => {
    for (const table of ['perfis_usuarios', 'sme_demandas', 'sme_historico']) {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
    }
  });

  it('não usa metadados do usuário para autorização', () => {
    expect(sql).not.toContain("raw_user_meta_data->>'nivel'");
    expect(sql).not.toContain("raw_user_meta_data->>'status'");
  });

  it('revoga execução pública dos helpers privilegiados', () => {
    for (const helper of ['is_active', 'can_edit', 'is_admin']) {
      expect(sql).toContain(`revoke all on function private.${helper}() from public`);
    }
  });

  it('usa helpers security definer com search_path vazio', () => {
    expect(sql.match(/security definer/g)?.length).toBeGreaterThanOrEqual(4);
    expect(sql.match(/set search_path = ''/g)?.length).toBeGreaterThanOrEqual(6);
  });

  it('cria RPCs security definer e concede execução ao papel autenticado', () => {
    expect(sql).toContain('create or replace function public.criar_sme_demanda');
    expect(sql).toContain('create or replace function public.atualizar_status_sme_demanda');
    expect(sql.match(/security definer/g)?.length).toBeGreaterThanOrEqual(6);
    expect(sql).toContain('grant execute on function public.criar_sme_demanda');
    expect(sql).toContain('grant execute on function public.atualizar_status_sme_demanda');
  });

  it('revoga explicitamente as RPCs operacionais da role anônima', () => {
    expect(revokeAnonSql).toMatch(/revoke all on function public\.criar_sme_demanda\([\s\S]*?\) from public, anon, authenticated;/);
    expect(revokeAnonSql).toMatch(/revoke all on function public\.atualizar_status_sme_demanda\([\s\S]*?\) from public, anon, authenticated;/);
    expect(revokeAnonSql).toMatch(/grant execute on function public\.criar_sme_demanda\([\s\S]*?\) to authenticated;/);
    expect(revokeAnonSql).toMatch(/grant execute on function public\.atualizar_status_sme_demanda\([\s\S]*?\) to authenticated;/);
  });

  it('concede privilégios explícitos às tabelas do novo projeto', () => {
    expect(sql).toContain('grant select on table public.perfis_usuarios to authenticated');
    expect(sql).toContain('grant update (nivel, status, setor) on table public.perfis_usuarios to authenticated');
    expect(sql).toContain('grant select, delete on table public.sme_demandas to authenticated');
    expect(sql).toContain('grant update (numero, tipo, assunto, responsavel, limite1, limite2, setor, classificacao) on table public.sme_demandas to authenticated');
    expect(sql).toContain('grant select on table public.sme_historico to authenticated');
  });

  it('não concede privilégios de insert direto para authenticated nas tabelas de demandas ou histórico', () => {
    expect(sql).not.toContain('grant select, insert, delete on table public.sme_demandas');
    expect(sql).not.toContain('grant insert on table public.sme_demandas');
    expect(sql).not.toContain('grant insert on table public.sme_historico');
  });

  it('permite a RPC de bootstrap somente para service_role', () => {
    expect(sql).toContain('create or replace function public.bootstrap_importar_demanda');
    expect(sql).toMatch(/revoke all on function public\.bootstrap_importar_demanda\([\s\S]*?\) from public, anon, authenticated;/);
    expect(sql).toMatch(/grant execute on function public\.bootstrap_importar_demanda\([\s\S]*?\) to service_role;/);
    expect(sql).not.toMatch(/grant execute on function public\.bootstrap_importar_demanda\([\s\S]*?\) to authenticated;/);
  });

  it('serializa alterações administrativas e trata update e delete', () => {
    expect(sql).toContain('pg_catalog.pg_advisory_xact_lock(1122334455)');
    expect(sql).toContain("if tg_op = 'delete'");
    expect(sql).toContain('return old');
    expect(sql).toContain("if tg_op = 'update'");
    expect(sql).toContain('return new');
  });

  it('habilita Realtime para demandas e histórico', () => {
    expect(sql).toContain('alter publication supabase_realtime add table public.sme_demandas');
    expect(sql).toContain('alter publication supabase_realtime add table public.sme_historico');
  });

  it('adiciona índices para todas as chaves estrangeiras operacionais', () => {
    for (const indexName of [
      'sme_demandas_created_by_idx',
      'sme_demandas_updated_by_idx',
      'sme_historico_created_by_idx',
      'sme_historico_demanda_id_idx',
    ]) {
      expect(indexesSql).toContain(`create index ${indexName}`);
    }
  });

  it('mantém a trilha da importação em lote privada e protegida por RLS', () => {
    for (const table of ['sme_importacoes', 'sme_importacao_itens']) {
      expect(batchImportSql).toContain(`create table private.${table}`);
      expect(batchImportSql).toContain(`alter table private.${table} enable row level security`);
      expect(batchImportSql).toContain(`revoke all on table private.${table} from public, anon, authenticated`);
    }
  });

  it('restringe a RPC atômica de lote à service_role', () => {
    expect(batchImportSql).toContain('create or replace function public.importar_sme_demandas_lote');
    expect(batchImportSql).toContain('pg_catalog.pg_advisory_xact_lock(3344556677)');
    expect(batchImportSql).toMatch(/revoke all on function public\.importar_sme_demandas_lote\([\s\S]*?\) from public, anon, authenticated;/);
    expect(batchImportSql).toMatch(/grant execute on function public\.importar_sme_demandas_lote\([\s\S]*?\) to service_role;/);
    expect(batchImportSql).not.toMatch(/grant execute on function public\.importar_sme_demandas_lote\([\s\S]*?\) to authenticated;/);
  });

  it('exige dry-run, fingerprint, hashes e reconciliação antes de concluir o lote', () => {
    expect(batchImportSql).toContain("'status', 'dry_run_ok'");
    expect(batchImportSql).toContain('p_expected_db_fingerprint <> v_db_fingerprint');
    expect(batchImportSql).toContain("pg_catalog.encode(\n    extensions.digest(pg_catalog.convert_to(p_lote::text, 'utf8'), 'sha256')");
    expect(batchImportSql).toContain('v_inserted <> p_expected_count');
    expect(batchImportSql).toContain('v_db_count_after <> v_db_count + p_expected_count');
    expect(batchImportSql).toContain('v_historico_fingerprint_after <> v_historico_fingerprint');
    expect(batchImportSql).toContain("set status = 'concluido'");
  });

  it('bloqueia concorrência e preserva exclusões administrativas', () => {
    expect(batchImportSql).toContain('create unique index if not exists sme_demandas_numero_normalizado_uidx');
    expect(batchImportSql).toContain('lock table public.sme_demandas in share row exclusive mode');
    expect(batchImportSql).toContain('lock table public.sme_historico in share row exclusive mode');
    expect(batchImportSql).toContain('demanda_id bigint unique references public.sme_demandas(id) on delete set null');
    expect(batchImportSql).toContain('if p_apply is null then');
    expect(batchImportSql).toContain('if p_apply is not true then');
  });

  it('aceita as classificações legítimas já presentes na base', () => {
    for (const value of ["'permuta'", "'diversos'"]) {
      expect(batchImportSql).toContain(value);
      expect(batchImportDomainFixSql).toContain(value);
    }
  });

  describe('Ciclo 3 — expansão aditiva da Central de Trabalho', () => {
    it('versiona a migration aditiva prevista no plano', () => {
      expect(existsSync(centralWorkExpandPath)).toBe(true);
    });

    it('adiciona todos os campos de demandas e histórico sem remover o contrato existente', () => {
      for (const column of [
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
        'tipo_evento',
        'status_anterior',
        'alteracoes',
      ]) {
        expect(centralWorkExpandSql).toContain(column);
      }
    });

    it('classifica o legado sem inventar status anterior', () => {
      expect(centralWorkExpandSql).toContain("set origem = 'legado'");
      expect(centralWorkExpandSql).toContain("when limite1 is not null then 'definido'");
      expect(centralWorkExpandSql).toContain("when limite2 is not null then 'definido'");
      expect(centralWorkExpandSql).toContain("then 'criacao'");
      expect(centralWorkExpandSql).toContain("else 'mudanca_status'");
      expect(centralWorkExpandSql).not.toMatch(/set\s+status_anterior\s*=/);
    });

    it('cria os checks de consistência como NOT VALID', () => {
      for (const constraint of [
        'sme_demandas_limite1_consistencia_check',
        'sme_demandas_limite2_consistencia_check',
        'sme_demandas_origem_check',
        'sme_demandas_exclusao_logica_check',
        'sme_historico_tipo_evento_check',
      ]) {
        expect(centralWorkExpandSql).toMatch(new RegExp(`constraint ${constraint}[\\s\\S]*?not valid`));
      }
    });

    it('cria os índices operacionais previstos no plano', () => {
      for (const indexName of [
        'sme_demandas_responsavel_abertas_idx',
        'sme_demandas_proxima_acao_idx',
        'sme_demandas_status_visivel_idx',
        'sme_historico_demanda_data_idx',
      ]) {
        expect(centralWorkExpandSql).toContain(`create index if not exists ${indexName}`);
      }
    });

    it('não executa operações destrutivas nem revoga as APIs legadas', () => {
      expect(centralWorkExpandSql).not.toMatch(/\bdrop\s+table\b/);
      expect(centralWorkExpandSql).not.toMatch(/\btruncate\b/);
      expect(centralWorkExpandSql).not.toMatch(/\bdelete\s+from\b/);
      expect(centralWorkExpandSql).not.toMatch(/\bdrop\s+function\b/);
      expect(centralWorkExpandSql).not.toMatch(/revoke[\s\S]*public\.criar_sme_demanda/);
      expect(centralWorkExpandSql).not.toMatch(/revoke[\s\S]*public\.atualizar_status_sme_demanda/);
    });
  });
});
