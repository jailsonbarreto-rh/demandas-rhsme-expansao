# PRINCÍPIO DE PRESERVAÇÃO INFORMACIONAL — CENTRAL DE DEMANDAS CTRH

**Versão:** 1.0  
**Data:** 27 de julho de 2026  
**Status:** VIGENTE  
**Base decisória:** GOV-009 e GOV-010 do Registro de Decisões de Produto

## 1. Princípio central

O SITE CTRH trabalha com dados oficiais do setor público. Nenhuma alteração de regra, migration, importação, normalização, saneamento ou mudança de interface pode apagar, omitir, sobrescrever, truncar, descontextualizar ou transformar silenciosamente informação oficial apenas porque ela não se enquadra no modelo atual.

As regras vigentes governam os novos registros e as novas operações. Os dados legados documentam o passado e devem ser aproximados das regras atuais sem destruição da informação original.

## 2. Fluxo obrigatório

Toda recepção ou transformação de dado oficial deve seguir esta ordem:

```text
fonte original preservada
→ interpretação e normalização rastreáveis
→ tentativa de correlação segura
→ aplicação automática somente quando comprovável
→ registro de pendência, ambiguidade ou conflito quando necessário
→ manutenção da informação original para saneamento posterior
```

É proibido:

```text
não atende à regra atual
→ apagar
→ substituir por vazio ou null
→ inventar correspondência
→ ocultar a demanda
→ sobrescrever o valor original
```

## 3. Dois contratos distintos

### 3.1 Novos cadastros e operações

- responsáveis devem seguir a regra oficial por UUID;
- domínios, status, datas e obrigatoriedades atuais devem ser respeitados;
- texto livre ou valores fora da regra somente podem existir quando expressamente autorizados;
- o novo sistema não deve reproduzir as fragilidades do legado.

### 3.2 Dados legados e históricos

- toda demanda recebida deve ser contabilizada;
- campos incompatíveis não autorizam descarte da linha;
- valores preenchidos não podem virar vazio sem decisão explícita e registro;
- ausência de correspondência não equivale a ausência de informação;
- divergências devem ser preservadas como pendência de saneamento;
- a fonte original e a transformação precisam permanecer reconciliáveis.

## 4. Caso canônico: Vanessa Migrado

`Vanessa Migrado` permanece como informação textual histórica sem UUID porque não foi localizada correspondência segura com usuário oficial cadastrado.

A demanda foi preservada e continua consultável. O vínculo oficial permanece pendente até que:

- Vanessa seja cadastrada como usuária oficial; ou
- um usuário autorizado faça a reatribuição correta.

Essa exceção não reintroduz nome livre para novos cadastros nem enfraquece a regra de responsável oficial por UUID.

## 5. Aplicação universal

Este princípio se aplica a:

- responsáveis;
- setores;
- tipos;
- classificações;
- status;
- prazos e demais datas;
- números de processos ou documentos;
- assuntos;
- comentários e observações;
- documentos e links;
- autoria;
- eventos históricos;
- registros repetidos, complementares ou conflitantes;
- qualquer outro dado oficial presente ou futuro.

## 6. Camadas que não podem ser confundidas

| Camada | Função |
|---|---|
| Fonte original | Preservar exatamente o que veio do sistema ou documento oficial |
| Valor normalizado | Facilitar comparação e busca sem substituir a fonte |
| Valor atual | Representar o estado operacional corrente |
| Situação da correlação | Associado, pendente, ambíguo, conflitante ou não aplicável |
| Auditoria técnica | Registrar lote, hash, migration, versão e transformação |
| Apresentação operacional | Mostrar informação compreensível e útil ao usuário |

Nenhuma camada pode sobrescrever silenciosamente outra.

## 7. Auditoria técnica e interface

Metadados como hash, migration, nome interno de lote ou código de desenvolvimento podem permanecer armazenados para auditoria. Eles não devem aparecer como narrativa operacional quando não ajudam o usuário a compreender a demanda.

Exemplos vigentes:

| Registro técnico preservado | Apresentação ao usuário |
|---|---|
| `Demanda importada do lote saneado <hash>.` | `Demanda importada do sistema legado.` |
| `Demanda importada da planilha inicial.` | `Demanda importada do sistema legado.` |
| `Responsável vinculado a perfil oficial na migração R3.` | `Responsável vinculado ao perfil oficial.` |

A apresentação pode traduzir o registro, mas não apaga nem reescreve a evidência técnica armazenada.

## 8. Gate obrigatório para mudanças futuras

Antes de qualquer alteração que alcance dados ou histórico, o executor deve demonstrar:

1. total de registros recebidos e contabilizados;
2. valores originais preservados;
3. transformações propostas e suas razões;
4. correspondências automáticas comprováveis;
5. pendências, ambiguidades e conflitos;
6. ausência de perdas ou sobrescritas silenciosas;
7. possibilidade de reconciliar destino e fonte;
8. impacto sobre histórico, busca, filtros, indicadores, Excel e interface;
9. rollback ou reprocessamento possível;
10. textos visíveis adequados ao usuário.

## 9. Parada obrigatória

O item afetado deve parar e voltar ao responsável pelo produto quando uma alteração puder:

- transformar valor preenchido em vazio ou `null`;
- eliminar exceção por incompatibilidade;
- alterar retroativamente informação oficial;
- inventar ou aproximar correspondência sem segurança;
- colapsar dados conflitantes;
- substituir conteúdo operacional por metadado técnico;
- impedir a recuperação do valor original.

O restante do pacote somente pode prosseguir se for independente e seguro.

## 10. Regra final

> Adaptar é obrigatório quando seguro. Correlacionar retroativamente é desejável quando comprovável. Apagar, omitir ou sobrescrever informação oficial nunca é solução para incompatibilidade com a regra atual.
