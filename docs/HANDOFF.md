# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **1º de agosto de 2026 — conclusão funcional inicial implementada; homologação e release em execução**

<!-- IMPLEMENTATION_AUTHORIZATION: V1-E-A01 -->

## Estado material

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| R4 | concluído e publicado |
| R5-1 | concluído, homologado e publicado |
| Auditoria transversal de layout | concluída, homologada e publicada |
| R5 Essencial | implementação concluída na branch `feat/r5-essencial-completude-operacional`; gate de homologação em execução |
| Recuperação de senha | implementação e configuração do Supabase concluídas na mesma branch; gate de homologação em execução |
| PR funcional da auditoria | #109, merge `8ae2ff95152371ccc6ada2dc4580010b311b79e4` |
| PR de release | #110, merge `2bc78dca066b0c4d592b4e6c5bc4c4db5290b507` |
| Production | `dpl_7G72xFXcQUKtYELrGhXha1xi7UPE` — `READY` |
| SHA publicado | `2bc78dca066b0c4d592b4e6c5bc4c4db5290b507` |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, região `sa-east-1`, `ACTIVE_HEALTHY` |
| Integridade conhecida | 379 demandas, zero excluídas, 764 históricos, 13 perfis |
| Deploy automático | restaurado para `deploymentEnabled: false` no encerramento |
| Implementação funcional autorizada | **V1-E-A01 — R5 Essencial e recuperação de senha** |
| Próxima atividade | concluir gates, PR, homologação de Preview e publicação controlada da conclusão funcional inicial |

## R5 Essencial — direção e escopo vigente

GOV-013 adota completude operacional em lugar de exaustão documental. Código, Supabase, interface e testes atuais foram confrontados antes da autorização.

O pacote em curso limita-se a:

- expor `Registrar andamento` para administrador/editor em demanda não encerrada;
- preservar o status no andamento e atualizar próxima providência e data;
- reutilizar a transição existente para reabrir demanda encerrada;
- retirar o status atual das opções de destino e usar rótulos contextuais;
- reconhecer o drawer e as rotas profundas como prontuário operacional inicial;
- endurecer as duas RPCs anteriores ao R4 como wrappers das regras atuais, sem nova estrutura ou alteração de dados.

Página completa, snapshots, backfill, categorias de evento, paginação remota, refinamentos avançados de retorno e demais extensões não estão autorizados. O modal histórico permanece como atalho compatível, sem evolução concorrente ao drawer.

## Recuperação de senha essencial

AUTH-E-D01 autoriza o fluxo mínimo `Esqueci minha senha` → confirmação neutra → link do Supabase → `/redefinir-senha` → nova senha. Somente o evento `PASSWORD_RECOVERY` habilita a alteração; links ausentes, inválidos ou expirados permanecem sem acesso ao formulário. O pacote não cria estrutura de banco nem consulta a existência da conta.

Em 1º de agosto de 2026, o redirect exato `https://demandas-rhsme-expansao.vercel.app/redefinir-senha` foi adicionado e confirmado no Supabase Auth. A política remota de senha foi alinhada à aplicação: mínimo de oito caracteres, com minúscula, maiúscula e número. A verificação de senhas vazadas permanece indisponível no plano Free e não houve contratação ou mudança de plano.

A evidência pré-release consolidada está em `docs/execution/RELATORIO_VALIDACAO_COMPLETUDE_OPERACIONAL_2026-08-01.md`: zero vulnerabilidades, 75 arquivos/353 testes Vitest, cobertura acima dos limites, 36/36 cenários Playwright, build e bundle aprovados, migration remota presente e ACLs dos wrappers confirmadas.

## R5-1 — regra vigente

### Exclusão

- somente administrador ativo pode excluir demandas;
- editor e leitor não recebem a ação `Excluir`;
- exclusão é lógica e nunca física;
- motivo com pelo menos dez caracteres é obrigatório;
- banco registra ator, data, hora e evento histórico;
- dados e histórico permanecem preservados.

### Consulta administrativa

A área `/admin` contém a seção `Demandas excluídas`, somente para administradores, com:

- contagem dos registros excluídos;
- pesquisa por número, assunto, responsável, setor, status, motivo e autor comprovável;
- listagem dos dados principais;
- detalhe somente leitura;
- motivo, data e autoria da exclusão;
- dados preservados da demanda;
- histórico completo.

Quando a autoria não puder ser comprovada, a interface usa `Autor não identificado` e não inventa nome.

### Restauração

Não existe restauração no produto:

- não há botão ou fluxo visual;
- não há método público nos tipos, hooks ou repositórios;
- não há edição ou mudança de status na lixeira;
- a função técnica do banco permanece definida, mas não possui `EXECUTE` para `public`, `anon`, `authenticated` ou `service_role`;
- recuperação excepcional somente poderá ocorrer fora da aplicação, por procedimento controlado do proprietário do banco.

O tipo histórico `restauracao` permanece reconhecido apenas para leitura de eventual evento anterior.

## Auditoria transversal de layout

### Problemas corrigidos

- remoção do ID numérico do modal de edição;
- retirada de textos permanentes sobre legado e migração;
- remoção da expressão `Responsável legado`;
- campo `Motivo da alteração *` exibido somente quando a ação exige justificativa;
- textarea do motivo em largura integral, com altura adequada e sem redimensionamento;
- remoção de UUIDs e nomes de campos internos do histórico;
- tradução dos estados e eventos técnicos para linguagem de produto;
- remoção de referências a migration, lote, hash e sistema anterior;
- substituição de `Vínculo legado pendente` por `Responsável não vinculado`;
- substituição de `Processo #ID` por `Processo não localizado`;
- barreira comum contra mensagens brutas de Supabase, PostgREST e PostgreSQL;
- simplificação da linguagem da área administrativa e dos avisos de integridade.

### Verificação final dos formulários

Todos os campos funcionais permaneceram disponíveis.

**Edição:**

- Assunto;
- Responsável;
- Prazo interno;
- Prazo final;
- Setor;
- Motivo da alteração, somente quando aplicável.

**Nova demanda:**

- Tipo;
- Número;
- Assunto;
- Responsável;
- Prazo interno;
- Prazo final;
- Status;
- Setor;
- Classificação;
- Próxima providência;
- Data da próxima providência;
- justificativa de data passada, quando aplicável.

O campo `Próxima providência` recebeu largura integral, altura mínima, rótulo flutuante, foco e tipografia compatíveis com o padrão profissional do produto.

### Avisos e orientações

Foram confirmadas mensagens explicativas no momento pertinente:

- ao salvar alteração sem motivo obrigatório: `Informe o motivo da alteração para continuar (mínimo de 10 caracteres).`;
- orientação do motivo: `O motivo será registrado no histórico da demanda.`;
- ao salvar nova demanda sem prazo interno: diálogo `Prazo interno obrigatório`;
- orientação do diálogo: `Toda nova demanda deve possuir um prazo interno definido. Informe a data antes de salvar o cadastro.`;
- em status ativo sem providência: `Descreva a próxima providência com pelo menos 5 caracteres.`;
- sem data de acompanhamento: `Informe a data de acompanhamento.`

Mensagens específicas, como data parcialmente preenchida, permanecem preservadas. Nenhum aviso de regra usa UUID, código de banco, nome de coluna ou linguagem de infraestrutura.

### Limites

O pacote não altera:

- regras de prazo e justificativa;
- tratamento dos registros importados;
- modelo ou dados do Supabase;
- permissões por papel;
- indicadores do Radar;
- filtros e comportamento por carteira;
- exportação analítica;
- qualquer decisão ou código do R5-2.

## Auditoria transversal já publicada — validação

### Gate combinado final

Deployment: `dpl_8vU2o1ojgQDsjck7twsaaYUbJwGd` — `READY`.

- auditoria de dependências: zero vulnerabilidades;
- assinaturas verificadas: 560 pacotes;
- atestações verificadas: 147 pacotes;
- compatibilidade transitiva: 3/3;
- documentação: 9/9;
- lint: aprovado;
- 71 arquivos e 328 testes aprovados;
- cobertura global de linhas: 81,74%;
- TypeScript e build Vite: aprovados;
- bundle inicial: 194.126 bytes, 60,16% abaixo da linha de base;
- inspeção pública: aprovada.

