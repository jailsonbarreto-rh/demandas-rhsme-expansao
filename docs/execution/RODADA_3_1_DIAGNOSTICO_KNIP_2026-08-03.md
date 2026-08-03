# Rodada 3.1 — Diagnóstico manual do Knip

**Data:** 3 de agosto de 2026  
**Branch:** `refactor/rodada-3-1-query-event-knip`  
**Base:** `main` em `343871ffa32cf30f6cddded6b49d83ec05e2d64a`  
**Comando:** `npm run analyze:unused`  
**Modo:** diagnóstico, `--no-exit-code`, sem autofix

## 1. Finalidade

Verificar se a modernização recente deixou arquivos, dependências, exports ou tipos obsoletos e registrar o resultado sem produzir exclusões automáticas.

A execução foi realizada pelo GitHub Actions no run `30782584780`. O relatório foi preservado no artefato `rodada-3-1-knip-report`, ID `8844162069`, digest `sha256:c9852d35e0bcc6f43785a65f0417e3427f0afa24020b894a87e2ef2cf336e7d8`.

## 2. Resultado bruto

O Knip não apresentou:

- arquivos não utilizados;
- dependências não utilizadas;
- dependências não listadas;
- executáveis não resolvidos;
- imports não resolvidos;
- duplicidade de exports;
- problemas de configuração.

Foram apresentados 18 símbolos exportados sem consumidor externo detectado:

### Valores, funções ou classes

- `deadlineEquals`;
- `isLegacyDeadlineCompletion`;
- `canPreserveMissingDeadline`;
- `canUseDeadlineStateAfterRegistration`;
- `buildDemandSearchDocument`;
- `ConfigurationError`;
- `OPERATIONAL_TIME_ZONE`;
- `getPrazoFinalSemantics`;
- `deadlineStateValues`.

### Tipos

- `ErrorBoundaryAction`;
- `ResponsibleLinkState`;
- `TemporalSignalKind`;
- `DatabaseR4`;
- `Json`;
- `PeriodField`;
- `DemandSearchMatchKind`;
- `DeadlineValue`;
- `PrazoSemantics`.

## 3. Método de análise manual

Cada achado foi confrontado com:

- uso dentro do próprio módulo;
- imports em outros módulos;
- composição de interfaces exportadas;
- função arquitetural do arquivo;
- natureza gerada ou manual do contrato;
- relação com legado, preservação informacional e trabalhos futuros;
- risco de remoção ou redução de visibilidade.

O fato de um símbolo estar listado pelo Knip não significa, por si só, que possa ser apagado.

## 4. Classificação A — símbolo usado internamente, mas exportado sem necessidade atual

Os dez símbolos abaixo possuem uso real dentro do próprio módulo ou compõem contratos usados pelo módulo, mas não são importados por outro arquivo:

| Símbolo | Arquivo | Uso atual | Tratamento recomendado |
|---|---|---|---|
| `deadlineEquals` | `src/domain/deadlineRules.ts` | helper de `requiresDeadlineChangeJustification` | retirar somente `export` em limpeza própria |
| `buildDemandSearchDocument` | `src/search/demandSearch.ts` | helper de `matchDemandSearch` | retirar somente `export` |
| `ConfigurationError` | `src/services/createAppServices.ts` | erro lançado por `createAppServices` | retirar somente `export` |
| `OPERATIONAL_TIME_ZONE` | `src/utils/date.ts` | usado por `getTodayString` | retirar somente `export`, preservando valor e comportamento |
| `deadlineStateValues` | `src/validation/demandaSchemas.ts` | usado pelo schema de edição | retirar somente `export` |
| `ErrorBoundaryAction` | `src/components/ErrorBoundary.tsx` | tipo de `secondaryAction` | retirar somente `export` |
| `ResponsibleLinkState` | `src/domain/governanceAnalytics.ts` | tipo interno da distribuição por responsável | retirar somente `export` |
| `TemporalSignalKind` | `src/domain/temporalSignals.ts` | tipo interno de `TemporalSignal.kind` | retirar somente `export` |
| `PeriodField` | `src/search/periodFilter.ts` | tipo interno de `PeriodFilter.field` | retirar somente `export` |
| `DemandSearchMatchKind` | `src/search/searchTypes.ts` | tipo interno de `DemandSearchMatch.matchKind` | retirar somente `export` |

### Conclusão da classificação A

Não são códigos mortos. O problema é apenas exposição pública maior do que a necessária.

A redução de visibilidade é de baixo risco, mas não foi executada neste PR para preservar o escopo de diagnóstico e evitar misturar limpeza adicional com a constante compartilhada.

## 5. Classificação B — símbolos sem uso no runtime atual

Sete símbolos não possuem consumidor externo e também não participam de um fluxo ativo, salvo dependência entre símbolos igualmente sem uso:

