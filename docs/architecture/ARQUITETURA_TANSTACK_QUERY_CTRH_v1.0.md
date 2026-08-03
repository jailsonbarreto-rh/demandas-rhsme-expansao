# Arquitetura TanStack Query — CTRH v1.0

**Data:** 3 de agosto de 2026  
**Status:** VIGENTE  
**Implementação de referência:** PR #132  
**Versão:** `@tanstack/react-query` 5.101.4

## 1. Finalidade

Documentar como o TanStack Query participa do carregamento, cache, atualização, mutações e recuperação de conectividade da Central de Demandas CTRH.

Este documento descreve a implementação efetivamente integrada e publicada. Não cria autorização para alterar comportamento, regras de negócio, Supabase, RLS, migrations ou dados.

## 2. Responsabilidades arquiteturais

O TanStack Query coordena:

- consulta da carteira de demandas e do histórico;
- consulta administrativa da lixeira;
- deduplicação de consultas simultâneas;
- cache em memória separado por sessão;
- estados de carregamento e atualização em segundo plano;
- mutations de criação, edição, andamento, status e exclusão lógica;
- invalidação após confirmação do repositório;
- atualização acionada por eventos do Supabase Realtime;
- nova tentativa explícita após falha de conectividade;
- remoção de cache na troca de usuário ou logout.

O TanStack Query não substitui:

- o Supabase como fonte de verdade;
- as RPCs e regras de autorização do banco;
- o repositório de dados;
- as regras de negócio;
- o histórico auditável;
- a RLS;
- o estado de navegação e filtros da interface.

## 3. QueryClient

O arquivo `src/query/queryClient.ts` cria o cliente principal.

