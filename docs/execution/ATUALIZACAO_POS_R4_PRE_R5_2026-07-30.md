# Atualização pós-R4 e preparação do R5

**Data:** 30 de julho de 2026  
**Estado:** vigente como reconciliação operacional entre o encerramento do R4 e o debate do R5  
**Efeito autorizativo:** nenhum item funcional do R5 está autorizado por este documento

## 1. Estado material consolidado

O R4 foi implementado, homologado e publicado em Production.

- implementação funcional: PR #103, merge `1a24586b2045115dd2486bbf1efb498d9521d9d9`;
- publicação: PR #104, merge `698d81056a72d9d8e7ef65b8d91cf67ca0fbbaf1`;
- encerramento do release e restauração do bloqueio: PR #105, merge `e99cf821ef93016ce17ad93b33960aed468b5616`;
- deployment Production: `dpl_BU1fjhmwwcp9gjLu2v2Kw9oapau3`, estado `READY`;
- Supabase: projeto `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, estado `ACTIVE_HEALTHY`;
- integridade preservada: 379 demandas, 764 históricos e 13 perfis;
- nenhuma fixture de homologação permaneceu no banco;
- `vercel.json` voltou a manter `deploymentEnabled: false`.

## 2. Reconciliação do Plano Executivo v1.2

O Plano Executivo v1.2 foi escrito antes das decisões detalhadas e da implementação do R4. Por isso, sua seção original do R4 permanece útil como histórico de planejamento, mas não prevalece sobre o Registro de Decisões, o código publicado, as migrations aplicadas e o Handoff.

Ficam expressamente superadas, para execução atual, as seguintes orientações antigas:

1. **Justificativa para `Não se aplica`**  
   O prazo final marcado inicialmente como `Não se aplica` não exige justificativa. O prazo interno não admite esse estado em novos cadastros. Justificativa é obrigatória quando um prazo já registrado é alterado posteriormente.

2. **Próxima providência passada**  
   Não se trata apenas de aviso e confirmação. O salvamento exige justificativa obrigatória e registro no histórico.

3. **Bloqueio do legado**  
   Lacunas históricas de prazo ou próxima providência não bloqueiam consulta nem edição cadastral não relacionada. A adequação ocorre progressivamente nas operações futuras pertinentes.

4. **Arquivos e componentes recomendados**  
   Os nomes de arquivos e componentes do plano eram propostas de execução. O aceite do R4 é pelo comportamento entregue e homologado, não pela criação literal de cada arquivo sugerido.

5. **R4-4 — painel administrativo de qualidade**  
   A equivalência do Excel e os filtros operacionais do R4 foram implementados. A rota administrativa `/admin/qualidade` e seu painel agregado não foram autorizados nem implementados. Permanecem como tema futuro vinculado à decisão pendente OP-D06.

6. **Faixa temporal**  
   A leitura comum de proximidade aprovada é de sete dias corridos. Essa indicação não transforma automaticamente a demanda em urgente.

7. **`Atenção agora`**  
   O componente foi preservado no R4. Sua evolução obrigatória permanece registrada para o R6, sem autorização automática.

## 3. Estado do R5

O R5 é o próximo ciclo funcional a ser debatido. Nenhum de seus pacotes possui autorização de implementação.

As decisões ainda pendentes são:

| Pacote | Tema | Decisões necessárias |
|---|---|---|
| R5-1 | Lixeira administrativa e restauração | OP-D11; OP-D17 já foi implementada no E4 |
| R5-2 | Andamento, transições e reabertura | OP-D07 |
| R5-3 | Prontuário canônico | OP-D08 |
| R5-4 | Autoria legível e contexto dos eventos | OP-D09 e OP-D10 |
| R5-5 | Busca histórica, link e retorno | OP-D12 e OP-D19 |

## 4. Dependências a reavaliar antes da implementação

1. O R1-5 de concorrência otimista foi adiado. Referências do plano a `expectedUpdatedAt` não podem ser tratadas como capacidade disponível nem como requisito automático do R5.
2. R2-1 e R2-3 somente podem ser antecipados quando forem dependência técnica concreta de uma função do R5 já aprovada.
3. A ausência quase total de próxima providência na base legada não pode ser convertida em erro geral, urgência ou preenchimento automático.
4. O prontuário deve aproveitar o histórico existente sem inventar autoria, origem ou contexto retroativo.
5. Lixeira e restauração devem preservar a proteção de banco já implantada no E4.

## 5. Ordem recomendada para o debate

A ordem abaixo organiza a discussão, mas não aprova qualquer decisão:

1. **R5-2 — Andamento, transições e reabertura**: fecha o fluxo operacional cotidiano já parcialmente existente.
2. **R5-3 — Prontuário canônico**: define a superfície central onde estado atual, ações e histórico serão reunidos.
3. **R5-1 — Lixeira e restauração**: completa a capacidade administrativa sobre uma proteção de banco já existente.
4. **R5-4 — Autoria e contexto dos eventos**: decide o modelo futuro de leitura histórica e os limites de qualquer classificação retroativa.
5. **R5-5 — Busca, links e retorno**: estabiliza navegação e compartilhamento depois de definida a superfície canônica.

## 6. Próxima atividade autorizada

Somente o debate pré-implementação do R5, seguindo a governança vigente:

```text
análise do funcionamento atual
→ identificação das lacunas reais
→ apresentação das alternativas
→ decisão expressa do responsável pelo produto
→ registro da decisão
→ autorização do pacote
→ implementação
```

A primeira pauta recomendada é **R5-2 — Andamento, transições de status e reabertura**. Nenhum código, migration, Preview ou Production deve ser iniciado antes da consolidação e autorização expressa desse escopo.
