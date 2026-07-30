# Atualização pós-R4 e execução sequencial do R5

**Data:** 30 de julho de 2026  
**Estado:** vigente como reconciliação operacional após o R4  
**Efeito autorizativo:** somente o pacote R5-1 está autorizado; os demais itens do R5 dependem de novo debate

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

## 3. Método vigente para o R5

O R5 será discutido e implementado em pequenos blocos, alinhando debate e ordem de execução:

```text
discussão de um pacote
→ decisão expressa
→ registro documental
→ implementação completa do pacote
→ testes e publicação
→ início da discussão seguinte
```

As alternativas apresentadas em cada discussão deverão considerar as decisões anteriores, o layout vigente, as regras do banco, o tratamento do legado e as permissões por papel, evitando decisões locais que entrem em conflito com o produto consolidado.

A ordem vigente é:

1. R5-1 — Lixeira administrativa e auditoria;
2. R5-2 — Andamento, transições e reabertura;
3. R5-3 — Prontuário canônico;
4. R5-4 — Autoria e contexto dos eventos;
5. R5-5 — Busca histórica, links e retorno.

## 4. R5-1 — Escopo autorizado

O antigo tema `Lixeira administrativa e restauração` foi simplificado para **Lixeira administrativa e auditoria**.

Regras aprovadas:

- somente administrador ativo pode excluir demandas;
- editores e leitores não visualizam a ação de exclusão;
- a exclusão permanece lógica e nunca destrói dados;
- motivo, autor, data e hora são registrados;
- dados e histórico permanecem preservados;
- somente administrador ativo consulta demandas e históricos excluídos;
- a área administrativa apresenta listagem, pesquisa e detalhe somente leitura;
- não existe botão, fluxo ou RPC executável pelos papéis de API para restauração;
- eventual recuperação excepcional ocorre fora do produto, pelo proprietário do banco, mediante procedimento controlado.

A decisão pendente OP-D11 fica encerrada. A implementação deve abranger frontend, contratos, Supabase, grants, testes, documentação e publicação controlada.

## 5. Estado dos demais pacotes

| Pacote | Tema | Estado |
|---|---|---|
| R5-1 | Lixeira administrativa e auditoria | autorizado e em implementação |
| R5-2 | Andamento, transições e reabertura | próximo debate; OP-D07 pendente |
| R5-3 | Prontuário canônico | não iniciado; OP-D08 pendente |
| R5-4 | Autoria legível e contexto dos eventos | não iniciado; OP-D09 e OP-D10 pendentes |
| R5-5 | Busca histórica, links e retorno | não iniciado; OP-D12 e OP-D19 pendentes |

## 6. Dependências preservadas

1. O R1-5 de concorrência otimista foi adiado. Referências a `expectedUpdatedAt` não podem ser tratadas como capacidade disponível nem como requisito automático do R5.
2. R2-1 e R2-3 somente podem ser antecipados quando forem dependência técnica concreta de uma função já aprovada.
3. A ausência quase total de próxima providência na base legada não pode ser convertida em erro geral, urgência ou preenchimento automático.
4. O prontuário futuro deve aproveitar o histórico existente sem inventar autoria, origem ou contexto retroativo.
5. A lixeira preserva a proteção de banco implantada no E4 e não reabre automaticamente demandas nem estados anteriores.

## 7. Regra de continuidade

A conclusão do R5-1 autorizará somente o início do debate do R5-2. Nenhum código de andamento, reabertura, prontuário, autoria, busca ou links deve ser iniciado por inferência.
