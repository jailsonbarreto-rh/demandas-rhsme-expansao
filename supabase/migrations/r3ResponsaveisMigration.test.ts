import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const migrationsDir = dirname(fileURLToPath(import.meta.url));
const migrationPath = resolve(migrationsDir, '20260724011303_r3_responsaveis_oficiais.sql');
const sql = existsSync(migrationPath)
  ? readFileSync(migrationPath, 'utf8').replace(/\r\n/g, '\n').toLowerCase()
  : '';

describe('R3 — responsáveis oficiais', () => {
  it('versiona a migração estrutural e histórica', () => {
    expect(existsSync(migrationPath)).toBe(true);
  });

  it('sincroniza UUID e nome oficial no servidor', () => {
    expect(sql).toContain('create or replace function private.r3_responsavel_nome');
    expect(sql).toContain('create or replace function private.r3_sync_responsavel_oficial');
    expect(sql).toContain('create trigger sme_demandas_responsavel_oficial_trigger');
    expect(sql).toContain("raise exception 'responsável inválido: selecione um usuário cadastrado.'");
    expect(sql).toContain('new.responsavel := private.r3_responsavel_nome(new.responsavel_id)');
  });

  it('faz criação e edição derivarem o texto do perfil', () => {
    expect(sql).toContain('create or replace function public.criar_sme_demanda_v2');
    expect(sql).toContain('create or replace function public.editar_sme_demanda');
    expect(sql).toContain('v_responsavel := private.r3_responsavel_nome(p_responsavel_id)');
    expect(sql).toContain('responsavel = v_responsavel');
    expect(sql).toContain('o cadastro textual de responsável foi descontinuado');
  });

  it('lista todos os usuários registrados sem filtrar papel ou status', () => {
    expect(sql).toContain('create or replace function public.listar_perfis_minimos()');
    expect(sql).toContain('join auth.users u on u.id = p.id');
    expect(sql).not.toContain("p.status = 'ativo'");
    expect(sql).not.toContain("p.nivel = 'editor'");
  });

  it('inclui todos os mapeamentos aprovados e preserva Vanessa', () => {
    for (const token of [
      'ericaholanda@rioeduca.net',
      'gisellefiquene@rioeduca.net',
      'sabrinaandrade@rioeduca.net',
      'thiago.freitas@rioeduca.net',
      'jaquelinemelo007@rioeduca.net',
      'jailsonbsilva@rioeduca.net',
      'jessica.aguiar@rioeduca.net',
      'elisabethmoraes@rioeduca.net',
      'helenasilva@rioeduca.net',
      'jaqueline iha',
      'thiago migrado',
      'beth migrado',
    ]) {
      expect(sql).toContain(token);
    }
    expect(sql).toContain("responsavel = 'vanessa migrado'");
    expect(sql).toContain("tipo_evento");
    expect(sql).toContain("'reatribuicao'");
  });

  it('não altera papéis, status ou políticas de acesso', () => {
    expect(sql).not.toMatch(/update\s+public\.perfis_usuarios/);
    expect(sql).not.toMatch(/alter\s+policy/);
    expect(sql).not.toMatch(/create\s+policy/);
  });
});