| Símbolo | Arquivo | Leitura técnica | Decisão nesta rodada |
|---|---|---|---|
| `isLegacyDeadlineCompletion` | `src/domain/deadlineRules.ts` | regra auxiliar não chamada pelo produto atual | manter até revisão específica do domínio de prazos legados |
| `canPreserveMissingDeadline` | `src/domain/deadlineRules.ts` | chamado apenas por outro helper sem uso | manter junto do item seguinte até revisão específica |
| `canUseDeadlineStateAfterRegistration` | `src/domain/deadlineRules.ts` | não chamado pelo produto atual | candidato a remoção após confirmar que não será usado na próxima etapa de legado |
| `getPrazoFinalSemantics` | `src/utils/date.ts` | apresentação antiga não consumida; a aplicação usa sinais temporais por outros caminhos | forte candidato a remoção em PR isolado |
| `PrazoSemantics` | `src/utils/date.ts` | existe apenas como retorno do helper anterior | remover junto com `getPrazoFinalSemantics`, se aprovado |
| `DatabaseR4` | `src/lib/database.r4.types.ts` | extensão manual do contrato R4 sem import atual detectado | revisar contra geração de tipos e scripts antes de excluir o arquivo |
| `DeadlineValue` | `src/types.ts` | modelo agregado de prazo não usado pela estrutura atual de `Demanda` | revisar contra planos de evolução de prazos antes de remover |

### Conclusão da classificação B

Existem sinais de código ou contratos possivelmente obsoletos, mas a remoção não é automática.

Os helpers de prazo legado e o tipo `DeadlineValue` tocam um domínio sujeito ao princípio de preservação informacional. O arquivo `database.r4.types.ts` toca contratos com o Supabase. Por isso, devem ser tratados em limpeza separada, com testes e revisão documental próprios.

O par `getPrazoFinalSemantics` e `PrazoSemantics` apresenta o indício mais forte de obsolescência simples, pois não possui consumidor e a semântica temporal vigente já está concentrada em `temporalSignals.ts`.

## 6. Classificação C — export intencional de contrato de banco

| Símbolo | Arquivo | Decisão |
|---|---|---|
| `Json` | `src/lib/database.types.ts` | preservar |

`Json` integra o contrato tipado do banco. Mesmo sem import atual, é um tipo padrão e reutilizável da representação do esquema. Sua remoção manual criaria divergência desnecessária do contrato de dados e poderia reaparecer em futura regeneração.

Este item é tratado como exposição intencional, não como dívida a remover.

## 7. Dependências e imports

### Dependências

Nenhuma dependência de produção ou desenvolvimento foi apontada como não utilizada.

Portanto, a Rodada 3.1 não identificou pacote antigo que deva ser desinstalado.

### Imports

O diagnóstico não apresentou import não resolvido ou import de pacote ausente. Lint, TypeScript e build permanecem responsáveis por confirmar a coerência dos imports durante o gate final.

## 8. Constante compartilhada de recuperação

A duplicação literal de `demandas:retry` foi removida por meio de:

```ts
export const DEMANDAS_QUERY_RETRY_EVENT = 'demandas:retry';
```

Arquivo: `src/query/queryEvents.ts`.

O Header emite o evento usando a constante compartilhada e `useDemandasData` registra e remove o listener com a mesma constante. O valor e o comportamento permanecem inalterados.

## 9. Recomendações posteriores

### Limpeza A — redução de exports

Criar PR pequeno para retirar somente o modificador `export` dos dez símbolos da classificação A.

Características:

- nenhum comportamento alterado;
- nenhum símbolo apagado;
- risco baixo;
- gate completo obrigatório;
- novo diagnóstico Knip para comprovar redução dos achados.

### Limpeza B — código sem consumidor

Avaliar em unidades separadas:

1. apresentação antiga de prazo: `getPrazoFinalSemantics` e `PrazoSemantics`;
2. helpers de preservação de prazo legado;
3. `DeadlineValue`;
4. `database.r4.types.ts` e `DatabaseR4`.

Cada unidade deve confirmar ausência de dependência documental, teste, script, migration ou plano próximo antes da remoção.

## 10. Decisão desta rodada

A Rodada 3.1:

- não remove arquivos;
- não remove dependências;
- não apaga exports;
- não altera contratos de banco;
- não executa autofix;
- registra os achados e separa manutenção segura de decisões que exigem avaliação adicional.

A conclusão correta é:

> Não foram encontradas dependências, arquivos ou imports obsoletos. Foram encontrados dez exports com visibilidade maior do que a necessária, sete símbolos sem uso no runtime atual que exigem revisão específica antes de remoção e um tipo de contrato de banco que deve ser preservado.

## 11. Continuidade

Depois do merge deste PR, a Rodada 3.1 estará concluída. As limpezas sugeridas não se tornam automaticamente autorizadas e não bloqueiam a avaliação posterior do TypeScript 6.
