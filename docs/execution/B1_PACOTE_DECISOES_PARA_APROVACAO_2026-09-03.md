# B1 — Pacote de decisões para aprovação

**Data:** 3 de setembro de 2026  
**Status:** proposta para deliberação; nenhuma decisão abaixo está aprovada por este documento  
**Base factual:** código atual, GOV-009, Plano Integrado v3.1 e pré-flight B1 de 03/09/2026.

Este documento aplica GOV-003 às decisões B1-D01 a B1-D09. Recomendações são explicitamente identificadas como recomendações e não autorizam implementação.

---

## B1-D01 — Arquitetura de entrada

### Como funciona hoje
O fluxo histórico transforma arquivos locais em um payload já saneado e usa `importar_sme_demandas_lote`. No apply, a RPC grava diretamente em `sme_demandas`.

### Mudança concreta
Criar uma área privada administrativa de ingestão. A fonte e cada linha entram primeiro nessa camada. Somente registros posteriormente considerados aptos são promovidos à tabela operacional.

### Usuários afetados
Administradores responsáveis por migração e saneamento. Usuários comuns não acessariam a fonte bruta.

### Cenário real
Uma linha chega com número identificável, mas classificação antiga desconhecida. Hoje ela não cabe no payload operacional. Com estágio intermediário, a linha inteira é preservada e fica pendente sem criar demanda artificial.

### Alternativas
A. inserção direta condicionada;  
B. estágio intermediário;  
C. espelho paralelo completo.

### Recomendação
**B — estágio intermediário.**

### Impactos
**Positivos:** preservação integral, dry-run real, revisão progressiva, idempotência, isolamento de inconsistências.  
**Negativos:** novas tabelas privadas, fluxo administrativo e maior implementação inicial.

### Dependências
Bloqueia B2 inteiro e condiciona B1-D05/B1-D07/B1-D09.

### Reversibilidade
Alta antes de qualquer carga real. Depois de cargas reais, remover o estágio exigiria migração de proveniência e pendências.

### Decisão solicitada
Aprovar B, escolher A/C ou adiar.

---

## B1-D02 — Identidade mínima para promoção

### Como funciona hoje
O importador histórico exige número, assunto, responsável, setor, status, tipo e classificação válidos antes de aceitar uma linha.

### Mudança concreta
Separar identidade da demanda de completude operacional. Toda linha é preservada; promoção exige somente identidade segura, começando por número identificável e não ambiguamente duplicado, além dos critérios semânticos aprovados em B1-D03.

### Usuários afetados
Administradores de migração e, depois da promoção, a equipe que consulta as demandas.

### Cenário real
Uma linha possui número oficial e assunto, mas responsável antigo sem correspondência. Ela pode continuar preservada e, se as demais regras permitirem, ser promovida com pendência explícita em vez de ser descartada ou receber um responsável inventado.

### Alternativas
A. manter todos os campos atuais obrigatórios;  
B. número seguro como identidade mínima e demais lacunas tratadas separadamente;  
C. promover qualquer linha com identificador técnico artificial.

### Recomendação
**B.** Nunca criar identificador fictício para simular identidade oficial.

### Impactos
**Positivos:** amplia preservação e evita bloqueio desnecessário.  
**Negativos:** exige estados de qualidade e regras claras de promoção.

### Dependências
B1-D03, B1-D06 e B3-D01.

### Reversibilidade
Média. Critérios podem ficar mais restritivos no futuro para novas promoções, mas registros já promovidos precisam ser preservados.

### Decisão solicitada
Aprovar B, manter A ou definir outro conjunto mínimo.

---

## B1-D03 — Domínios desconhecidos

### Como funciona hoje
O normalizador infere `tipo` a partir do número e usa `Outros` como classificação padrão. A RPC exige catálogos fechados.

### Mudança concreta
Preservar sempre o valor original. Quando status, tipo ou classificação não tiver correspondência comprovável, não transformar a ausência em valor atual aparentemente conhecido.

### Usuários afetados
Administradores de migração; usuários operacionais somente quando uma linha for promovida com incerteza explicitamente suportada.

### Cenário real
O legado não envia classificação. Em vez de gravar `Outros`, a ingestão registra o campo como ausente/desconhecido e preserva a fonte.

### Alternativas
A. manter na ingestão até mapear;  
B. campo original + normalizado opcional;  
C. estado explícito pendente;  
D. valor transitório controlado.

