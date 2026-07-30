import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  new URL('./20260730023500_r4_preserve_exceptional_internal_state.sql', import.meta.url),
  'utf8',
);

describe('RPC R4 — estado interno excepcional do legado', () => {
  it('permite preservar apenas quando o estado já existia', () => {
    expect(migration).toContain("v_before.limite1_situacao = 'nao_se_aplica'");
    expect(migration).toContain("p_limite1_situacao = 'nao_se_aplica'");
    expect(migration).toContain("v_before.limite1_situacao <> 'nao_se_aplica'");
    expect(migration).toContain('O prazo interno não pode ser marcado como Não se aplica.');
  });

  it('mantém histórico estruturado e grant restrito', () => {
    expect(migration).toContain('insert into public.sme_historico');
    expect(migration).toContain("v_event_type := 'alteracao_prazo'");
    expect(migration).not.toMatch(/grant execute[\s\S]*service_role/i);
    expect(migration).toMatch(/grant execute[\s\S]*to authenticated;/i);
  });
});
