# R3 — Responsáveis oficiais vinculados a usuários

## Objetivo

Substituir a identificação livre de responsáveis por uma relação oficial entre `sme_demandas.responsavel_id` e `perfis_usuarios.id`, preservando os dados históricos e sem alterar permissões, papéis, status, fluxos ou demais regras de negócio.

## Escopo autorizado

1. Migrar 378 demandas históricas para os perfis oficiais correspondentes.
2. Preservar `Vanessa Migrado` com `responsavel_id = null`, pois não existe perfil oficial de Vanessa.
3. Associar `Jaqueline IHA` ao perfil de Jaqueline Lima Ximenes Melo.
4. Associar todos os nomes com sufixo `Migrado` ao usuário oficial de mesmo nome, exceto Vanessa.
5. Substituir o campo livre de responsável por seleção de usuários cadastrados nas telas de criação e edição.
6. Permitir na seleção qualquer usuário cadastrado em `perfis_usuarios`, independentemente de papel ou status.
7. Preservar a possibilidade atual de demanda sem responsável: vazio continua permitido, mas texto livre deixa de ser aceito.
8. Em uma demanda legada ainda sem vínculo, permitir edição de outros campos sem apagar o texto histórico; qualquer nova atribuição deverá escolher um perfil oficial.

## Mapeamento histórico aprovado

| Texto legado | Perfil oficial | Quantidade |
|---|---|---:|
| Erica / Erica Migrado | ERICA VALIM DE ALMEIDA HOLANDA | 147 |
| Giselle / Giselle Migrado | GISELLE TORRES FIQUENE | 82 |
| Sabrina | SABRINA ANDRADE FIGUEIREDO OLIVEIRA | 69 |
| Thiago / Thiago Migrado | THIAGO KUBRUSLY DE FREITAS | 40 |
| Jaqueline / Jaqueline Migrado / Jaqueline IHA | JAQUELINE LIMA XIMENES MELO | 28 |
| Jailson | Jailson Barreto da Silva | 7 |
| Jessica | JESSICA AGUIAR DURANTE | 2 |
| Beth / Beth Migrado | ELISABETH ARTEIRO DE MORAES | 2 |
| Helena | HELENA FERREIRA DA SILVA | 1 |
| Vanessa Migrado | sem perfil oficial; preservar texto e UUID nulo | 1 |

Total a vincular: 378. Total preservado sem vínculo: 1.

## Contrato de dados

- `responsavel_id` é a identidade oficial.
- `responsavel` é uma fotografia textual do nome oficial no momento da atribuição.
- Quando um UUID é informado, o banco consulta `perfis_usuarios` e grava o nome; o cliente não determina o texto oficial.
- Quando nenhum UUID é informado em uma demanda do sistema, `responsavel` deve ficar vazio.
- O único texto não vinculado após a migração é `Vanessa Migrado`, em registro de origem legada.
- A migração registra a alteração no histórico, preservando o texto anterior.

## Interface

### Nova demanda

- Campo `Responsável` vira `<select>`.
- Primeira opção vazia representa demanda sem responsável, preservando a regra atual.
- Demais opções são todos os usuários cadastrados, ordenados pelo nome.
- O formulário envia o UUID selecionado.

### Edição

- Demandas vinculadas mostram o usuário oficial selecionado.
- Demandas legadas sem UUID mostram o texto histórico em campo somente leitura e mantêm a seleção vazia até eventual reatribuição.
- A seleção contém somente perfis cadastrados.
- A justificativa geral já existente continua obrigatória e cobre eventual reatribuição.

## Proteções do servidor

- As RPCs de criação e edição validam o UUID em `perfis_usuarios` e derivam o nome oficial.
- Texto arbitrário enviado pelo cliente é ignorado quando há UUID e rejeitado quando tenta criar nova identificação sem UUID.
- A RPC legada de criação textual deixa de aceitar novos registros livres.
- Um gatilho no banco mantém coerência também contra chamadas fora da interface.
- Nenhuma permissão de papel ou política de acesso é alterada.

## Fora do escopo

- cadastro de Vanessa;
- alteração de papéis, status ou permissões;
- obrigatoriedade de responsável;
- filtros, dashboards ou página “Minhas demandas”;
- mudança de regras de prazos, status, histórico, exclusão ou visibilidade;
- renomeação retroativa automática quando um perfil mudar de nome no futuro.

## Critérios de aceite

1. 378 demandas com UUID correto e nome oficial.
2. `Vanessa Migrado` preservada, sem UUID.
3. Nenhuma outra demanda com texto não vazio e UUID nulo.
4. Nova criação não aceita responsável textual livre.
5. Edição não produz divergência entre UUID e nome.
6. Todos os perfis cadastrados aparecem como opções, independentemente de papel ou status.
7. Testes, lint e build aprovados.
8. Migração idempotente e auditável.
