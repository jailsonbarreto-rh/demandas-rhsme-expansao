# Rodada 5 — Atualizações de pacotes — Plano de implementação

> **Para executores agentivos:** executar em branch própria, com alterações isoladas, lockfile gerado pelo npm e gate integral antes do merge.

**Objetivo:** atualizar os pacotes autorizados de produção, formulários, animação, build, lint e testes, preservando Node 24, TypeScript 6.0.3, regras de negócio, dados e infraestrutura remota.

**Arquitetura:** a rodada será executada como pacote técnico único porque houve autorização expressa para o conjunto completo. As versões serão fixadas exatamente, o `package-lock.json` será regenerado pelo npm em Node 24 e qualquer ajuste de compatibilidade ficará limitado à configuração de ferramentas; nenhuma mudança funcional será introduzida.

**Pilha:** React 19, TypeScript 6.0.3, Vite, Supabase JavaScript, React Hook Form, Zod, Motion, ESLint, Vitest, Testing Library e Playwright.

## Restrições globais

- Manter Node `24.x` e `@types/node` na linha 24.
- Manter TypeScript `6.0.3`.
- Não usar `--force`, `--legacy-peer-deps` ou relaxamento de regras.
- Não alterar Supabase remoto, banco, migrations, RLS, dados, autenticação, permissões ou regras de negócio.
- Não publicar Production nesta rodada puramente técnica sem necessidade funcional independente.
- Preservar os 365 testes existentes e os 42 cenários Playwright, acrescentando correções de teste apenas quando exigidas por mudança legítima da ferramenta.
- Regenerar o lockfile somente pelo npm em Node 24.

## Versões autorizadas

### Dependências de produção

- `@supabase/supabase-js`: `2.110.9` → `2.112.0`;
- `react-hook-form`: `7.83.0` → `7.84.0`;
- `@hookform/resolvers`: `5.5.7` → `5.7.1`;
- `motion`: `12.42.2` → `12.43.0`.

### Dependências de desenvolvimento

- `vite`: `8.1.5` → `8.2.0`;
- `eslint`: `9.39.5` → `10.8.0`;
- `@eslint/js`: `9.39.5` → `10.8.0`;
- `@testing-library/jest-dom`: `6.9.1` → `7.0.0`.

`typescript-eslint` permanece em `8.65.0`, cuja faixa oficial inclui ESLint 10 e TypeScript 6.0.3. Plugins auxiliares somente poderão ser atualizados se o npm ou o gate comprovar incompatibilidade real e existir versão estável compatível.

---

## Tarefa 1 — Instalação reproduzível

- [ ] Instalar as versões exatas autorizadas sem flags de contorno.
- [ ] Regenerar `package-lock.json` pelo npm em Node 24.
- [ ] Confirmar que Node, `@types/node` e TypeScript permaneceram inalterados.
- [ ] Confirmar a árvore com `npm ls`.

## Tarefa 2 — Compatibilidade de lint e build

- [ ] Executar ESLint 10 com a configuração plana atual.
- [ ] Corrigir apenas incompatibilidades objetivas de configuração ou API.
- [ ] Executar TypeScript 6 e Vite 8.2.0.
- [ ] Comparar o bundle com a linha de base existente.

## Tarefa 3 — Validação funcional das bibliotecas de runtime

- [ ] Executar testes de autenticação, sessão, recuperação de senha, Supabase, Realtime e repositórios.
- [ ] Executar testes de formulários React Hook Form + Zod.
- [ ] Executar testes e inspeção das transições Motion.
- [ ] Executar a suíte integral Vitest e Playwright.

## Tarefa 4 — Segurança e integridade

- [ ] Executar `npm audit --audit-level=high`.
- [ ] Executar `npm audit signatures`.
- [ ] Executar testes de compatibilidade transitiva.
- [ ] Executar inspeção do bundle público.
- [ ] Executar Knip em modo diagnóstico, sem autofix.

## Tarefa 5 — Documentação e encerramento

- [ ] Registrar versões, compatibilidade, testes, riscos, limites e rollback.
- [ ] Atualizar `docs/HANDOFF.md`.
- [ ] Atualizar o plano consolidado e o registro de oportunidades técnicas.
- [ ] Remover workflows temporários antes do gate definitivo.
- [ ] Executar o gate integral novamente no SHA final.
- [ ] Integrar somente com todos os checks aprovados.

## Gate definitivo

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

## Rollback

O rollback consiste em reverter o PR da rodada, restaurando simultaneamente `package.json`, `package-lock.json`, eventuais ajustes estritamente técnicos e documentação. Nenhuma reversão remota de banco ou dados será necessária porque esse escopo não os altera.
