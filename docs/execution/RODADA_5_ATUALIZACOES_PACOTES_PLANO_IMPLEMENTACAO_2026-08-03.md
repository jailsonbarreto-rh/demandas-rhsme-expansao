# Rodada 5 — Atualizações de pacotes — Plano de implementação

**Status:** CONCLUÍDA pelo PR #143  
**Data:** 3 de agosto de 2026

> **Para executores agentivos:** executar em branch própria, com alterações isoladas, lockfile gerado pelo npm e gate integral antes do merge.

**Objetivo:** atualizar os pacotes autorizados de produção, formulários, animação, build, lint e testes, preservando Node 24, TypeScript 6.0.3, regras de negócio, dados e infraestrutura remota.

**Arquitetura:** a rodada foi executada como pacote técnico único porque houve autorização expressa para o conjunto completo. As versões foram fixadas exatamente, o `package-lock.json` foi regenerado pelo npm em Node 24 e nenhum ajuste funcional foi necessário.

**Pilha:** React 19, TypeScript 6.0.3, Vite, Supabase JavaScript, React Hook Form, Zod, Motion, ESLint, Vitest, Testing Library e Playwright.

## Restrições globais preservadas

- Node `24.x` e `@types/node` na linha 24.
- TypeScript `6.0.3`.
- Nenhum uso de `--force`, `--legacy-peer-deps` ou relaxamento de regras.
- Nenhuma alteração em Supabase remoto, banco, migrations, RLS, dados, autenticação, permissões ou regras de negócio.
- Nenhuma publicação de Production nesta rodada puramente técnica.
- Preservação dos 365 testes existentes e dos 42 cenários Playwright.
- Lockfile regenerado somente pelo npm em Node 24.

## Resultado da avaliação de compatibilidade

### Atualizações incorporadas

- `@supabase/supabase-js`: `2.110.9` → `2.112.0`;
- `react-hook-form`: `7.83.0` → `7.84.0`;
- `@hookform/resolvers`: `5.5.7` → `5.7.1`;
- `motion`: `12.42.2` → `12.43.0`;
- `vite`: `8.1.5` → `8.2.0`;
- `@testing-library/jest-dom`: `6.9.1` → `7.0.0`.

### ESLint 10 — bloqueado por incompatibilidade oficial do ecossistema

A tentativa limpa de instalar `eslint` e `@eslint/js` `10.8.0` foi recusada pelo npm com `ERESOLVE`. O pacote `eslint-plugin-jsx-a11y` `6.10.2`, responsável pela fiscalização de acessibilidade JSX do CTRH, declara suporte apenas até ESLint 9. O repositório oficial ainda não publicou versão estável com suporte ao ESLint 10; existem somente propostas abertas não lançadas.

A rodada não utilizou `--force`, `--legacy-peer-deps`, pacote não publicado, remoção do plugin ou redução da cobertura de acessibilidade. Por isso, `eslint` e `@eslint/js` permanecem em `9.39.5`. A atualização major será retomada quando o plugin de acessibilidade publicar suporte oficial estável.

`typescript-eslint` permaneceu em `8.65.0`, TypeScript em `6.0.3`, Node em `24.x` e `@types/node` em `24.13.3`.

---

## Tarefa 1 — Instalação reproduzível

- [x] Instalar as versões compatíveis exatas sem flags de contorno.
- [x] Regenerar `package-lock.json` pelo npm em Node 24.
- [x] Restaurar ESLint `9.39.5` após a incompatibilidade oficial comprovada.
- [x] Confirmar que Node, `@types/node` e TypeScript permaneceram inalterados.
- [x] Confirmar a árvore com `npm ls`.

O lockfile reproduzível foi gerado pelo npm no commit `b656e391be6015f6eac6e3a349394d9dd2efd5a6`.

## Tarefa 2 — Compatibilidade de lint e build

- [x] Executar ESLint 9.39.5 com a configuração plana atual e plugins preservados.
- [x] Executar TypeScript 6 e Vite 8.2.0.
- [x] Comparar o bundle com a linha de base existente.

Resultado: lint sem warnings, build aprovado, 803 módulos transformados e bundle inicial de 220.300 bytes, 54,79% abaixo da linha de base.

## Tarefa 3 — Validação funcional das bibliotecas de runtime

- [x] Executar testes de autenticação, sessão, recuperação de senha, Supabase, Realtime e repositórios.
- [x] Executar testes de formulários React Hook Form + Zod.
- [x] Executar testes e inspeção das transições Motion.
- [x] Executar a suíte integral Vitest e Playwright.

Resultado: 80 arquivos, 365 testes e 42 cenários Playwright aprovados em desktop e mobile.

## Tarefa 4 — Segurança e integridade

- [x] Executar `npm audit --audit-level=high`.
- [x] Executar `npm audit signatures`.
- [x] Executar testes de compatibilidade transitiva.
- [x] Executar inspeção do bundle público.
- [x] Executar Knip em modo diagnóstico, sem autofix.

Resultado: zero vulnerabilidades, 576 assinaturas, 159 attestations, três testes transitivos aprovados, bundle público aprovado e nenhum novo achado do Knip.

## Tarefa 5 — Documentação e encerramento

- [x] Registrar versões, compatibilidade, testes, riscos, limites e rollback.
- [x] Atualizar `docs/HANDOFF.md`.
- [x] Atualizar o plano consolidado e o registro de oportunidades técnicas.
- [x] Remover todos os workflows temporários.
- [x] Executar o gate integral após a consolidação das dependências e da documentação.
- [x] Integrar somente com todos os checks aprovados.

O gate integral temporário foi aprovado no run `30816822157`, job `91696514806`. Após a remoção dos workflows temporários, o workflow permanente `Dependency health` foi utilizado como verificação definitiva do SHA submetido ao merge.

## Gate executado

```bash
npm ci
npm run check:docs
npm audit --audit-level=high
npm audit signatures
npm run test:dependency-compat
npm run lint
npm run test:coverage
npm run build
npm run check:bundle
npm run check:public-bundle
npm run analyze:unused
npm run test:e2e
```

## Evidência

Consulte `docs/execution/RODADA_5_ATUALIZACOES_PACOTES_RELATORIO_FINAL_2026-08-03.md`.

## Rollback

O rollback consiste em reverter o PR #143, restaurando simultaneamente `package.json`, `package-lock.json` e documentação. Nenhuma reversão remota de banco ou dados será necessária porque esse escopo não os altera.
