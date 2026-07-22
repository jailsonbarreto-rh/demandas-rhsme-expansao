# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **2026-07-21 — execução do Plano Mestre v1.0, Ciclo 0**

## Estado da execução

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| `main` remota observada | `1b8a61219dddd52edbb62fbe451bcd6ed066388c` |
| SHA auditado no plano | `ca9c783b` |
| Branch do Ciclo 0 | `docs/central-trabalho-gate-0` |
| Produção conhecida | `https://demandas-rhsme-expansao.vercel.app/` |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, ativo e saudável |
| Plano versionado | SHA-256 `C78B6F7FE840BBFC6B32F401D27B609681C1881CB146B25E72E8905F36AA0B87` |

O Ciclo 0 não altera comportamento, banco, dados ou deployments. Ele torna persistentes o contexto de produto, as decisões fixadas, a ordem de execução e os gates obrigatórios.

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

**Ciclo 1 — Retirar dados reais do bundle público.**

Precondições:

1. PR do Ciclo 0 aprovado e mesclado, salvo autorização explícita de branch dependente;
2. nova branch exclusiva para o Ciclo 1;
3. releitura de `AGENTS.md`, contexto, plano e ADRs;
4. testes RED do bundle e do bloqueio de modo local em produção;
5. nenhuma alteração no banco e nenhuma exclusão de deployment histórico.
