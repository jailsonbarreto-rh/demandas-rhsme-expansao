# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **26 de julho de 2026 — baseline documental do Pacote E0**

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
| Próxima atividade | Nenhum pacote posterior autorizado; depende de nova autorização expressa |

O SHA-base acima registra a linha de partida verificada para o E0 e não pretende representar o SHA da `main` após o próprio merge.

## Pacote E0 documental

O E0 foi autorizado exclusivamente para reconciliação documental e criação do gate de coerência. Seu conteúdo:

- versiona os Planos v3.1 e v1.2;
- atualiza a cadeia vigente para Adendo v2.0.4, Protocolo v1.3 e Política v1.1;
- preserva o Plano Remanescente v2.1 e as versões substituídas como históricos;
- corrige a ref do Supabase nos documentos vigentes;
- não aprova automaticamente nenhuma decisão `OP-Dxx`;
- não autoriza implementação funcional.

A presença deste conteúdo na `main` após o merge registra a conclusão documental do E0. Fora da `main`, ele representa a proposta de reconciliação em revisão. Em ambos os estados, nenhum pacote funcional posterior está autorizado.

## Escopo material do E0

O E0:

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

Nenhuma dessas pendências foi corrigida ou autorizada pelo E0.

## Regra de continuidade

1. nenhuma decisão `OP-Dxx` pode ser inferida da adoção dos planos;
2. o responsável pelo produto escolhe e autoriza expressamente o próximo pacote;
3. qualquer implementação futura atualiza o marcador de autorização neste Handoff e no Registro de Decisões;
4. nenhum deployment decorre automaticamente do E0.
