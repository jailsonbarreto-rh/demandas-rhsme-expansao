# Atualização de direção — completude operacional do produto inicial

**Data:** 1º de agosto de 2026<br>
**Estado:** decisão aprovada; conclusão funcional inicial implementada, com homologação e release em execução<br>
**Abrangência:** todo o roteiro remanescente dos Trilhos A e B<br>
**Fonte decisória:** GOV-013, OP-D07, OP-D08, R5-E-D01, R5-E-D02, R5-E-A01, AUTH-E-D01 e V1-E-A01

## 1. Direção aprovada

O desenvolvimento passa a buscar **completude operacional**, e não exaustão documental. Os planos continuam válidos como inventário de riscos, possibilidades e dependências, mas não constituem uma lista obrigatória de funcionalidades para o lançamento inicial.

Toda decisão futura deve começar pelo estado material verificado, nesta ordem:

1. código da `main` e comportamento realmente publicado;
2. schema, funções, RLS, grants e dados do Supabase;
3. interface vigente, rotas e testes protegidos;
4. Registro de Decisões, `PRODUCT_CONTEXT` e Handoff;
5. recomendações e alternativas ainda não materializadas dos planos.

Código e banco não criam regra de produto por si sós, mas são a fonte do que já existe. Quando um plano divergir do estado material posteriormente aprovado, a decisão registrada mais recente e a implementação homologada prevalecem.

## 2. Critério de priorização

Uma função integra o caminho crítico do produto inicial somente quando for necessária para ao menos um destes trabalhos:

- localizar uma demanda com facilidade;
- organizar a carteira e a atuação com base em prazos e próxima providência;
- compreender e registrar situação atual, andamento, anotações e principais mudanças do trabalho;
- recuperar o próprio acesso com segurança, sem depender de intervenção técnica.

Cada item remanescente deve ser classificado como:

1. **materializado:** já existe de forma suficiente e deve ser preservado;
2. **essencial:** lacuna pequena necessária para completar um trabalho central;
3. **evolução condicionada:** somente volta ao caminho de implementação diante de evidência de uso, risco, volume, desempenho, segurança ou exigência administrativa.

Complexidade potencial, riqueza isolada da solução ou presença em plano anterior não bastam para classificar um item como essencial.

## 3. R5 Essencial autorizado

O produto inicial encerra o ciclo funcional do R5 com a menor solução completa abaixo.

### 3.1 Registrar andamento

- expor na interface a operação já existente em contratos, repositórios e RPC;
- permitir a ação a administrador ou editor ativo em demanda não encerrada;
- exigir registro do trabalho realizado, próxima providência e data de acompanhamento;
- exigir justificativa quando a data de acompanhamento já estiver vencida;
- preservar o status atual e registrar evento histórico do tipo `andamento`;
- manter filtros, carteira e rota enquanto o usuário registra a movimentação.

### 3.2 Transição e reabertura

- não oferecer o status atual como destino de uma transição;
- tratar a reabertura como a mesma transição auditável já existente, de `Encerrado` para qualquer outro status oficial;
- exigir comentário, próxima providência e data, conforme as regras já aplicadas pelo banco;
- usar rótulos contextuais de reabertura na interface;
- não criar tabela, estado intermediário, RPC funcional ou máquina de estados adicional;
- endurecer os dois nomes de RPC anteriores ao R4 como wrappers das regras atuais, sem duplicar lógica e sem alterar dados.

### 3.3 Prontuário operacional inicial

- reconhecer o `DemandDetailDrawer` e as rotas profundas atuais como prontuário operacional suficiente para o lançamento;
- preservar nele identificação, responsabilidade, prazos, próxima providência, status e histórico;
- incluir os atalhos contextuais para registrar andamento, alterar status ou reabrir e editar;
- adiar uma página completa separada até haver evidência de limitação real do drawer.

### 3.4 Consulta e retorno

A busca em dados atuais e históricos, a explicação do campo encontrado, as rotas profundas e a preservação de filtros já atendem ao lançamento. Cópia dedicada de link, retorno exato de scroll/foco/página, consulta individual remota e tratamento especializado de `link_origem` são evoluções condicionadas.

## 4. Recuperação de senha essencial

A autenticação, o primeiro acesso, a aprovação administrativa e os papéis já estão materializados. A ausência objetiva é a recuperação de senha. O produto inicial deve oferecer o menor fluxo seguro:

- ação `Esqueci minha senha` no login;
- solicitação pelo Supabase Auth com resposta neutra, sem revelar se a conta existe;
- retorno exclusivo para `/redefinir-senha` por link autorizado;
- reconhecimento do evento `PASSWORD_RECOVERY` antes de permitir a troca;
- nova senha com a mesma política forte do primeiro acesso e confirmação idêntica;
- mensagem segura para link inválido ou expirado;
- encerramento da sessão de recuperação após a alteração e retorno ao login.

O modo local pode simular a solicitação para testes, mas nunca envia e-mail nem armazena senha. O pacote não cria tabela, RPC, perfil, permissão ou dado operacional.

O destino canônico `https://demandas-rhsme-expansao.vercel.app/redefinir-senha` foi registrado no Supabase Auth. A política remota também foi alinhada ao formulário: mínimo de oito caracteres, com minúscula, maiúscula e número. A proteção contra senhas vazadas não está disponível no plano Free e permanece registrada como limitação da plataforma, sem autorização para upgrade.

## 5. Reclassificação do roteiro remanescente

