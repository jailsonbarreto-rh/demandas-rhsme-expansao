# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **26 de julho de 2026 — Pacote E0 documental em revisão**

<!-- IMPLEMENTATION_AUTHORIZATION: none -->

## Estado material verificado

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| SHA-base remoto verificado para o E0 | `ee61dab5917f84b034305ba2119e4bbad673f176` |
| Production | `https://demandas-rhsme-expansao.vercel.app/` |
| Deployment efetivo de Production | `dpl_44HusLjkHEJxpKtvWQFfrgJmXvNR` — `READY` |
| SHA efetivo de Production | `98ce45df2e05d223c89227dea244dc53a7d4e363` — PR #52 |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, região `sa-east-1`, `ACTIVE_HEALTHY` |
| Última migration remota | `20260724011303_r3_responsaveis_oficiais` |
| Estratégia geral | `docs/execution/Plano_Integrado_Reformulado_CTRH_v3.1.md` |
| Roteiro do Trilho A | `docs/execution/Plano_Executivo_Operacao_Atual_CTRH_v1.2.md` |
| Registro de decisões | `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md` |
| Implementação funcional autorizada | Nenhuma |
| Próxima atividade | Nenhum pacote posterior autorizado; depende de nova autorização expressa após revisão e homologação do E0 |

O SHA acima é a baseline estável verificada no início do E0. Ele não pretende ser um campo autorreferente de “SHA atual após o próprio merge”, que ficaria obsoleto no instante da atualização.

## Estado do Pacote E0

O E0 foi autorizado exclusivamente para reconciliação documental e criação do gate de coerência. Nesta branch:

- os Planos v3.1 e v1.2 foram versionados integralmente;
- a cadeia vigente foi atualizada para Adendo v2.0.4, Protocolo v1.3 e Política v1.1;
- o Plano Remanescente v2.1 e as versões substituídas foram preservados como históricos;
- a ref do Supabase foi corrigida nos documentos vigentes;
- nenhuma decisão `OP-Dxx` foi aprovada automaticamente;
- nenhuma implementação funcional foi autorizada.

O E0 **não está concluído enquanto o PR permanecer sem merge**. Esta execução não autoriza o merge.

## Escopo material deste pacote

Este pacote:

- altera apenas arquivos Markdown, `package.json` e scripts de teste/auditoria documental;
- não altera frontend, estilos, componentes, TypeScript operacional ou comportamento da aplicação;
- não cria nem edita migration;
- não aplica SQL, não altera dados e não modifica RLS, RPC, grants, Auth ou Realtime;
- não altera `vercel.json`;
- não cria Preview e não publica Production;
- não executa E1, E1A, E2, E3, E4, R1, R2, R4 ou R5;
- não remove dados reais da árvore Git;
- não reescreve histórico Git.

## R3 implementado e preservado

- `responsavel_id` permanece a identidade oficial do responsável.
- Novas demandas e futuras reatribuições usam usuário cadastrado por UUID ou ausência explícita.
- Responsável externo e nome livre não são opções da operação atual.
- Informação textual legada sem UUID continua preservada sem formar carteira pessoal.
- 378 demandas permanecem vinculadas aos perfis oficiais.
- Uma informação textual legada permanece sem UUID.
- `/demandas` continua sendo a carteira da equipe.
- `/minhas-demandas` continua sendo a carteira pessoal por UUID.
- `escopo=meu` continua somente como compatibilidade legada.
- Indicadores continuam contextuais à carteira delimitada pela rota.

## Fotografia read-only verificada no Supabase em 26/07/2026

| Indicador | Resultado |
|---|---:|
| Demandas | 379 |
| Demandas vinculadas a perfil oficial | 378 |
| Informação textual legada sem UUID | 1 |
| Históricos | 764 |
| Perfis | 13 |
| Demandas logicamente excluídas | 0 |
| Demandas abertas sem próxima ação | 376 |
| Demandas abertas sem data de acompanhamento | 376 |

As contagens são uma fotografia de verificação, não constantes da aplicação.

## Pendências reconhecidas, não executadas

- Production permanece no PR #52 e ainda não contém a evolução funcional do PR #53.
- Duas migrations temporárias de `pg_net` constam no histórico remoto e não possuem arquivo homônimo no Git; o tratamento pertence ao E1A.
- Dados operacionais reais ainda existem na árvore corrente e pertencem ao E2.
- RLS da lixeira e autoria administrativa pertencem ao E4 e dependem das decisões aplicáveis.
- Integridade, concorrência e contratos pertencem ao R1.
- Consulta escalável e histórico sob demanda pertencem ao R2.
- Prazos e próxima providência pertencem ao R4.
- Andamento, prontuário e recuperação administrativa pertencem ao R5.
- O Trilho B permanece separado e não bloqueia genericamente a evolução independente do Trilho A.

Nenhuma dessas pendências foi corrigida ou autorizada por este pacote.

## Regra de continuidade

Depois da revisão do PR:

1. o E0 somente poderá ser considerado concluído após merge e homologação documental;
2. nenhuma decisão `OP-Dxx` poderá ser inferida da adoção dos planos;
3. o responsável pelo produto escolherá e autorizará expressamente o próximo pacote;
4. qualquer implementação futura deverá atualizar o marcador de autorização neste Handoff e no Registro de Decisões;
5. nenhum deployment decorrerá automaticamente deste E0.
