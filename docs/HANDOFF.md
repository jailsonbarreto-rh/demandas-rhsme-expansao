# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **3 de agosto de 2026 — Rodadas técnicas 1, 2 e 3 publicadas; consolidação documental pós-TanStack Query em andamento**

<!-- IMPLEMENTATION_AUTHORIZATION: V1-E-A01 -->

## Estado material

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| `main` atual | `15aa5c049c3c7122db365eec6a2e9f629e3c38ea` |
| R4 | concluído e publicado |
| R5-1 | concluído, homologado e publicado |
| Auditoria transversal de layout | concluída, homologada e publicada |
| R5 Essencial | concluído, homologado e publicado pelos PRs #112 e #113 |
| Recuperação de senha | concluída, configurada no Supabase, homologada e publicada pelos PRs #112 e #113 |
| Rodada técnica 1 | concluída e publicada pelos PRs #116–#122 |
| Rodada técnica 2 | concluída e publicada pelos PRs #123–#128 |
| Correção responsiva da tabela | concluída e publicada pelos PRs #129–#131 |
| Rodada técnica 3 — TanStack Query | concluída e publicada pelos PRs #132–#134 |
| PR funcional TanStack Query | #132, merge `e7ca96fa2f1474d27703967db641fd91a4e619c6` |
| PR de release TanStack Query | #133, merge `f9424b34ec9efd02d00f2e989d15816f52c5e480` |
| Encerramento da release | PR #134, merge `15aa5c049c3c7122db365eec6a2e9f629e3c38ea` |
| Production atual | `dpl_G15atVQxqsyWLAqNA68P2okxSLBu` — `READY` |
| SHA funcional publicado | `f9424b34ec9efd02d00f2e989d15816f52c5e480` |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, região `sa-east-1`, `ACTIVE_HEALTHY` |
| Integridade conhecida | 379 demandas, zero excluídas, 764 históricos, 13 perfis |
| Deploy automático | `deploymentEnabled: false`, restaurado pelo PR #134 |
| Testes após TanStack Query | 365 testes unitários e de integração; 42 cenários Playwright aprovados |
| Implementação funcional autorizada | **V1-E-A01 — R5 Essencial e recuperação de senha** |
| Atividade técnica atual | Rodada 3.1: consolidação documental, constante compartilhada e diagnóstico Knip |
| Próxima atualização candidata | TypeScript 6 em branch experimental, somente após autorização específica |

## Rodadas técnicas concluídas

### Rodada 1

- `actions/checkout` e `actions/setup-node` atualizados para v7;
- Playwright 1.62.0;
- `@vitejs/plugin-react` 6.0.4;
- `globals` 17.8.0;
- `@supabase/supabase-js` 2.110.9;
- Error Boundaries globais e regionais;
- estabilização dos testes de fuso operacional e interação com menus;
- publicação concluída e bloqueio automático restaurado.

### Rodada 2

- Node 24 obtido do `package.json` pelos workflows;
- JSDOM 30.0.0 efetivamente usado pelo Vitest;
- Supabase Action 2.1.1 e CLI 2.111.0 fixadas;
- Knip 6.29.0 instalado em modo diagnóstico, sem autofix e fora do gate obrigatório;
- publicação concluída e bloqueio automático restaurado.

### Correção responsiva intermediária

- ampliação da área útil da carteira;
- tabela sem overflow em 1920 px e 1366 px;
- rolagem superior sincronizada em viewports estreitos;
- coluna Ações fixa quando necessária;
- preservação dos filtros, dados, permissões e regras de negócio.

### Rodada 3 — TanStack Query

- `@tanstack/react-query` 5.101.4;
- `QueryClient` único na raiz;
- cache separado por UUID de usuário;
- consultas simultâneas deduplicadas;
- mutations confirmadas pelo repositório;
- invalidação seletiva da carteira e da lixeira;
- agrupamento de eventos Realtime;
- limpeza de cache ao trocar usuário ou encerrar sessão;
- nova tentativa explícita após falha de conexão;
- sem optimistic updates;
- sem retries automáticos de mutation;
- Supabase preservado como fonte de verdade;
- nenhuma mudança em banco, migrations, RLS, dados ou regras de negócio.

A arquitetura vigente está descrita em `docs/architecture/ARQUITETURA_TANSTACK_QUERY_CTRH_v1.0.md`.

## Consolidação pós-TanStack Query — Rodada 3.1

A Rodada 3.1 é uma consolidação documental e técnica de baixo risco.

### Escopo autorizado nesta etapa

- substituir o plano desatualizado do PR #115;
- registrar que as Rodadas 1, 2 e 3 foram concluídas;
- instituir política de modernização proativa;
- atualizar o registro de oportunidades técnicas;
- documentar a arquitetura TanStack Query;
- extrair `demandas:retry` para constante compartilhada em PR próprio;
- executar e analisar manualmente o Knip;
- não excluir automaticamente arquivo, export ou dependência.

### Limites

A consolidação não autoriza:

- pacote novo;
- mudança de comportamento funcional;
- alteração visual;
- banco, migration, RLS ou dados;
- optimistic update;
- alteração de cache, Realtime ou sessão;
- TypeScript 6 por inferência;
- publicação funcional automática.

## Regra permanente de modernização proativa

Atualizações e instalações não ficam restritas a rodadas periódicas.

Em qualquer correção, melhoria visual, nova funcionalidade ou investigação de erro, o executor deve avaliar se a tecnologia atual limita a solução. Quando uma atualização, pacote ou ampliação tecnológica puder produzir resultado materialmente melhor, mais confiável ou definitivo, a proposta deve ser apresentada antes da implementação.