Configuração vigente:

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});
```

### 3.1 Justificativas

- `retry: false` em queries evita tentativas silenciosas sucessivas e mantém erro visível e recuperável pelo usuário.
- `retry: false` em mutations evita repetir automaticamente operações capazes de produzir gravação duplicada.
- `staleTime: 30_000` permite reutilização breve dos dados sem recarga imediata.
- `gcTime: 5 minutos` limita a permanência de consultas inativas em memória.
- `refetchOnWindowFocus: false` evita recargas inesperadas ao alternar janelas.
- `refetchOnReconnect: true` permite recuperação quando a rede volta.

## 4. Instância principal e contexto

`src/main.tsx` cria uma única instância principal e envolve a aplicação com `QueryClientProvider`.

O projeto também mantém `DemandasQueryClientContext` para disponibilizar explicitamente o mesmo cliente à camada de dados.

Quando `useDemandasData` é executado fora da raiz normal da aplicação — especialmente em componentes isolados e testes — é criado um cliente por instância de repositório, armazenado em `WeakMap`. Isso evita compartilhamento acidental entre repositórios e preserva isolamento dos testes.

## 5. Chaves de consulta

As chaves vigentes são:

```ts
export const demandasQueryKeys = {
  root: ['demandas'],
  session: (userId: string) => ['demandas', 'session', userId],
  trash: (userId: string) => ['demandas', 'trash', userId],
};
```

### 5.1 Regra de isolamento

O UUID do usuário integra a chave da carteira e da lixeira.

Consequências:

- duas sessões não compartilham o mesmo cache lógico;
- a troca de usuário não pode reapresentar dados da sessão anterior;
- invalidações atingem somente o usuário relacionado;
- carteira e lixeira permanecem consultas distintas.

Quando não existe usuário autenticado, a query da carteira fica desabilitada.

## 6. Consulta principal

`useDemandasData` executa `repository.load()` por `useQuery`.

O retorno contém:

- `demandas`;
- `historico`.

A camada converte erros técnicos em mensagem segura por `getUserFacingError`.

Estados expostos à aplicação:

- `loading`: primeira carga de sessão;
- `refreshing`: atualização em segundo plano com dados anteriores preservados;
- `error`: erro de query ou mutation;
- `reload`: nova tentativa explícita.

## 7. Consulta da lixeira

A lixeira é carregada sob demanda por `queryClient.fetchQuery`.

Características:

- chave própria por usuário;
- `staleTime` de 30 segundos;
- não participa da consulta principal;
- é invalidada quando ocorre exclusão lógica;
- é removida na troca de usuário ou logout.

## 8. Mutations

Operações vigentes:

| Operação | Método do repositório | Cache invalidado após sucesso |
|---|---|---|
| Criar demanda | `repository.create` | carteira da sessão |
| Editar demanda | `repository.edit` | carteira da sessão |
| Registrar andamento | `repository.registerProgress` | carteira da sessão |
| Alterar status | `repository.transitionStatus` | carteira da sessão |
| Excluir logicamente | `repository.deleteLogically` | carteira e lixeira da sessão |

### 8.1 Confirmação antes da atualização

A interface aguarda a Promise do repositório.

Somente depois do sucesso ocorre a invalidação. Não existem optimistic updates.

Essa decisão preserva:

- autoridade do banco;
- confirmação real da operação;
- coerência com RPCs e regras de negócio;
- ausência de falso sucesso visual;
- tratamento claro de falhas.

## 9. Invalidação seletiva

A invalidação utiliza `exact: true` e a chave específica da sessão.

Não existe limpeza global indiscriminada de todas as queries.

A estratégia reduz recargas desnecessárias e evita efeitos entre usuários ou consultas diferentes.

## 10. Integração com Supabase Realtime

O repositório emite sinal quando o Supabase Realtime informa alteração relevante.

`useDemandasData` não processa o payload como nova fonte de dados. O evento apenas invalida a consulta da sessão, e o repositório recarrega o estado oficial.

Eventos consecutivos são agrupados por uma janela de 100 milissegundos:

```ts
const REALTIME_INVALIDATION_DELAY_MS = 100;
```

Objetivo:

- evitar várias recargas causadas por uma única operação que afete mais de uma tabela;
- preservar o Supabase como autoridade;
- impedir tempestade de invalidações;
- manter atualização rápida da interface.

O timer pendente é cancelado antes de um novo agendamento e durante o cleanup do efeito.

## 11. Troca de sessão e logout

`previousUserIdRef` acompanha a sessão anterior.

Quando o UUID muda ou deixa de existir:

1. consultas pendentes da carteira anterior são canceladas;
2. o cache da carteira anterior é removido;
3. o cache da lixeira anterior é removido;
4. erros de mutation são limpos;
5. a nova sessão inicia com chave própria.

Essa regra é obrigatória para privacidade, coerência e separação de carteiras.

## 12. Recuperação de conectividade

Quando a consulta falha, a interface apresenta estado de conexão indisponível e a ação `Tentar novamente`.

O Header emite um evento de janela. `useDemandasData` escuta o mesmo evento e executa `reload()`.

Na Rodada 3.1, o nome do evento deve ser extraído para constante compartilhada, evitando duplicação literal entre emissor e receptor. A mudança não altera o valor nem o comportamento:

```ts
'demandas:retry'
```

## 13. Tratamento de erros

Erros de consulta e mutation passam por `getUserFacingError` antes de chegar à interface.

A aplicação não deve exibir:

- nomes de tabelas ou colunas;
- mensagens brutas do Supabase, PostgREST ou PostgreSQL;
- tokens;
- UUIDs técnicos sem função operacional;
- detalhes internos de rede ou infraestrutura.

Erros de mutation são preservados separadamente do erro de consulta para que uma falha de gravação não destrua os dados já carregados.

## 14. Testes obrigatórios da arquitetura

A integração deve continuar cobrindo:

- deduplicação de consultas simultâneas;
- confirmação do repositório antes da invalidação;
- agrupamento de eventos Realtime;
- separação de cache entre usuários;
- limpeza de cache no logout;
- falha inicial e recuperação por nova tentativa;
- mutations e invalidações correspondentes;
- estados de carregamento e atualização;
- fluxo real em navegador.

Qualquer alteração em chaves, cache, Realtime, mutations ou sessão exige teste específico além do gate geral.

## 15. Limites vigentes

Não estão autorizados por esta arquitetura:

- optimistic updates;
- persistência do cache no navegador;
- cache compartilhado entre usuários;
- sincronização offline de operações;
- retries automáticos de mutation;
- uso do payload Realtime como substituto do repositório;
- Devtools em Production;
- alteração de RLS, RPCs ou dados;
- paginação remota ou infinite queries sem decisão própria.

## 16. Arquivos de referência

- `src/query/queryClient.ts`;
- `src/main.tsx`;
- `src/hooks/useDemandasData.ts`;
- `src/components/Header.tsx`;
- `src/hooks/useDemandasData.query.test.tsx`;
- `src/App.query.test.tsx`;
- `package.json`;
- `package-lock.json`.

## 17. Rollback

O rollback funcional integral corresponde à reversão do PR #132 e do lockfile associado.

Mudanças pequenas posteriores, como compartilhamento da constante do evento, devem possuir PR próprio e reversão independente.
