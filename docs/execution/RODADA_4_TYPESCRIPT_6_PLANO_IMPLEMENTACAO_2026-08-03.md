# Rodada 4 — Plano de Implementação do TypeScript 6

**Data:** 3 de agosto de 2026  
**Status:** EM EXECUÇÃO  
**Base:** `d0e0f0a40f5eaa1019cf879bd083adc5a3742910`  
**Branch:** `chore/rodada-4-typescript-6`

## Objetivo

Atualizar o compilador do projeto de TypeScript 5.9.3 para TypeScript 6.0.3, preservando integralmente o comportamento funcional, a arquitetura, o Supabase, os dados, as regras de negócio e a publicação vigente.

## Arquitetura da mudança

A atualização será isolada em um único PR técnico. O `package.json` e o `package-lock.json` serão regenerados pelo npm com versão exata. Ajustes no `tsconfig.json` ou no código somente serão admitidos quando uma incompatibilidade concreta do TypeScript 6 for reproduzida pelo compilador, sem relaxamento permanente de regras.

## Stack e compatibilidade

- Node.js 24.x;
- npm do runner oficial do GitHub Actions;
- TypeScript 6.0.3;
- typescript-eslint 8.65.0, cuja faixa oficial inclui TypeScript `<6.1.0`;
- Vite 8.1.5;
- React 19.2.8;
- Vitest 4.1.10;
- Playwright 1.62.1.

## Restrições globais

- Não instalar TypeScript 7.
- Não atualizar outras dependências no mesmo PR.
- Não alterar banco, migrations, RLS, dados ou Supabase remoto.
- Não alterar layout, comportamento, regras de negócio, cache, Realtime, autenticação ou mutations.
- Não usar `ignoreDeprecations` para ocultar problemas.
- Não ampliar `skipLibCheck` nem relaxar `strict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns` ou `noFallthroughCasesInSwitch`.
- Não editar manualmente a árvore transitiva do lockfile.
- Não publicar em Production por inferência; o deploy automático permanece bloqueado.

## Tarefa 1 — Gerar manifesto e lockfile

- [ ] Executar `npm install --save-dev --save-exact typescript@6.0.3` em ambiente Node 24 do GitHub Actions.
- [ ] Registrar `typescript: 6.0.3` no `package.json`.
- [ ] Regenerar `package-lock.json` exclusivamente pelo npm.
- [ ] Confirmar que nenhuma outra dependência direta mudou.
- [ ] Retirar o mecanismo temporário usado para gerar o lockfile antes do gate final.

## Tarefa 2 — Validar o compilador

- [ ] Executar `npx tsc --version` e confirmar `Version 6.0.3`.
- [ ] Executar `npx tsc --noEmit` com o `tsconfig.json` vigente.
- [ ] Corrigir somente erros concretos introduzidos pelo TypeScript 6.
- [ ] Preservar `module: ESNext`, `moduleResolution: bundler`, `target: ES2022` e `noEmit: true`, salvo incompatibilidade comprovada.

## Tarefa 3 — Validar a cadeia técnica completa

- [ ] `npm ci`.
- [ ] `npm run check:docs`.
- [ ] `npm audit --audit-level=high`.
- [ ] `npm audit signatures`.
- [ ] `npm run test:dependency-compat`.
- [ ] `npm run lint`.
- [ ] `npm run test:coverage`.
- [ ] `npm run build`.
- [ ] `npm run check:bundle`.
- [ ] `npm run check:public-bundle`.
- [ ] `npm run analyze:unused`, somente diagnóstico.
- [ ] `npm run test:e2e` em desktop e mobile.

## Tarefa 4 — Documentação e integração

- [ ] Criar relatório final com versão, compatibilidade, ajustes, testes e rollback.
- [ ] Atualizar o Handoff e o registro de oportunidades técnicas.
- [ ] Confirmar diff restrito ao compilador, lockfile e documentação necessária.
- [ ] Integrar somente após o gate integral aprovado.

## Critérios de aprovação

A Rodada 4 será aprovada quando:

1. `typescript@6.0.3` estiver fixado e reproduzível pelo lockfile;
2. o projeto compilar sem supressão nova de erro ou depreciação;
3. lint, testes, cobertura, build, bundle, segurança e Playwright estiverem aprovados;
4. nenhuma alteração funcional, visual ou de banco estiver presente;
5. o mecanismo temporário de geração do lockfile não permanecer na `main`.

## Rollback

Reverter o PR da Rodada 4 restaura `typescript@5.9.3`, o lockfile anterior e a documentação correspondente. Como a mudança não envolve banco, dados ou publicação funcional, não existe rollback de Supabase ou migração.