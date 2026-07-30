# Auditoria de Layout — Informações Internas e Linguagem de Sistema

**Data:** 30 de julho de 2026  
**Projeto:** Central de Demandas CTRH  
**Branch funcional:** `fix/layout-user-facing-information-audit`  
**Estado:** implementação integrada, homologada e publicada em Production  
**Natureza:** correção transversal de apresentação; sem alteração de banco, permissões ou regras do R5-2

## 1. Objetivo

Revisar todas as superfícies visuais atuais para identificar elementos tecnicamente corretos que não deveriam ser apresentados ao usuário final, especialmente após as implementações do R4 e do R5-1.

A auditoria procurou:

- regras de transição ou migração apresentadas como texto permanente;
- identificadores numéricos ou UUIDs;
- nomes de colunas e campos internos;
- referências a migrations, lotes, hashes e versões técnicas;
- mensagens brutas do Supabase, PostgREST ou PostgreSQL;
- jargão de implementação em ações e textos de apoio;
- dados administrativos sem utilidade operacional para o usuário;
- campos visualmente incompatíveis com o padrão profissional do produto;
- orientações de regra que não apareciam no momento adequado do fluxo.

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
- a orientação exibida é `O motivo será registrado no histórico da demanda.`;
- ao tentar salvar sem o motivo obrigatório, a interface informa `Informe o motivo da alteração para continuar (mínimo de 10 caracteres).`.

### 3.2 Nova demanda

Todos os campos funcionais foram preservados:

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

A verificação final identificou e corrigiu dois pontos:

1. o campo `Próxima providência` passou a ocupar integralmente a área disponível, com altura mínima, borda, foco, tipografia e rótulo flutuante consistentes com os demais controles;
2. ao clicar em `Salvar` com prazo interno ausente ou inválido, o sistema passa a abrir a mensagem explicativa `Prazo interno obrigatório`, sem ocultar os erros específicos junto aos campos.

A mensagem apresentada é:

> Toda nova demanda deve possuir um prazo interno definido. Informe a data antes de salvar o cadastro.

Quando o usuário escolhe um status ativo, as regras de continuidade permanecem informadas junto aos campos, em linguagem direta:

- `Descreva a próxima providência com pelo menos 5 caracteres.`;
- `Informe a data de acompanhamento.`

### 3.3 Prazos

Os controles deixaram de mencionar registro legado ou exceção transitória. Os estados agora usam mensagens diretas:

- `Nenhuma data foi informada para este prazo.`;
- `Este prazo não se aplica à demanda.`

A regra interna de preservação permanece inalterada. Mensagens específicas, como data parcialmente preenchida, também foram preservadas.

### 3.4 Histórico e detalhe

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

### 3.5 Radar de Governança

Foram substituídos:

- `Vínculo legado pendente` por `Responsável não vinculado`;
- `Processo #<id interno>` por `Processo não localizado` quando não há correlação segura.

Os indicadores, cálculos analíticos e filtros por carteira não foram alterados.

### 3.6 Mensagens de erro

Foi criada uma barreira comum de apresentação para impedir que o layout revele:

- códigos `PGRST` ou `SQLSTATE`;
- nomes de relations, functions, schemas, colunas ou constraints;
- mensagens de RLS, PostgreSQL ou Supabase;
- URLs, stack traces ou objetos técnicos.

Mensagens de negócio legíveis são preservadas. Erros comuns de autenticação recebem tradução específica, como `E-mail ou senha incorretos.`

### 3.7 Área administrativa

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
- migrations, RPCs, policies ou grants do Supabase;
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
- UUIDs nos diagnósticos administrativos;
- perda de campos dos formulários;
- ausência da orientação de prazo interno ao salvar uma nova demanda;
- regressão de largura, altura ou overflow nos formulários desktop e mobile.

## 7. Validação final

### 7.1 Gate técnico e visual combinado

Deployment de validação: `dpl_8vU2o1ojgQDsjck7twsaaYUbJwGd` — `READY`.

Base funcional validada: `a78aa8867ff5704fbeae58a540cf28f9f21ca9c2`.

Resultados:

- auditoria de dependências: zero vulnerabilidades;
- 560 pacotes com assinaturas verificadas;
- 147 pacotes com atestações verificadas;
- compatibilidade transitiva: 3/3;
- documentação canônica: 9/9;
- lint: aprovado;
- 71 arquivos de teste aprovados;
- 328 testes unitários e de integração aprovados;
- cobertura global de linhas: 81,74%;
- TypeScript e build Vite: aprovados;
- bundle inicial: 194.126 bytes, 60,16% abaixo da linha de base;
- inspeção pública: aprovada.

### 7.2 Navegador

No mesmo deployment foram aprovados quatro cenários focais:

- edição em desktop;
- nova demanda em desktop;
- edição em mobile de 320 px;
- nova demanda em mobile de 320 px.

Os cenários confirmaram:

- preservação de todos os campos funcionais;
- ausência de UUIDs, nomes de banco e termos técnicos indevidos;
- exibição contextual do motivo na edição;
- mensagem explicativa ao salvar alteração sem motivo;
- mensagem explicativa ao salvar nova demanda sem prazo interno;
- erros específicos junto aos campos;
- largura e altura adequadas dos controles;
- ausência de overflow horizontal.

Os 22 cenários regressivos existentes também permaneceram aprovados em desktop e mobile, incluindo acessibilidade, navegação, filtros, modais, exportação e console.

## 8. Integração e publicação

- PR funcional: **#109**;
- merge funcional: `8ae2ff95152371ccc6ada2dc4580010b311b79e4`;
- PR de release: **#110**;
- merge de release: `2bc78dca066b0c4d592b4e6c5bc4c4db5290b507`;
- deployment de Production: `dpl_7G72xFXcQUKtYELrGhXha1xi7UPE` — `READY`;
- domínio principal: HTTP 200;
- `/demandas`: HTTP 200;
- `/admin`: HTTP 200;
- rewrites SPA preservados.

O bloqueio de deployments automáticos foi restaurado no PR de encerramento operacional.

## 9. Supabase

Nenhuma migration, RPC, policy, grant, coluna ou registro foi alterado. O pacote atua apenas na camada de apresentação, validação do frontend e tratamento seguro das mensagens recebidas.

## 10. Conclusão

As ocorrências identificadas eram problemas de apresentação, orientação e consistência visual, não de persistência. A correção mantém as decisões de produto vigentes e estabelece uma fronteira explícita: dados e regras técnicas podem existir internamente, mas a interface deve apresentar somente informações compreensíveis, úteis e acionáveis para cada perfil de usuário.