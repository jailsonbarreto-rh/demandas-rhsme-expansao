# POLÍTICA DE SINCRONIZAÇÃO DOCUMENTAL — CENTRAL DE DEMANDAS CTRH

**Versão:** 1.1  
**Data:** 26 de julho de 2026  
**Status:** VIGENTE  
**Finalidade:** impedir que código, banco, documentação e decisões de produto descrevam regras diferentes.

## 1. Princípio vinculante

Toda alteração concreta de lógica de produto, regra de negócio, permissão, obrigatoriedade, modelo de dados, cálculo, navegação ou comportamento visível deve atualizar, no mesmo trabalho versionado, todos os documentos vigentes que orientem essa matéria.

A implementação não é considerada concluída quando apenas o código funciona. Ela somente está concluída quando:

1. a decisão aprovada está registrada;
2. o código e o banco refletem a decisão;
3. os documentos normativos vigentes descrevem a mesma regra;
4. documentos históricos potencialmente conflitantes estão identificados como históricos ou possuem nota de superação;
5. `docs/HANDOFF.md` registra o estado efetivamente implantado;
6. o pull request contém a verificação explícita de consistência documental.

## 2. Problema que esta política evita

Documentação desatualizada produz ciclos de regressão:

```text
regra é alterada e implementada
→ documento antigo permanece como se fosse vigente
→ outra ferramenta lê o documento antigo
→ classifica a implementação correta como erro
→ propõe restaurar a regra superada
→ responsável pelo produto pode autorizar a falsa correção sem recordar a decisão anterior
```

A documentação é parte do contrato do produto, e não relato opcional posterior.

## 3. Documentos vigentes e suas funções

| Documento | Função |
|---|---|
| `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md` | Fonte das decisões expressamente aprovadas. |
| `docs/PRODUCT_CONTEXT.md` | Semântica atual do produto, pessoas, necessidades e regras funcionais. |
| `docs/execution/Plano_Integrado_Reformulado_CTRH_v3.1.md` | Estratégia geral dos Trilhos A e B, dependências e princípios transversais. |
| `docs/execution/Plano_Executivo_Operacao_Atual_CTRH_v1.2.md` | Roteiro executável possível do Trilho A, sem autorização automática. |
| `docs/execution/ADENDO_GOVERNANCA_POR_ETAPA_CTRH_v2.0.4.md` | Regra de autorização e governança por pacote e decisão. |
| `docs/product/PROTOCOLO_HOMOLOGACAO_DECISOES_PRODUTO_CTRH_v1.3.md` | Procedimento de debate, aprovação, registro e sincronização. |
| `AGENTS.md` | Obrigações operacionais resumidas para agentes. |
| `docs/HANDOFF.md` | Estado material mais recente, ambientes e próxima atividade autorizada. |
| ADR vigente | Decisão arquitetural estável e suas consequências. |
| Documentação do módulo | Contrato técnico específico, quando existente. |

## 4. Regra de precedência

Em caso de divergência:

1. prevalece a decisão expressa mais recente registrada no `REGISTRO_DECISOES_PRODUTO_CTRH.md`;
2. em seguida, prevalecem os documentos vigentes conforme a ordem definida no `AGENTS.md`;
3. planos, especificações, relatórios e ADRs históricos não restauram regra posteriormente alterada;
4. a divergência deve ser corrigida antes de nova implementação relacionada;
5. nenhuma ferramenta pode escolher silenciosamente um dos textos conflitantes.

## 5. Documentos históricos

Documentos históricos não devem ser reescritos para fingir que a decisão antiga nunca existiu. Devem ser preservados como registro e tratados de uma destas formas:

- cabeçalho com status `HISTÓRICO`;
- nota de superação indicando a decisão posterior;
- referência explícita ao documento vigente que substituiu a regra;
- exclusão da ordem obrigatória de leitura para execução atual.

O Plano Mestre v1.0, as versões do Plano Remanescente, as versões anteriores do Adendo, Protocolo e Política e as minutas executivas substituídas são registros históricos. Não são fonte autônoma para reconstruir comportamento superado.

## 6. Matriz de impacto documental

Antes de concluir uma alteração, o executor deve verificar:

| Tipo de mudança | Documentos mínimos a revisar |
|---|---|
| Nova decisão ou alteração de regra de negócio | Registro de decisões, Product Context, planos vigentes afetados, AGENTS, Handoff e documentação funcional afetada. |
| Mudança de sequência ou dependência dos pacotes | Plano Integrado, Plano Executivo quando afetado, Adendo de Governança, AGENTS, Registro de decisões e Handoff. |
| Alteração de schema, RPC, RLS ou autenticação | Documentação Supabase, ADR aplicável, planos vigentes afetados, Handoff e tipos gerados. |
| Mudança de rota, navegação ou estado na URL | Product Context, planos vigentes afetados, guia de usuário, testes de rota e Handoff. |
| Mudança de papel ou permissão | Registro de decisões, Product Context, documentação Supabase, matriz de papéis e Handoff. |
| Mudança em métricas, alertas ou relatórios | Product Context, planos vigentes afetados, documentação do cálculo, relatórios e Handoff. |
| Correção apenas técnica sem mudança de produto | Handoff, documentação técnica afetada e ADR quando houver nova decisão arquitetural duradoura. |
| Mudança que afete recepção ou preservação do legado | Plano Integrado, Plano Executivo quando aplicável, documentação de migração, Product Context, Registro de Decisões e Handoff. |

A lista é mínima. Outros documentos encontrados pela busca do repositório também devem ser avaliados.

## 7. Procedimento obrigatório

### Antes da implementação

1. identificar a decisão vigente e sua fonte;
2. pesquisar no repositório termos relacionados à regra;
3. listar documentos vigentes e históricos potencialmente afetados;
4. incluir a atualização documental no escopo autorizado.

### Durante a implementação

1. não adiar a documentação para outro pacote;
2. atualizar a redação normativa junto da mudança funcional;
3. preservar histórico e inserir notas de superação quando necessário;
4. interromper o item se documentos vigentes apresentarem regras incompatíveis sem decisão de precedência.

### Antes do pull request

1. repetir a pesquisa por termos antigos;
2. confirmar que ocorrências restantes são históricas e claramente identificadas;
3. revisar a matriz de impacto;
4. preencher o checklist do pull request;
5. atualizar `docs/HANDOFF.md`.

O gate automatizado `npm run check:docs` deve permanecer verde e verificar a unicidade da cadeia vigente, a ordem de leitura, a ref do Supabase, a autorização registrada, as decisões `OP-Dxx` e a identificação dos documentos históricos.

### Antes do merge

O revisor deve responder:

- qual decisão autoriza a regra implementada;
- quais documentos vigentes foram atualizados;
- quais textos históricos permaneceram e por quê;
- se alguma busca ainda retorna orientação contraditória sem nota de superação;
- se o próximo executor compreenderá a regra sem depender do histórico do chat.

## 8. Definição de pronto documental

Uma entrega falha no gate documental quando:

- o código contradiz o `PRODUCT_CONTEXT`;
- o plano vigente descreve uma regra já substituída;
- o Registro de Decisões não contém a decisão que fundamenta a implementação;
- o Handoff aponta estado anterior ao implantado;
- um documento histórico aparece como orientação vigente;
- a descrição do PR não informa o impacto documental;
- a mudança cria nova interpretação possível sem decisão registrada.

Nenhum desses casos pode ser tratado como correção editorial opcional.

## 9. Controle de autorização

O Registro de Decisões e o Handoff devem declarar a mesma autorização funcional por meio do marcador:

```text
<!-- IMPLEMENTATION_AUTHORIZATION: none -->
```

Quando houver autorização futura, `none` será substituído pelo identificador estável do pacote nos dois documentos, acompanhado da decisão expressa correspondente. O marcador não substitui a decisão; apenas permite ao gate detectar divergência.

Adotar um plano não aprova as decisões `OP-Dxx` contidas nele. Uma `OP-Dxx` somente pode ser apresentada como aprovada quando possuir entrada própria no Registro de Decisões com redação final e estado `APROVADA`.

## 10. Regra específica consolidada após o R3

A partir das decisões R3-D01 a R3-D09:

- o responsável oficial é um usuário cadastrado identificado por UUID;
- novas demandas e futuras reatribuições não aceitam responsável externo ou nome livre;
- a ausência de responsável continua permitida e é representada por UUID nulo e texto vazio;
- informação textual legada sem UUID pode ser preservada, mas não se torna opção de novo cadastro;
- `Vanessa Migrado` permanece como única informação histórica conhecida sem perfil oficial;
- `/demandas` é a carteira da equipe;
- `/minhas-demandas` é a carteira pessoal por UUID;
- `escopo=meu` existe somente como compatibilidade de URL legada e deve redirecionar para `/minhas-demandas`.

Qualquer documento que descreva responsável externo como opção atual ou `scope=meu` como arquitetura principal está superado por essas decisões.
