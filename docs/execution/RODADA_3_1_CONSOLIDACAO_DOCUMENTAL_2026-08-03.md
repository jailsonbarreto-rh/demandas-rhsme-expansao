# Rodada 3.1 — Consolidação documental pós-TanStack Query

**Data:** 3 de agosto de 2026  
**Branch:** `docs/rodada-3-1-consolidacao-documental`  
**Base:** `main` em `15aa5c049c3c7122db365eec6a2e9f629e3c38ea`  
**Natureza:** documentação e governança técnica; sem alteração funcional

## 1. Motivo

O PR #115 permaneceu aberto sobre uma base anterior enquanto as Rodadas técnicas 1, 2 e 3 foram efetivamente executadas e publicadas. Como resultado, os documentos daquele PR ainda apresentavam como candidatos itens já concluídos, entre eles Playwright, Supabase JavaScript, JSDOM, Node 24, Knip e TanStack Query.

A Rodada 3.1 corrige essa divergência sem reabrir decisões funcionais e sem alterar banco, dados, RLS, migrations ou comportamento do produto.

## 2. Escopo executado neste PR documental

- criação do Plano Consolidado de Manutenção e Modernização v1.1;
- criação da Política de Manutenção de Dependências e Modernização Tecnológica v1.1;
- criação do Registro de Oportunidades Técnicas e de Modernização v1.1;
- documentação da arquitetura TanStack Query atualmente publicada;
- atualização do `AGENTS.md`;
- atualização do Handoff;
- atualização do Histórico Documental;
- formalização da regra de modernização proativa;
- registro da substituição documental do conteúdo proposto no PR #115;
- alinhamento do workflow principal de PRs para executar `npm run check:docs` após `npm ci`.

## 3. Regra de modernização proativa

A regra aprovada para continuidade do projeto é:

> Sempre que uma correção, melhoria de layout, nova funcionalidade, investigação de erro ou outra tarefa puder alcançar resultado materialmente melhor por meio de atualização, instalação ou ampliação tecnológica, o executor deve apresentar essa alternativa ao responsável pelo produto antes da implementação.

A regra possui limites expressos:

- não autoriza instalação silenciosa;
- não transforma recomendação em decisão automática;
- exige benefício concreto e proporcional;
- exige análise de compatibilidade, segurança, privacidade, dados, bundle, testes, manutenção e rollback;
- não permite instalar pacote apenas por novidade;
- não permite manter solução inferior apenas para evitar avaliar tecnologia adequada;
- não bloqueia correção imediata segura quando ela puder prosseguir independentemente da modernização.

## 4. Estado atualizado das rodadas

| Rodada | Estado |
|---|---|
| Rodada 1 | concluída e publicada |
| Rodada 2 | concluída e publicada |
| Correção responsiva intermediária | concluída e publicada |
| Rodada 3 — TanStack Query | concluída e publicada |
| Rodada 3.1 — documentação | objeto deste PR |
| Rodada 4 — TypeScript 6 | candidata futura, não autorizada automaticamente |

## 5. Documentação TanStack Query

A nova referência arquitetural registra:

- `QueryClient` e opções padrão;
- contexto e cliente alternativo por repositório;
- chaves de carteira e lixeira por UUID;
- consulta principal;
- consulta administrativa da lixeira;
- mutations confirmadas;
- invalidação seletiva;
- integração com Supabase Realtime;
- agrupamento de eventos em 100 ms;
- limpeza de cache na troca de sessão;
- recuperação de conectividade;
- tratamento seguro de erros;
- testes obrigatórios;
- limites não autorizados, como optimistic updates e persistência de cache.

## 6. Correção do gate documental no CI

A inspeção do workflow `.github/workflows/dependency-health.yml` identificou uma divergência entre a governança declarada e a automação efetiva:

- `npm run check:docs` já fazia parte do comando consolidado `npm run check`;
- `AGENTS.md` e a Política de Sincronização Documental já o definiam como validação obrigatória;
- o workflow principal dos pull requests executava instalação, auditoria, lint, testes, build, bundle e navegador, mas não executava o gate documental.

A Rodada 3.1 acrescenta ao workflow, imediatamente após `npm ci`:

```yaml
- name: Run documentation consistency gate
  run: npm run check:docs
```

Essa mudança:

- não cria uma nova regra de governança;
- apenas automatiza uma obrigação já vigente;
- não altera pacote, runtime, banco ou comportamento do produto;
- impede que PRs futuros sejam aprovados com cadeia documental incoerente;
- falha cedo, antes dos gates mais caros, quando existir divergência documental.

O gate foi executado no próprio PR e aprovado.

## 7. PR técnico separado

Para preservar isolamento e rollback, os itens abaixo não integram este PR documental:

- extração da string `demandas:retry` para constante compartilhada;
- execução de `npm run analyze:unused`;
- análise manual dos achados do Knip;
- registro de falsos positivos e oportunidades reais;
- eventuais limpezas pequenas, cada uma sujeita a avaliação própria.

Esses itens serão tratados em branch e PR separados depois da aprovação da consolidação documental.

## 8. Fora do escopo

- nova dependência;
- atualização de versão;
- mudança de código funcional;
- mudança de interface;
- alteração do comportamento de cache;
- banco, migrations, RLS ou dados;
- mudança de autorização funcional;
- publicação em Production;
- TypeScript 6.

## 9. Documentos criados

- `docs/execution/PLANO_CONSOLIDADO_MANUTENCAO_MODERNIZACAO_CTRH_v1.1.md`;
- `docs/product/POLITICA_MANUTENCAO_DEPENDENCIAS_CTRH_v1.1.md`;
- `docs/product/REGISTRO_OPORTUNIDADES_TECNICAS_MODERNIZACAO_CTRH_v1.1.md`;
- `docs/architecture/ARQUITETURA_TANSTACK_QUERY_CTRH_v1.0.md`;
- este relatório.

## 10. Arquivos atualizados

- `.github/workflows/dependency-health.yml`;
- `AGENTS.md`;
- `docs/HANDOFF.md`;
- `docs/execution/HISTORICO_DOCUMENTAL_CTRH.md`.

## 11. Rollback

O rollback consiste em reverter este PR. Não existe rollback de banco, dados, interface ou deployment porque este pacote não os altera.

## 12. Continuidade

Após a integração deste PR:

1. encerrar o PR #115 sem merge, com referência ao substituto;
2. criar o PR técnico pequeno da constante compartilhada;
3. executar e analisar o Knip sem autofix;
4. atualizar o relatório técnico com os achados;
5. somente depois avaliar a proposta isolada de TypeScript 6.