### Navegador

Foram aprovados quatro cenários focais:

- edição em desktop;
- nova demanda em desktop;
- edição em mobile de 320 px;
- nova demanda em mobile de 320 px.

As provas confirmaram preservação dos campos, mensagens ao salvar, qualidade visual dos controles e ausência de overflow horizontal.

Os 22 cenários regressivos existentes também permaneceram aprovados em desktop e mobile, incluindo acessibilidade, navegação, filtros, modais, exportação e console.

## Auditoria transversal já publicada — Production

- deployment `dpl_7G72xFXcQUKtYELrGhXha1xi7UPE` em estado `READY`;
- target `production`;
- domínio principal: HTTP 200;
- `/demandas`: HTTP 200;
- `/admin`: HTTP 200;
- rewrites SPA preservados;
- assets da versão publicada carregados corretamente.

## Supabase remoto

A auditoria transversal já publicada não possui migration e não alterou o banco naquele release.

Permanecem inalterados:

- tabelas e colunas;
- RPCs;
- policies;
- grants;
- dados e históricos;
- permissões de restauração e exclusão definidas no R5-1.

Para a conclusão funcional inicial, a migration `20260801044712_r5_essential_harden_pre_r4_progress_status` já está registrada remotamente. Ela não altera dados: apenas converte os dois contratos anteriores ao R4 em wrappers e deixa `EXECUTE` somente para `authenticated`. A verificação posterior confirmou 379 demandas ativas, zero excluídas, 764 históricos, `search_path` vazio e ausência de execução por `anon` ou `service_role` nesses wrappers.

## Próxima etapa

A implementação da **conclusão funcional inicial**, autorizada por V1-E-A01 e composta pelo R5 Essencial e pela recuperação de senha, está concluída na branch funcional. A próxima atividade é encerrar os gates locais, a PR, a homologação de Preview e a publicação controlada.

Nenhuma extensão do R5 avançado, R1 residual, R2 ou ciclos posteriores está autorizada por inferência. Segurança, E2, release proporcional e homologação final continuam obrigatórios.

## Documentação vigente

1. `docs/execution/ADENDO_GOVERNANCA_POR_ETAPA_CTRH_v2.0.4.md`;
2. `docs/product/PROTOCOLO_HOMOLOGACAO_DECISOES_PRODUTO_CTRH_v1.3.md`;
3. `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md`;
4. `docs/product/POLITICA_SINCRONIZACAO_DOCUMENTAL_CTRH_v1.1.md`;
5. `docs/PRODUCT_CONTEXT.md`;
6. `docs/execution/Plano_Integrado_Reformulado_CTRH_v3.1.md`;
7. `docs/execution/Plano_Executivo_Operacao_Atual_CTRH_v1.2.md`;
8. `docs/execution/ATUALIZACAO_COMPLETUDE_OPERACIONAL_2026-08-01.md`;
9. `docs/execution/RELATORIO_VALIDACAO_COMPLETUDE_OPERACIONAL_2026-08-01.md`;
10. `docs/execution/ATUALIZACAO_POS_R4_PRE_R5_2026-07-30.md`, como histórico de sequência;
11. `docs/product/PAUTA_DECISOES_R5_2026-07-30.md`, como pauta reconciliada;
12. `docs/adr/ADR-003-historico-e-exclusao-logica.md`;
13. `docs/execution/RELATORIO_VALIDACAO_R5_1_2026-07-30.md`;
14. `docs/execution/ENCERRAMENTO_R5_1_2026-07-30.md`;
15. `docs/execution/AUDITORIA_LAYOUT_INFORMACOES_INTERNAS_2026-07-30.md`;
16. este Handoff.

## Regra de continuidade

O pacote atual segue a sequência discutir, decidir, registrar, implementar e homologar. Depois dele, nenhuma fila funcional se abre automaticamente: o próximo trabalho será escolhido por valor, risco ou limite comprovado, conforme GOV-013.