### 5.1 Pacotes do roteiro vigente

| Tema | Classificação após esta decisão |
|---|---|
| R5-2 — andamento e reabertura | Essencial; autorizado nos limites da seção 3 |
| R5-3 — prontuário | Materializado pelo drawer e rotas atuais; página separada adiada |
| R5-4 — snapshots de autoria e contexto técnico | Evolução condicionada; nenhuma inferência ou backfill |
| R5-5 — busca, links e retorno | Parcialmente materializado; refinamentos avançados adiados |
| R1-1 e R1-4 residuais | Evolução condicionada a risco ou necessidade comprovada |
| R1-5 — concorrência otimista completa | Evolução condicionada a conflito real ou requisito de escala |
| R2 — paginação e consultas remotas | Evolução condicionada ao crescimento da base ou perda mensurável de desempenho |
| R4-4 — painel administrativo de qualidade | Evolução condicionada a rotina administrativa comprovada |
| R6 — Meu Trabalho e alertas | Capacidades atuais materializadas; motor e refinamentos condicionados a evidência |
| R7 — Relatórios | Exportação atual materializada; Central e modelos adicionais condicionados à rotina comprovada |
| R8 — Painel gerencial | Radar e leituras atuais materializados; painéis adicionais condicionados |
| R9 — Preferências e visões | URL e buscas recentes materializadas; preferências persistidas condicionadas |
| R10 — Acesso | Autenticação e papéis materializados; recuperação de senha é complemento essencial; demais extensões condicionadas |
| R11 — Observabilidade e release | Controles atuais preservados; observabilidade proporcional e correções são obrigações, não backlog opcional |
| R12 — Contrato e homologação final | Gate obrigatório antes da entrega; não é evolução opcional |
| Trilho B e incorporação do legado | Preservado; decisões tomadas quando fonte, formato e necessidade material forem conhecidos |
| E2 — retirada final de dados reais da árvore | Obrigação de segurança antes da entrega final; não é funcionalidade opcional |

Itens de integridade, segurança, preservação informacional, acessibilidade, correção de defeito e compatibilidade com o legado não são dispensados por esta simplificação.

### 5.2 Rebaseline dos ciclos históricos 6 a 13

Os ciclos 6 a 13 do Plano Mestre v1.0 são referência histórica, não uma fila atual. Seus objetivos de negócio ficam reconciliados assim:

| Ciclo histórico | Leitura material vigente | Tratamento |
|---|---|---|
| 6 — Prazos e qualidade | núcleo entregue pelo R4, Radar, filtros e Excel | concluído no essencial; painel de saneamento condicionado |
| 7 — Andamentos e prontuário | banco e drawer existentes; interface completada pelo R5 Essencial | complemento essencial pequeno, sem nova arquitetura |
| 8 — Meu Trabalho e alertas | carteira pessoal, indicadores e filtros materializados | preservar; lista ampliada de atenção é recomendável, mas separável e condicionada ao uso |
| 9 — Central de Relatórios | Excel analítico já atende múltiplos recortes | modelos adicionais somente por demanda administrativa concreta |
| 10 — Painel gerencial | Radar de Governança materializado | concluído na dimensão inicial; métricas temporais aguardam histórico nativo maduro |
| 11 — Visões e preferências | URL, rotas e buscas recentes preservam contexto | backlog opcional condicionado a repetição real de trabalho |
| 12 — Acesso e login | autenticação e administração de acesso existentes | recuperação de senha é a única lacuna funcional essencial identificada |
| 13 — Encerramento | governança, testes e release já avançados | gate final obrigatório após os complementos essenciais, E2 e segurança |

Essa matriz substitui expressamente qualquer leitura que mande executar os ciclos históricos em sequência. O R2 volta a ser avaliado antes de uma incorporação massiva somente se o volume real exigir; o Trilho B aguarda fonte real do legado.

## 6. Ausências deliberadas

O R5 Essencial não cria:

- nova estrutura de banco ou alteração de dados; existe somente a migration de endurecimento dos wrappers anteriores ao R4;
- nova tabela, taxonomia ou categoria histórica;
- página completa adicional para a demanda;
- snapshots retroativos de autoria;
- backfill de qualquer informação não comprovada;
- paginação remota, cursor histórico ou mecanismo novo de concorrência;
- restauração de produto, exclusão física ou ampliação de permissões;
- implementação automática de extensões futuras.

## 7. Gate de conclusão

O pacote estará pronto para homologação quando:

- o andamento puder ser registrado em até 30 segundos no fluxo comum;
- o status permanecer inalterado no andamento;
- uma demanda encerrada puder ser reaberta por transição explícita e auditável;
- leitor e demanda encerrada não exibirem a ação indevida de andamento;
- o prontuário atual oferecer as ações essenciais sem perder o contexto da carteira;
- os testes e a documentação provarem que nenhuma regra de banco ou permissão foi enfraquecida;
- os nomes antigos de andamento e status não contornarem a justificativa temporal nem admitirem `service_role`;
- a solicitação de recuperação usar mensagem neutra e destino autorizado;
- somente uma sessão de recuperação válida puder definir a nova senha;
- link inválido ou expirado não abrir o formulário de alteração.

Após homologação e publicação controlada do R5 Essencial e da recuperação de senha, não há continuação funcional automática do plano. A próxima atividade deve ser escolhida pelo valor operacional comprovado, mantendo E2 e o encerramento consolidado como gates obrigatórios antes da entrega final.
