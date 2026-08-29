# Atualização segura de dependências — 29 de agosto de 2026

## Objetivo

Atualizar dependências patch/minor já maduras e incorporar `fast-check` como ferramenta de desenvolvimento para a futura bateria de testes gerativos do Trilho B, sem alterar regras de negócio, banco, migrations, RLS ou Production.

## Atualizações de runtime

- `@hookform/resolvers`: 5.7.1 → 5.9.1;
- `@supabase/supabase-js`: 2.112.0 → 2.112.4;
- `react-hook-form`: 7.84.0 → 7.86.0;
- `react-router`: 8.3.0 → 8.3.1;
- `sonner`: 2.0.7 → 2.0.8.

## Atualizações de desenvolvimento

- `@testing-library/user-event`: 14.6.5 → 14.6.6;
- `@types/react-dom`: 19.2.4 → 19.2.5;
- `@vitejs/plugin-react`: 6.1.0 → 6.1.1;
- `typescript-eslint`: 8.67.0 → 8.68.0;
- `fast-check`: novo, 4.9.0.

As atualizações já integradas pelo PR #158 permanecem preservadas: axe 4.13.0, jest-dom 7.0.1, Vitest/coverage 4.1.11, Vite 8.2.2, Globals 17.11.0 e Knip 6.32.2.

## Segurança

O lockfile é regenerado pelo npm em Node 24 e recebe somente correções não-breaking de `npm audit fix --package-lock-only`, sem `--force`.

O gate exige:

1. `npm ci`;
2. `npm audit --audit-level=high`;
3. `npm audit signatures`;
4. compatibilidade transitiva;
5. lint;
6. testes;
7. build;
8. orçamento e inspeção do bundle.

## Fora do escopo

- Motion 13;
- TanStack Table 9;
- TypeScript 7;
- ESLint 10;
- Supabase CLI/Action v3;
- migrations;
- mudança de dados;
- ativação do React Compiler/Oxc.

Esses itens permanecem separados para que causa de falha e rollback continuem claros.
