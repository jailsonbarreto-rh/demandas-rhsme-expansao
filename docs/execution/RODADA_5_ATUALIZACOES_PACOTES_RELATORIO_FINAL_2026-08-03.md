# Rodada 5 — Atualizações de pacotes — Relatório final

**Data:** 3 de agosto de 2026  
**Branch:** `chore/rodada-5-atualizacoes-pacotes`  
**Pull request:** #143  
**Natureza:** manutenção técnica de dependências, sem mudança funcional ou remota

## 1. Objetivo

Atualizar as dependências autorizadas relacionadas ao Supabase, formulários, animações, build, lint e testes, preservando a arquitetura, o comportamento do produto, o Node 24 e o TypeScript 6.0.3.

## 2. Atualizações concluídas

| Pacote | Versão anterior | Versão integrada | Função no CTRH |
|---|---:|---:|---|
| `@supabase/supabase-js` | 2.110.9 | 2.112.0 | autenticação, consultas, Realtime e integração com o Supabase |
| `react-hook-form` | 7.83.0 | 7.84.0 | estado e submissão dos formulários |
| `@hookform/resolvers` | 5.5.7 | 5.7.1 | integração entre React Hook Form e Zod |
| `motion` | 12.42.2 | 12.43.0 | animações e transições da interface |
| `vite` | 8.1.5 | 8.2.0 | desenvolvimento e build de produção |
| `@testing-library/jest-dom` | 6.9.1 | 7.0.0 | matchers semânticos para testes do DOM |

Todas as versões foram registradas de forma exata no `package.json`. O `package-lock.json` foi regenerado pelo npm 11.16.0 sob Node 24.18.0, sem edição manual.

## 3. ESLint 10 — atualização não integrada por incompatibilidade oficial

A atualização de `eslint` e `@eslint/js` para 10.8.0 foi tentada sem flags de contorno. O npm recusou a árvore com `ERESOLVE` porque `eslint-plugin-jsx-a11y` 6.10.2 declara suporte oficial apenas até ESLint 9.

O repositório oficial do plugin ainda não publicou uma versão estável compatível com ESLint 10. Existem propostas abertas de implementação, mas nenhuma versão publicada que possa ser adotada como dependência estável do CTRH.

Foram rejeitadas as seguintes alternativas:

- `--force`;
- `--legacy-peer-deps`;
- dependência em commit ou pull request não publicado;
- retirada do plugin de acessibilidade;
- redução das regras de acessibilidade;
- manutenção de uma árvore marcada como inválida pelo npm.

Por isso, permaneceram:

- `eslint` 9.39.5;
- `@eslint/js` 9.39.5;
- `eslint-plugin-jsx-a11y` 6.10.2;
- `eslint-plugin-react-hooks` 7.1.1;
- `typescript-eslint` 8.65.0.

A atualização do ESLint 10 permanece condicionada à publicação de suporte estável pelo plugin de acessibilidade.

## 4. Plataforma preservada

- Node: `24.x`; runner validado com Node 24.18.0;
- `@types/node`: 24.13.3;
- TypeScript: 6.0.3;
- React: 19.2.8;
- TypeScript ESLint: 8.65.0;
- nenhuma alteração em `tsconfig.json`;
- nenhuma alteração em código-fonte;
- nenhuma alteração em configuração funcional do Vite;
- nenhuma alteração em regras de negócio.

## 5. Validação da árvore

O `npm ci` instalou 576 pacotes e auditou 577 pacotes com:

- zero vulnerabilidades;
- 576 assinaturas de registro verificadas;
- 159 attestations verificadas;
- árvore deduplicada e válida;
- nenhuma flag de resolução forçada.

A árvore confirmou:

- Supabase JavaScript 2.112.0;
- React Hook Form 7.84.0 compartilhado pelo resolver 5.7.1;
- Vite 8.2.0 compartilhado pelo plugin React e pelo Vitest;
- ESLint 9.39.5 compartilhado pelos plugins de acessibilidade, React Hooks e TypeScript;
- TypeScript 6.0.3 compartilhado pelo typescript-eslint;
- `@types/node` 24.13.3 compartilhado pelo Vite e Vitest.

## 6. Gate de qualidade

### Documentação

- nove testes de coerência documental aprovados;
- cadeia canônica de estratégia, execução e governança aprovada.

### Compatibilidade transitiva

