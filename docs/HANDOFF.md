# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **2026-07-21 — execução do Plano Mestre v1.0, Ciclo 1**

## Estado da execução

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| `main` remota observada | `71794f6` (Ciclo 0 mesclado pelo PR #36) |
| SHA auditado no plano | `ca9c783b` |
| Branch do Ciclo 1 | `fix/remover-dados-bundle-ciclo-1` |
| Produção conhecida | `https://demandas-rhsme-expansao.vercel.app/` |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, ativo e saudável |
| Plano versionado | SHA-256 `C78B6F7FE840BBFC6B32F401D27B609681C1881CB146B25E72E8905F36AA0B87` |

O Ciclo 1 retira o acervo administrativo do grafo do cliente, limita o modo local a dados sintéticos de desenvolvimento e bloqueia esse modo em produção. Nenhum registro remoto, migration, variável de produção ou deployment histórico foi alterado durante a implementação local.

## Ciclo 1 — retirada de dados reais do bundle público

- o acervo administrativo original foi movido de `src/data/initialDemandas.ts` para `scripts/bootstrap/initial-demandas.json`;
- `src/data/demoDemandas.ts` fornece oito registros fictícios com prefixo `DEMO-` e usuários de demonstração;
- o bootstrap Node lê JSON e valida schema estrito antes de importar;
- `resolveAppConfig` recusa `VITE_APP_MODE=local` quando `PROD=true`;
- `scripts/check-public-bundle.mjs` compara os 50 identificadores administrativos com todos os arquivos de `dist/assets` sem imprimir o conteúdo protegido;
- o gate `check` executa essa varredura depois do build.

### Gate técnico do Ciclo 1

| Comando | Resultado |
|---|---|
| testes RED focados | 5 falhas esperadas antes da implementação |
| testes focados após implementação | PASS, 6 arquivos e 37 testes |
| `npm run check:full` | PASS |
| `npm audit --audit-level=high` | PASS, zero vulnerabilidades |
| `npm audit signatures` | PASS |
| `npm run lint` | PASS |
| `npm run test:coverage` | PASS, 35 arquivos e 164 testes |
| `npm run build` | PASS |
| `npm run check:bundle` | PASS, crescimento de 7,98%, abaixo do limite de 15% |
| `npm run check:public-bundle` | PASS, 29 arquivos contra 50 identificadores administrativos |
| `npm run test:e2e` | PASS, 18 testes desktop/mobile |

### Gate de consciência do produto — Ciclo 1

- **Pessoa:** qualquer visitante não autenticado e os responsáveis pela confidencialidade do acervo administrativo.
- **Dor atual:** o bundle público incorporava 50 demandas administrativas e a produção podia ser forçada ao modo local.
- **Ganho:** produção baixa somente o cliente Supabase; desenvolvimento local continua funcional com oito registros sintéticos.
- **Proteção:** autenticação Supabase, bootstrap privado, busca, exportação Excel, responsividade e contratos de persistência foram preservados.
- **Prova além dos testes:** a varredura do build comparou todos os números administrativos e aprovou com zero ocorrências.

### Inventário de deployments anteriores

Antes da publicação do Ciclo 1, o CLI da Vercel listou 81 deployments históricos: 52 em estado `Ready`, 27 cancelados e 2 com erro. Todos os 52 deployments servíveis antecedem esta correção e foram classificados como vulneráveis pelo grafo cliente da versão correspondente. A verificação direta do alias de Production confirmou os 50 identificadores administrativos nos três assets referenciados pela página.

Nenhum deployment foi apagado. A remoção dos 52 deployments legados permanece adiada para o Ciclo 13 e depende de autorização destrutiva específica, conforme o Plano Mestre.

## Reconciliação da `main`

Entre o SHA auditado e a `main` atual houve somente:

- remoção do import de `brand-overrides.css` e ajuste de formatação em `src/main.tsx`;
- restauração de `git.deploymentEnabled: false` em `vercel.json`.

Essas mudanças não afetam os contratos ou arquivos funcionais dos Ciclos 0 e 1. Não foi identificado conflito material com o Plano Mestre.

## Linha de base remota

As consultas foram agregadas e somente leitura; nenhum registro operacional foi impresso ou alterado.

| Dimensão | Plano | Verificação atual | Divergência |
|---|---:|---:|---:|
| Demandas | 379 | 379 | 0 |
| Históricos | 385 | 385 | 0 |
| Perfis | 5 | 5 | 0 |
| Vencidas aparentes | 23 | 23 | 0 |
| Sem prazo final | 354 | 354 | 0 |
| Sem prazo interno | 369 | 369 | 0 |
| Somente evento inicial | 376 | 376 | 0 |
| Status `Tramitado` | 262 | 262 | 0 |
| Responsáveis textuais distintos | 16 | 16 | 0 |

## Gate técnico inicial

| Comando | Resultado |
|---|---|
| `npm ci` | PASS |
| `npm audit --audit-level=high` | PASS, zero vulnerabilidades |
| `npm audit signatures` | PASS |
| `npm run lint` | PASS |
| `npm run test:coverage` | PASS, 33 arquivos e 158 testes |
| `npm run build` | PASS |
| `npm run check:bundle` | PASS |
| `npm run test:e2e` | PASS, 18 testes desktop/mobile |

## Documentação do Ciclo 0

- `AGENTS.md`: leitura obrigatória, disciplina de ciclos, validações, proibições e gate de produto.
- `docs/PRODUCT_CONTEXT.md`: pessoas, dores, cenários, vocabulário, decisões, experiência por papel e regressões proibidas.
- `docs/execution/Plano_Mestre_Execucao_CTRH_v1.0.md`: cópia integral conferida por hash.
- `docs/superpowers/specs/2026-07-22-central-trabalho-ctrh-design.md`: arquitetura, reconciliação, segurança, ordem de entrega e validação.
- `docs/adr/ADR-001-semantica-status-carteira.md`: seis status e categorias operacionais.
- `docs/adr/ADR-002-prazos-proxima-acao.md`: três situações de prazo e agenda obrigatória.
- `docs/adr/ADR-003-historico-e-exclusao-logica.md`: eventos auditáveis e remoção recuperável.

## Gate de consciência do produto — Ciclo 0

- **Pessoa:** responsável pelo produto e qualquer agente ou pessoa que continue a evolução.
- **Dor atual:** decisões estavam distribuídas entre código, documentos antigos e histórico de conversa, permitindo reinterpretação de status, prazo e responsabilidade.
- **Ganho:** a próxima sessão encontra contexto, decisões, exemplos, comandos e paradas no próprio repositório antes de alterar comportamento.
- **Proteção:** nenhuma busca, rota, dado, permissão, tela, exportação ou comportamento foi modificado.
- **Prova além dos testes:** a cópia do plano tem hash idêntico; os ADRs não possuem alternativas abertas; os caminhos citados existem; a linha de base do banco foi repetida sem divergência.

## Supabase CLI e acesso administrativo

`npx supabase@2.109.1 init` foi executado, criando `supabase/config.toml` e `supabase/.gitignore` sem segredos. A leitura remota foi realizada pelo conector oficial autenticado do Supabase. O OAuth do CLI em ambiente não interativo exige confirmação humana no navegador; uma janela interativa foi aberta para esse fluxo. O vínculo local deve ser confirmado com:

```bash
npx supabase link --project-ref kdhekkzwcokfrpcrsllr
```

Nenhuma migration foi aplicada no Ciclo 0.

## Vercel

O CLI Vercel 56.4.1 foi autenticado e o diretório local foi vinculado explicitamente a `wilson-m-peixotos-projects/demandas-rhsme-expansao`. Metadados locais, inclusive o token OIDC temporário, permanecem em arquivos ignorados pelo Git. Nenhuma variável de produção ou deployment foi alterado durante a linha de base.

## Próximo ciclo autorizado após merge

**Ciclo 2 — Semântica única e filtros tipados.**

Precondições:

1. PR do Ciclo 1 aprovado e mesclado, salvo autorização explícita de branch dependente;
2. nova branch exclusiva para o Ciclo 2;
3. releitura de `AGENTS.md`, contexto, plano e ADRs;
4. testes RED das regras semânticas e dos filtros tipados;
5. nenhuma alteração no banco prevista para esse ciclo.
