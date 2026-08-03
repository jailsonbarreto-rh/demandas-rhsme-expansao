# Rodada 3.2 — Preparação anterior ao TypeScript 6

**Data:** 3 de agosto de 2026  
**Status:** execução técnica em validação final no PR #137  
**Base inicial:** `main` em `9be47339bafa6e44cc8a0fb4eaae9f43f90fb21d`  
**Branch:** `chore/rodada-3-2-preparacao-typescript`

## 1. Objetivo

Executar uma preparação pequena e reversível antes do experimento isolado com TypeScript 6, sem atualizar o compilador nesta rodada.

O escopo autorizado compreende:

1. diagnosticar patches e minors disponíveis;
2. aplicar somente atualizações justificadas e de baixo risco;
3. reduzir a visibilidade dos dez exports internos classificados pelo Knip na Rodada 3.1;
4. auditar o `tsconfig.json` para antecipar incompatibilidades do TypeScript 6;
5. preservar banco, dados, migrations, RLS, regras de negócio e comportamento funcional.

## 2. Diagnóstico de dependências

O diagnóstico foi executado no GitHub Actions por `npm outdated --json`, usando Node 24 e a árvore bloqueada do projeto.

Evidência inicial:

- workflow run `30785916691`;
- artefato `rodada-3-2-diagnosticos`, ID `8845245557`;
- instalação inicial: 578 pacotes e zero vulnerabilidades;
- compilação TypeScript 5.9.3: aprovada;
- linha de base do Knip: 18 símbolos exportados sem consumidor externo.

### 2.1 Atualizações integradas

Foram selecionadas apenas ferramentas de desenvolvimento, tipos e utilitários de teste/migração com risco baixo e validação comum:

| Pacote | Anterior | Atualizado | Natureza |
|---|---:|---:|---|
| `@playwright/test` | 1.62.0 | 1.62.1 | patch de teste E2E |
| `@types/react` | 19.2.17 | 19.2.18 | patch de tipos |
| `@types/react-dom` | 19.2.3 | 19.2.4 | patch de tipos |
| `@vitejs/plugin-react` | 6.0.4 | 6.0.5 | patch do plugin de build |
| `csv-parse` | 7.0.1 | 7.0.2 | patch de utilitário de migração |
| `globals` | 17.8.0 | 17.9.0 | minor de configuração de lint |
| `jsdom` | 30.0.0 | 30.0.1 | patch do ambiente de testes |
| `knip` | 6.29.0 | 6.31.0 | minor da ferramenta diagnóstica |

O `package-lock.json` foi regenerado pelo npm no GitHub Actions, sem edição manual, e gravado na branch pelo commit `2a1e3260640c39a2668564cfd163c2913f4b733e`.

### 2.2 Atualizações deliberadamente adiadas

Não foram agrupadas nesta rodada:

| Pacote ou grupo | Versão disponível no diagnóstico | Decisão |
|---|---:|---|
| `@supabase/supabase-js` | 2.111.0 | SDK de produção; exige PR isolado e benefício aplicável |
| `react-hook-form` | 7.84.0 | fluxo de formulários; exige PR isolado |
| `@hookform/resolvers` | 5.7.1 | deve acompanhar a análise do React Hook Form |
| `motion` | 12.43.0 | biblioteca executada na interface; exige escopo próprio |
| `vite` | 8.2.0 | ferramenta estrutural de build; deve ser avaliada separadamente |
| `eslint` e `@eslint/js` | linha 10 | major fora do escopo |
| `@testing-library/jest-dom` | 7.0.0 | major fora do escopo |
| `@types/node` | linha 26 | incompatível com o runtime adotado, Node 24 |
| `typescript` | linha 7 | major fora do escopo; TypeScript 6 permanece ponte planejada |

Esses adiamentos não representam falha. Aplicam as regras vigentes de isolamento, proporcionalidade e autorização da política de manutenção.

## 3. Limpeza conservadora do Knip

A Rodada 3.1 classificou dez símbolos como usados dentro do próprio módulo, mas exportados sem consumidor externo.

Nesta rodada foi retirado somente o modificador `export` de:

