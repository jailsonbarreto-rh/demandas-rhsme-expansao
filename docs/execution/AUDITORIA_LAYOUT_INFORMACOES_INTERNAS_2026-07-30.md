# Auditoria de Layout — Informações Internas e Linguagem de Sistema

**Data:** 30 de julho de 2026  
**Projeto:** Central de Demandas CTRH  
**Branch:** `fix/layout-user-facing-information-audit`  
**Estado:** implementação e validação concluídas; aguardando integração e publicação controlada  
**Natureza:** correção transversal de apresentação; sem mudança de regra de negócio, banco ou permissões

## 1. Objetivo

Revisar todas as superfícies visuais atuais para identificar elementos tecnicamente corretos que não deveriam ter sido expostos ao usuário final, especialmente após as implementações do R4 e do R5-1.

A auditoria procurou:

- regras de transição ou migração apresentadas como texto permanente;
- identificadores numéricos ou UUIDs;
- nomes de colunas e campos internos;
- referências a migrations, lotes, hashes e versões técnicas;
- mensagens brutas do Supabase, PostgREST ou PostgreSQL;
- jargão de implementação em ações e textos de apoio;
- dados administrativos sem utilidade operacional para o usuário.

## 2. Superfícies examinadas

Foram analisados:

1. tela de acesso e primeiro acesso;
2. cabeçalho, cartões e navegação;
3. Radar de Governança;
4. carteira geral e carteira pessoal;
5. filtros;
6. tabela de demandas e menus de ação;
7. modal de nova demanda;
8. modal de edição;
9. modal de alteração de status;
10. controles de prazo e próxima providência;
11. drawer de detalhe;
12. histórico individual;
13. registros recentes do Radar;
14. exclusão lógica;
15. área administrativa;
16. lixeira administrativa e detalhe somente leitura;
17. avisos, notificações e mensagens de erro;
18. exportação e textos associados.

## 3. Exposições indevidas corrigidas

### 3.1 Edição da demanda

Foram removidos:

- `ID: <número interno>`;
- a expressão `Responsável legado`;
- o aviso permanente sobre primeira inclusão de prazo ausente no legado;
- o textarea pequeno e sempre visível de justificativa.

Novo comportamento:

- o campo `Motivo da alteração *` aparece somente quando a alteração atual exige justificativa;
- a primeira inclusão de um prazo antes ausente em registro importado continua sem exigir motivo;
- o campo ocupa toda a largura disponível, possui altura adequada e não pode ser redimensionado pelo navegador;
- a orientação exibida é: `O motivo será registrado no histórico da demanda.`;
- a validação informa objetivamente o que falta no momento do salvamento.

### 3.2 Prazos

Os controles deixaram de mencionar registro legado ou exceção transitória. Os estados agora usam mensagens diretas:

- `Nenhuma data foi informada para este prazo.`;
- `Este prazo não se aplica à demanda.`

A regra interna de preservação permanece inalterada.

### 3.3 Histórico e detalhe

Foram retirados da apresentação:

- UUIDs de responsável e autor;
- campos como `responsavel_id`, `created_by`, `deleted_by` e demais identificadores;
- nomes crus de colunas com sublinhado;
- referências a `migração R3`, lote, hash e sistema legado.

O histórico agora:

- exibe somente alterações compreensíveis e previamente mapeadas;
- traduz os estados dos prazos para linguagem legível;
- apresenta importações técnicas como `Cadastro inicial`;
- apresenta vinculação técnica de responsável como `Cadastro do responsável atualizado.`;
- preserva eventos operacionais escritos pelo usuário sem alteração de conteúdo.

### 3.4 Radar de Governança

Foram substituídos:

- `Vínculo legado pendente` por `Responsável não vinculado`;
- `Processo #<id interno>` por `Processo não localizado` quando não há correlação segura.

Os indicadores e cálculos analíticos não foram alterados.

### 3.5 Mensagens de erro

Foi criada uma barreira comum de apresentação para impedir que o layout revele:

- códigos `PGRST` ou `SQLSTATE`;
- nomes de relations, functions, schemas, colunas ou constraints;
- mensagens de RLS, PostgreSQL ou Supabase;
- URLs, stack traces ou objetos técnicos.

Mensagens de negócio legíveis são preservadas. Erros comuns de autenticação recebem tradução específica, como `E-mail ou senha incorretos.`

### 3.6 Área administrativa

Foram simplificados:

