# Refinamentos de Filtros e Paginação — Design

## Objetivo

Aprimorar a clareza da troca entre carteiras e da presença de filtros, além de reduzir paginação desnecessária na rotina diária.

## Escopo aprovado

1. Na carteira pessoal, substituir a ação `Ver todas as demandas` por `Demandas Equipe CTRH`.
2. Preservar todos os filtros ao alternar entre as carteiras.
3. Tornar a informação de filtros ativos visualmente dominante no resumo da filtragem.
4. Manter as opções atuais de quantidade por página.
5. Alterar o tamanho inicial da página de 10 para 50 resultados.
6. Acrescentar a opção de 100 resultados.

## Design do resumo de filtros

Quando houver filtros aplicados, o resumo exibirá um bloco destacado com ícone de filtro, contador e rótulo `1 filtro ativo` ou `N filtros ativos`. O total exibido permanecerá separado e legível. A ação `Limpar filtros` continuará disponível no extremo oposto da linha.

Quando não houver filtros, o resumo continuará discreto e mostrará apenas a quantidade total de demandas.

## Paginação

O seletor continuará oferecendo `10`, `25` e `50`, acrescentará `100` e iniciará em `50`. Qualquer mudança na coleção filtrada reiniciará somente o índice da página, preservando o tamanho selecionado.

## Limites

- Nenhuma alteração em Supabase, banco, permissões, responsabilidades ou regras das carteiras.
- Nenhuma remoção de opções existentes.
- Nenhuma mudança na preservação dos filtros durante a troca de carteira.