- `deadlineEquals`;
- `buildDemandSearchDocument`;
- `ConfigurationError`;
- `OPERATIONAL_TIME_ZONE`;
- `deadlineStateValues`;
- `ErrorBoundaryAction`;
- `ResponsibleLinkState`;
- `TemporalSignalKind`;
- `PeriodField`;
- `DemandSearchMatchKind`.

Nenhum símbolo foi apagado. Nenhuma assinatura interna, valor, fluxo ou regra foi alterada.

Permanecem preservados para revisão específica:

- `isLegacyDeadlineCompletion`;
- `canPreserveMissingDeadline`;
- `canUseDeadlineStateAfterRegistration`;
- `getPrazoFinalSemantics`;
- `PrazoSemantics`;
- `DatabaseR4`;
- `DeadlineValue`;
- `Json`, como contrato intencional do banco.

O Knip continua diagnóstico, sem autofix e fora do gate obrigatório.

## 4. Auditoria do `tsconfig.json`

### 4.1 Configuração efetiva atual

A configuração efetiva foi extraída por `npx tsc --showConfig` e confirmou:

- `target: ES2022`;
- `module: ESNext`;
- `moduleResolution: bundler`;
- `noEmit: true`;
- `jsx: react-jsx`;
- `strict: true`;
- verificações de não utilizados, retornos implícitos e fallthrough ativas;
- `include: ["src"]`;
- 141 arquivos abrangidos na leitura inicial.

### 4.2 Compatibilidade antecipada com TypeScript 6

O arquivo não utiliza as opções legadas ou incompatíveis mais relevantes da transição para TypeScript 6:

- não usa `target: ES5`;
- não usa `downlevelIteration`;
- não usa módulos AMD, UMD, SystemJS ou `none`;
- não usa `outFile`;
- não desativa modo estrito;
- não usa `baseUrl` ou inferência de emissão que exija correção de `rootDir`;
- não contém `ignoreDeprecations` para ocultar avisos.

O projeto é uma aplicação Vite sem emissão pelo TypeScript. Por isso, `rootDir` não é necessário nesta configuração.

Os tipos do Vite já são incluídos explicitamente por `src/vite-env.d.ts` com:

```ts
/// <reference types="vite/client" />
```

Não há justificativa atual para adicionar um array global `types` ao `tsconfig`, pois isso poderia restringir a descoberta de tipos sem resolver um problema existente.

### 4.3 `skipLibCheck`

`skipLibCheck: true` já existia antes desta rodada. Ele não foi introduzido ou ampliado para preparar a atualização.

No experimento com TypeScript 6:

- não se deve adicionar `ignoreDeprecations` apenas para fazer o gate passar;
- não se deve relaxar regras estritas;
- incompatibilidades reais devem ser identificadas e corrigidas;
- qualquer revisão de `skipLibCheck` deve constituir decisão própria, sem ser misturada à atualização do compilador.

### 4.4 Conclusão

**Nenhuma alteração no `tsconfig.json` é necessária antes do experimento com TypeScript 6.**

A melhor preparação foi preservar uma configuração explícita, moderna e atualmente aprovada pelo compilador, em vez de adicionar opções preventivas sem erro comprovado.

## 5. Limites preservados

A Rodada 3.2 não altera:

- TypeScript 5.9.3;
- dependências executadas no produto;
- comportamento funcional;
- layout;
- autenticação;
- cache, Realtime ou mutations;
- banco, migrations, RLS ou dados;
- configuração remota do Supabase;
- publicação de Production.

## 6. Validação obrigatória

Antes do merge, o PR deve concluir:

- `npm ci` com o lockfile regenerado;
- `npm run check:docs`;
- auditoria de vulnerabilidades;
- verificação de assinaturas e proveniência;
- lint;
- 365 testes ou a quantidade vigente;
- cobertura;
- TypeScript 5.9.3 e build Vite;
- orçamento do bundle;
- inspeção do bundle público;
- Playwright desktop e mobile;
- novo diagnóstico Knip confirmando a retirada dos dez exports internos.

## 7. Continuidade

Depois da aprovação desta rodada, o próximo passo técnico pode ser o experimento isolado com TypeScript 6.

A Rodada 3.2 não autoriza esse experimento por inferência. A mudança do compilador deve possuir branch e PR próprios, versão exata, ausência de refatoração funcional paralela, gate integral e decisão explícita de integração.