A proposta deve informar problema, limite atual, benefício, alternativa sem dependência, compatibilidade, segurança, privacidade, bundle, testes, manutenção e rollback.

Essa regra não autoriza instalação silenciosa nem obriga a adoção. O responsável pelo produto decide. Também não permite manter solução inferior apenas para evitar avaliar tecnologia moderna quando o ganho for concreto e proporcional.

Consulte:

- `docs/product/POLITICA_MANUTENCAO_DEPENDENCIAS_CTRH_v1.1.md`;
- `docs/execution/PLANO_CONSOLIDADO_MANUTENCAO_MODERNIZACAO_CTRH_v1.1.md`;
- `docs/product/REGISTRO_OPORTUNIDADES_TECNICAS_MODERNIZACAO_CTRH_v1.1.md`.

## R5 Essencial — direção e escopo vigente

GOV-013 adota completude operacional em lugar de exaustão documental. Código, Supabase, interface e testes atuais foram confrontados antes da autorização.

O pacote publicado limita-se a:

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

A evidência consolidada está em `docs/execution/RELATORIO_VALIDACAO_COMPLETUDE_OPERACIONAL_2026-08-01.md`: zero vulnerabilidades, 76 arquivos/354 testes Vitest, cobertura acima dos limites, 36/36 cenários Playwright, build e bundle aprovados, rota direta de recuperação protegida na Vercel, migration remota presente, ACLs dos wrappers confirmadas e Preview/Production verificados.

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

As Rodadas técnicas 1, 2 e 3 e a correção responsiva não alteraram o banco remoto, dados, migrations, RLS ou regras.

Para a conclusão funcional inicial, a migration `20260801044712_r5_essential_harden_pre_r4_progress_status` permanece registrada remotamente. Ela não altera dados: apenas converte os dois contratos anteriores ao R4 em wrappers e deixa `EXECUTE` somente para `authenticated`. A verificação posterior confirmou 379 demandas ativas, zero excluídas, 764 históricos, `search_path` vazio e ausência de execução por `anon` ou `service_role` nesses wrappers.

## Próxima etapa

A atividade atual é a **Rodada 3.1 — consolidação pós-TanStack Query**.

Depois de concluir a sincronização documental, a constante compartilhada e o diagnóstico Knip, a próxima atualização estrutural candidata é o TypeScript 6. Ela não está autorizada automaticamente: exige proposta de escopo, branch exclusiva, versão exata, gate integral e decisão específica.

Nenhuma extensão funcional do R5 avançado, R1 residual, R2 ou ciclos posteriores é autorizada por inferência. A atividade funcional seguinte continua sujeita a valor, risco ou limite comprovado; E2, segurança final e homologação consolidada do R12 permanecem gates antes da entrega final do produto.

## Documentação vigente

1. `docs/execution/ADENDO_GOVERNANCA_POR_ETAPA_CTRH_v2.0.4.md`;
2. `docs/product/PROTOCOLO_HOMOLOGACAO_DECISOES_PRODUTO_CTRH_v1.3.md`;
3. `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md`;
4. `docs/product/PRINCIPIO_PRESERVACAO_INFORMACIONAL_CTRH_v1.0.md`;
5. `docs/product/POLITICA_SINCRONIZACAO_DOCUMENTAL_CTRH_v1.1.md`;
6. `docs/product/POLITICA_MANUTENCAO_DEPENDENCIAS_CTRH_v1.1.md`;
7. `docs/PRODUCT_CONTEXT.md`;
8. `docs/execution/Plano_Integrado_Reformulado_CTRH_v3.1.md`;
9. `docs/execution/Plano_Executivo_Operacao_Atual_CTRH_v1.2.md`;
10. `docs/execution/PLANO_CONSOLIDADO_MANUTENCAO_MODERNIZACAO_CTRH_v1.1.md`;
11. `docs/product/REGISTRO_OPORTUNIDADES_TECNICAS_MODERNIZACAO_CTRH_v1.1.md`;
12. `docs/architecture/ARQUITETURA_TANSTACK_QUERY_CTRH_v1.0.md`;
13. `docs/execution/ATUALIZACAO_COMPLETUDE_OPERACIONAL_2026-08-01.md`;
14. `docs/execution/RELATORIO_VALIDACAO_COMPLETUDE_OPERACIONAL_2026-08-01.md`;
15. `docs/execution/ATUALIZACAO_POS_R4_PRE_R5_2026-07-30.md`, como histórico de sequência;
16. `docs/product/PAUTA_DECISOES_R5_2026-07-30.md`, como pauta reconciliada;
17. `docs/adr/ADR-003-historico-e-exclusao-logica.md`;
18. `docs/execution/RELATORIO_VALIDACAO_R5_1_2026-07-30.md`;
19. `docs/execution/ENCERRAMENTO_R5_1_2026-07-30.md`;
20. `docs/execution/AUDITORIA_LAYOUT_INFORMACOES_INTERNAS_2026-07-30.md`;
21. `docs/execution/HISTORICO_DOCUMENTAL_CTRH.md`;
22. este Handoff.

## Regra de continuidade

O projeto segue a sequência discutir, decidir, registrar, implementar e homologar.

Além disso, toda tarefa deve incluir avaliação de limites tecnológicos: quando uma atualização ou instalação puder produzir solução substantivamente superior, ela deve ser apresentada como proposta, sem instalação silenciosa e sem transformar recomendação em autorização.

Depois da Rodada 3.1, nenhuma fila funcional se abre automaticamente. O próximo trabalho será escolhido por valor, risco ou limite comprovado, conforme GOV-013 e a política de manutenção v1.1.