### Recomendação
Combinar **A + B** como padrão. Usar C apenas se o schema operacional aprovado representar claramente a incerteza. Não usar D como certeza artificial.

### Impactos
**Positivos:** fidelidade ao legado e ausência de invenção.  
**Negativos:** mais linhas podem ficar pendentes antes da promoção.

### Dependências
B1-D02, B3-D01 e futura revisão B4.

### Reversibilidade
Alta enquanto os dados permanecem na ingestão. Baixa se valores inventados forem promovidos, porque depois seria difícil distinguir informação real de preenchimento técnico.

### Decisão solicitada
Aprovar A+B com C condicionado, ou escolher outra política explícita.

---

## B1-D04 — Catálogo de aliases

### Como funciona hoje
Há normalizações e mapeamentos históricos específicos, mas não um catálogo B1 persistente, auditável e reutilizável para cada carga futura.

### Mudança concreta
Criar catálogo administrativo de alias → identidade oficial, mantendo texto original, chave normalizada, UUID, aprovador, data, vigência, substituição e lotes que usaram o vínculo.

### Usuários afetados
Administradores de migração e saneamento.

### Cenário real
`Jaqueline IHA` é reconhecida como um perfil oficial. A decisão passa a existir como regra auditável, não apenas como conhecimento embutido em migration passada.

### Alternativas
A. mapa codificado em migration;  
B. mapa manual por lote;  
C. catálogo persistente e auditável.

### Recomendação
**C.**

### Impactos
**Positivos:** reuso, auditoria, revisão e rastreabilidade.  
**Negativos:** nova superfície administrativa e governança do catálogo.

### Dependências
B2-C e B1-D08 para eventos de vínculo posterior.

### Reversibilidade
Alta para aliases ainda não usados. Alterar alias já usado exige preservar histórico do vínculo anterior.

### Decisão solicitada
Aprovar C, escolher A/B ou adiar.

---

## B1-D05 — Granularidade do apply

### Como funciona hoje
A RPC histórica aplica o lote integral em uma única transação. Uma colisão ou erro impede o conjunto.

### Mudança concreta
Preservar a fonte integral, mas permitir promoção de **sublotes canônicos aprovados**, mantendo contabilidade explícita do que ficou pendente.

### Usuários afetados
Administradores de migração.

### Cenário real
De 3.201 linhas, 3.150 estão aptas e 51 têm conflito. O sistema pode promover somente um sublote formalmente aprovado sem perder ou esconder as 51 pendências.

### Alternativas
A. lote integral atômico;  
B. todos os registros aptos automaticamente;  
C. sublotes aprovados;  
D. promoção individual.

### Recomendação
**C.** Não promover automaticamente tudo que o software considere apto sem uma aprovação administrativa do recorte.

### Impactos
**Positivos:** não bloqueia a carga inteira por poucas pendências; mantém controle.  
**Negativos:** exige versionamento e recibos de sublote.

### Dependências
B1-D01, B1-D06, B2-D e B2-E.

### Reversibilidade
Alta antes do apply; após apply exige compensação conforme B1-D09.

### Decisão solicitada
Aprovar C ou escolher outra granularidade.

---

## B1-D06 — Processos já existentes

### Como funciona hoje
Duplicidades dentro do lote e colisões com `sme_demandas` são bloqueadas. Não existe classificação persistente do tipo de repetição.

### Mudança concreta
Comparar cada repetição e classificá-la como: idêntica, complementar, conflitante, atualização legítima ou duplicidade ambígua. Nunca aplicar a regra “último arquivo vence”.

### Usuários afetados
Administradores de migração; equipe operacional quando uma atualização aprovada alcançar demanda existente.

### Cenário real
O mesmo número já existe no SITE CTRH com histórico produzido pela equipe. O legado traz assunto diferente. O importador não sobrescreve. A divergência vira ocorrência para análise.

### Alternativas
A. rejeitar toda repetição;  
B. último arquivo vence;  
C. comparação + decisão explícita;  
D. duplicar a demanda.

### Recomendação
**C.**

### Impactos
**Positivos:** preserva trabalho atual e torna conflitos auditáveis.  
**Negativos:** exige comparador e fluxo de decisão.

### Dependências
Informação externa sobre extrações, B1-D05, B2-D e B3.

### Reversibilidade
Alta enquanto conflito está na ingestão. Baixa se sobrescrita silenciosa for permitida.

### Decisão solicitada
Aprovar C ou definir outra regra.

