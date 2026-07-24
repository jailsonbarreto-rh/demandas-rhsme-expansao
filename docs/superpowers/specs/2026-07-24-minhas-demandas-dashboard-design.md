# Minhas Demandas no Dashboard — Design aprovado

**Data:** 24 de julho de 2026  
**Status:** aprovado para implementação após revisão deste documento  
**Escopo:** continuação funcional do R3 — uso da identidade oficial de responsável na experiência do usuário

## 1. Objetivo

Criar, na primeira tela do sistema, um acesso visualmente destacado para que o usuário conectado abra rapidamente sua própria carteira de processos.

A funcionalidade utilizará exclusivamente a correlação oficial já implantada entre `sme_demandas.responsavel_id` e o UUID do usuário autenticado.

## 2. Solução visual aprovada

Será utilizado um bloco central de destaque, correspondente à alternativa visual B aprovada.

O bloco será exibido na Visão geral, imediatamente abaixo de `Atenção agora` e antes das distribuições gerais do dashboard.

Conteúdo textual exato:

- título: `Minhas demandas`;
- subtítulo: `Acompanhe sua carteira de processos.`;
- botão principal: `Acessar minha carteira`.

O bloco não exibirá contadores, indicadores adicionais, listas prévias, explicações extensas ou textos auxiliares.

## 3. Comportamento

Ao acionar `Acessar minha carteira`, o sistema deverá:

1. abrir a rota de demandas;
2. aplicar `DemandFilters.scope = 'meu'`;
3. utilizar o UUID do usuário autenticado como `currentUserId` no mecanismo de filtragem já existente;
4. exibir apenas demandas cujo `responsavel_id` corresponda ao usuário conectado;
5. manter os demais filtros disponíveis para refinamento adicional.

A URL deverá registrar `escopo=meu`, utilizando a serialização existente, para preservar recarregamento, navegação e compartilhamento interno da rota.

## 4. Estado visual na tela de demandas

Quando o escopo pessoal estiver ativo, a tela de demandas deverá indicar claramente `Minhas demandas` como filtro aplicado.

O usuário deverá conseguir retornar à carteira geral da equipe por uma ação visível de limpeza ou troca de escopo, preservando os valores atuais dos demais filtros.

Não será criada uma segunda tela, uma lista paralela ou um novo conjunto de regras de consulta.

## 5. Regras preservadas

Esta entrega não altera:

- permissões de administrador, editor ou leitor;
- regras de criação, edição, exclusão ou consulta;
- status de perfis;
- definição de responsável oficial;
- possibilidade de uma demanda permanecer sem responsável;
- tratamento histórico de `Vanessa Migrado`;
- lógica de prazos, status, alertas ou classificações;
- dashboards e indicadores não relacionados ao novo acesso pessoal.

## 6. Casos de uso

### Usuário com demandas atribuídas

O usuário acessa a Visão geral, seleciona `Acessar minha carteira` e visualiza somente as demandas oficialmente vinculadas ao seu UUID.

### Usuário sem demandas atribuídas

O bloco permanece visível com o mesmo título, subtítulo e botão. Ao acessar a carteira, a tela de demandas apresenta o estado vazio já adotado pelo sistema, sem inventar mensagens ou regras adicionais fora do escopo.

### Demanda histórica sem UUID

Uma demanda como `Vanessa Migrado`, mantida sem `responsavel_id`, não será incluída na carteira pessoal de qualquer usuário.

## 7. Responsividade e acessibilidade

- O bloco deverá manter hierarquia visual forte em desktop e mobile.
- O botão deverá ser um controle semântico, navegável por teclado e com foco visível.
- Título, subtítulo e ação deverão permanecer legíveis sem truncamento.
- O bloco não deverá introduzir rolagem horizontal.
- A ordem de leitura deverá permanecer: `Atenção agora` → `Minhas demandas` → indicadores gerais.

## 8. Arquitetura prevista

A implementação deverá reutilizar:

- o UUID da sessão autenticada;
- `DemandFilters.scope = 'meu'`;
- `ApplyDemandFiltersContext.currentUserId`;
- `applyDemandBaseFilters`;
- `parseDemandFilters` e `serializeDemandFilters`;
- a rota existente `/demandas`.

Não será necessário definir `responsibleId` para abrir a carteira pessoal: o escopo `meu`, combinado com `currentUserId`, já realiza a associação oficial por UUID.

A apresentação visual deverá ficar isolada em componente próprio ou em uma unidade claramente delimitada dentro da Visão geral, sem ampliar desnecessariamente a responsabilidade de `App.tsx`.

## 9. Testes obrigatórios

A implementação deverá comprovar:

1. renderização do bloco na primeira tela;
2. presença exata dos três textos aprovados;
3. navegação para `/demandas?escopo=meu` sem apagar filtros que devam ser preservados;
4. filtragem pelo UUID do usuário autenticado;
5. exclusão de demandas de outros usuários e de registros sem UUID;
6. possibilidade de retornar à carteira da equipe;
7. preservação dos demais filtros;
8. comportamento responsivo e acessível básico;
9. ausência de alterações em permissões ou regras adjacentes.

## 10. Critérios de aceite

A entrega será considerada correta quando:

- o bloco aprovado estiver na posição definida;
- não houver textos ou indicadores adicionais;
- `Acessar minha carteira` abrir a listagem pessoal correta;
- a tela indicar claramente o escopo pessoal ativo;
- o usuário puder retornar à visão da equipe;
- os testes e o build completo passarem;
- nenhuma regra de negócio não autorizada tiver sido modificada.