- `Exportar Backup (JSON)` para `Exportar cópia de segurança`;
- `Rodar Diagnóstico` para `Verificar acessos`;
- `Whitelist institucional` para `Domínio autorizado`;
- `Prazos semânticos` para `Alerta de prazo`;
- `Usuários e Papéis` para `Perfis e níveis de acesso`.

Os avisos de integridade deixaram de revelar UUIDs. A lixeira também não apresenta mensagens técnicas brutas quando a consulta falha.

## 4. Informações mantidas conscientemente

Não foram removidas informações com utilidade legítima:

- nome, e-mail, nível, setor e status dos perfis na área exclusiva de administração;
- número do processo ou documento;
- tipo, assunto, responsável, setor, prazos, status e classificação;
- autoria e motivo de exclusão quando comprováveis;
- indicação de origem importada no detalhe administrativo da lixeira, por possuir valor de auditoria;
- identificadores internos nos modelos, contratos, migrations, testes e banco, desde que não renderizados ao usuário;
- dados técnicos no arquivo de cópia de segurança administrativa, que não são apresentados como texto da interface.

## 5. Limites do pacote

Esta auditoria não altera:

- regras de prazo ou justificativa;
- tratamento do legado;
- modelo de dados;
- migrations ou grants do Supabase;
- permissões por papel;
- indicadores do Radar;
- exportação analítica;
- decisões do R5-2 sobre andamento, transição de status ou reabertura.

## 6. Proteções automatizadas

Foram adicionados ou atualizados testes para impedir o retorno de:

- ID numérico no modal de edição;
- `Responsável legado` e textos de transição;
- campo de motivo fora do contexto correto;
- UUID e nomes técnicos no histórico;
- referências a migrations, lotes e hashes;
- `Vínculo legado pendente` e `Processo #ID` no Radar;
- mensagens brutas de infraestrutura;
- UUIDs nos diagnósticos administrativos.

## 7. Validação

### 7.1 TDD e suíte focal

- RED comprovado no deployment `dpl_AWA5TTQThV46wUo6V4eCxEmehQsv`;
- suíte focal: `dpl_FPFf5NRfANxgqpzhS95dREM4WWnT` — 8 arquivos e 32 testes aprovados;
- regressões textuais: `dpl_PKAXbykjmV7sSjan6HqRaZsMe9wQ` — 4 arquivos e 13 testes aprovados.

### 7.2 Gate canônico exato

Deployment `dpl_6g7e6UUv9Gg88iepSTzchKB31mqa` — `READY`, derivado do SHA funcional `db2623d24fa7a310600e192aae70003c2eec9740` com apenas a habilitação temporária do gate.

Resultados:

- auditoria de dependências: zero vulnerabilidades;
- 560 pacotes com assinaturas verificadas;
- 147 pacotes com atestações verificadas;
- compatibilidade transitiva: 3/3;
- documentação canônica: 9/9;
- lint: aprovado;
- 71 arquivos de teste aprovados;
- 328 testes unitários e de integração aprovados;
- cobertura global de linhas: 81,71%;
- TypeScript e build Vite: aprovados;
- bundle inicial: 194.126 bytes, 60,16% abaixo da linha de base;
- limite de bundle preservado em 560.330 bytes;
- inspeção pública aprovada.

### 7.3 Navegador

Deployment específico `dpl_HVXwqDrJmgn5CbsvHAbgDj3WVLhN`:

- 2 de 2 novos cenários aprovados;
- desktop Chromium;
- mobile com largura de 320 px;
- ausência de ID e linguagem de transição no modal;
- campo de motivo oculto inicialmente;
- exibição contextual após alteração auditável;
- largura integral, altura mínima e redimensionamento desativado.

Os 22 cenários regressivos existentes também foram executados durante a auditoria e permaneceram aprovados após a atualização das expectativas textuais legítimas.

## 8. Supabase

Nenhuma migration, RPC, policy, grant, coluna ou registro foi alterado. O pacote atua apenas na camada de apresentação, validação do frontend e tratamento seguro das mensagens recebidas.

## 9. Conclusão

As ocorrências identificadas eram problemas de apresentação, não de regra ou persistência. A correção mantém todas as decisões de produto vigentes e estabelece uma fronteira explícita: dados e regras técnicas podem existir internamente, mas a interface deve apresentar somente informações compreensíveis, úteis e acionáveis para cada perfil de usuário.