---

## B1-D07 — Visibilidade das linhas não promovidas

### Como funciona hoje
Pendências existem em CSV/XLSX local. Não há área persistente do produto para acompanhar linhas recebidas mas não promovidas.

### Mudança concreta
Manter duas superfícies: área administrativa protegida e relatório exportável.

### Usuários afetados
Administradores. Usuários comuns não precisam acessar fonte bruta.

### Cenário real
Uma linha fica pendente por alias ambíguo. Ela aparece no painel administrativo com motivo e também no relatório do lote, sem aparecer na carteira operacional.

### Alternativas
A. relatório externo;  
B. área administrativa;  
C. ambos.

### Recomendação
**C.**

### Impactos
**Positivos:** saneamento contínuo, rastreabilidade e conferência externa.  
**Negativos:** exige UI administrativa posterior e política de retenção.

### Dependências
B1-D01, B2-E e política de permissões.

### Reversibilidade
Alta. A UI pode mudar sem perder a ingestão.

### Decisão solicitada
Aprovar C ou escolher A/B.

---

## B1-D08 — Histórico existente no legado

### Como funciona hoje
A carga histórica atual trabalha principalmente com snapshot de demanda. A RPC cria um evento técnico de importação, mas não reconstrói fatos históricos ausentes.

### Mudança concreta
Importar eventos antigos somente quando a fonte fornecer fatos comprováveis. Distinguir snapshot de trajetória histórica e nunca inventar autoria ou sequência.

### Usuários afetados
Toda a equipe que consulta prontuário, além dos administradores de migração.

### Cenário real
Se a futura extração trouxer apenas status atual `Tramitado`, isso não autoriza criar uma sequência fictícia de mudanças anteriores. Se trouxer eventos com data e autor verificáveis, esses fatos podem ser importados conforme contrato posterior.

### Alternativas
A. reconstruir trajetória por inferência;  
B. importar somente eventos comprováveis;  
C. não importar nenhum histórico legado.

### Recomendação
**B.**

### Impactos
**Positivos:** prontuário confiável.  
**Negativos:** histórico pode permanecer incompleto quando a fonte não trouxer eventos.

### Dependências
Informação externa sobre a futura extração e B5.

### Reversibilidade
Baixa se eventos fictícios forem criados. Alta se apenas fatos comprováveis forem aceitos.

### Decisão solicitada
Aprovar B como princípio, mantendo detalhes dependentes da fonte real.

---

## B1-D09 — Reversão

### Como funciona hoje
A RPC histórica é transacional antes do commit. Depois de uma aplicação concluída, não existe um contrato B1 de reversão por compensação e isolamento.

### Mudança concreta
Antes do commit, cancelar transação. Depois do commit, corrigir por operações compensatórias e isolamento lógico, preservando auditoria. Não usar deleção física em massa como rollback padrão.

### Usuários afetados
Administradores; usuários operacionais indiretamente quando uma promoção precisar ser revertida.

### Cenário real
Um sublote aplicado revela posteriormente um mapeamento incorreto. O sistema registra a reversão/correção e isola os efeitos, sem apagar a evidência de que a carga ocorreu.

### Alternativas
A. deleção física do sublote;  
B. restauração total de backup;  
C. compensação + isolamento lógico;  
D. correção manual sem trilha específica.

### Recomendação
**C**, mantendo backup como mecanismo de desastre e não como rollback cotidiano.

### Impactos
**Positivos:** preserva auditoria e dados criados depois da carga.  
**Negativos:** exige desenho de operações compensatórias.

### Dependências
B1-D05, modelo de auditoria B2 e regras de exclusão já existentes.

### Reversibilidade
A própria decisão define o mecanismo de reversão; é mais segura quando adotada antes da primeira carga.

### Decisão solicitada
Aprovar C ou escolher outra estratégia.

---

# Ordem recomendada de aprovação

Para evitar decisões dependentes de uma base ainda indefinida:

1. B1-D01 — arquitetura;
2. B1-D02 — identidade mínima;
3. B1-D03 — domínios desconhecidos;
4. B1-D04 — aliases;
5. B1-D06 — processos existentes;
6. B1-D05 — granularidade do apply;
7. B1-D07 — visibilidade;
8. B1-D08 — histórico;
9. B1-D09 — reversão.

Após as decisões aplicáveis serem registradas no Registro de Decisões, pode começar o B2-A com dados exclusivamente sintéticos.