Três testes aprovados:

- API `expand` nas duas instâncias consumidoras;
- expansão de chaves nas duas instâncias de minimatch;
- criação e serialização de arquivos pelo ExcelJS.

### Lint

- ESLint 9.39.5 aprovado;
- zero warnings permitidos;
- cobertura de acessibilidade JSX preservada.

### Testes unitários e de integração

- 80 arquivos de teste aprovados;
- 365 testes aprovados;
- duração: 126,73 segundos.

Cobertura global:

| Métrica | Cobertura |
|---|---:|
| Statements | 79,78% |
| Branches | 73,93% |
| Functions | 81,90% |
| Lines | 82,54% |

Foram aprovados especificamente os testes de:

- login, sessão e recuperação de senha;
- Supabase e repositórios;
- Realtime e TanStack Query;
- formulários e Zod;
- administração e permissões;
- histórico e mutações auditáveis;
- busca, filtros e rotas;
- acessibilidade e Error Boundaries;
- exportação Excel;
- migrations como contratos estáticos.

### Build e bundle

- TypeScript 6.0.3 aprovado;
- Vite 8.2.0 aprovado;
- 803 módulos transformados;
- build concluído em 968 ms no runner;
- bundle inicial: 220.300 bytes;
- 54,79% abaixo da linha de base;
- limite aprovado: 560.330 bytes;
- inspeção pública: 41 arquivos contra 50 identificadores administrativos, aprovada.

O aviso do Vite sobre chunk grande permanece relacionado ao módulo de exportação Excel carregado separadamente. O gate de bundle aprovado confirma que o carregamento inicial permanece dentro do orçamento estabelecido.

### Knip

Nenhum novo problema foi introduzido. Permanecem os mesmos oito símbolos classificados e preservados:

Exports:

- `isLegacyDeadlineCompletion`;
- `canPreserveMissingDeadline`;
- `canUseDeadlineStateAfterRegistration`;
- `getPrazoFinalSemantics`.

Tipos exportados:

- `DatabaseR4`;
- `Json`;
- `DeadlineValue`;
- `PrazoSemantics`.

Não foram apontados arquivos não utilizados, dependências não utilizadas, dependências ausentes ou imports não resolvidos.

### Playwright

- 42 cenários aprovados;
- desktop e mobile;
- duração: 3,6 minutos;
- zero falhas;
- relatório de falha não gerado por não haver falha.

Foram validados:

- acessibilidade do login, recuperação, visão geral, demandas, administração, diálogos e drawer;
- camadas de modal e drawer;
- recuperação de senha;
- carteiras pessoal e geral;
- registro de andamento e reabertura;
- tabela responsiva em monitor amplo, notebook e viewport estreito;
- rotas, filtros e URL legada;
- busca avançada, sugestões, atalhos e período;
- fluxos críticos sem erros ou overflow;
- formulários de edição e nova demanda.

## 7. Avisos transitivos preservados

O `npm ci` ainda informa depreciações transitivas em:

- `inflight`;
- `rimraf` 2;
- `lodash.isequal`;
- `glob` 7;
- `fstream`.

Esses pacotes não são dependências diretas do CTRH. O audit permaneceu em zero vulnerabilidades, e a rodada não ampliou o escopo para substituir cadeias transitivas sem benefício ou migração comprovados.

## 8. Limites preservados

A rodada não alterou:

- código-fonte;
- comportamento da interface;
- regras de negócio;
- banco de dados;
- migrations;
- RLS;
- dados;
- autenticação remota;
- perfis ou permissões;
- cache ou estratégia TanStack Query;
- Realtime;
- variáveis remotas;
- configuração da Vercel;
- Production.

## 9. Publicação

Não foi realizado deploy de Production. As alterações são de dependências e build, sem funcionalidade nova. O próximo deploy funcional que partir da `main` utilizará automaticamente as versões integradas.

## 10. Rollback

O rollback é realizado pela reversão do PR #143. Como não houve mudança remota, não existe rollback de banco, dados, RLS, Supabase ou Vercel.

## 11. Resultado

A Rodada 5 concluiu todas as atualizações autorizadas que possuem árvore estável e oficialmente compatível. O ESLint 10 foi corretamente interrompido no ponto de incompatibilidade comprovada, preservando a instalação reproduzível e a fiscalização de acessibilidade.
