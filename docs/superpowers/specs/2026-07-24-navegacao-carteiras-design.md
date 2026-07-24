# Navegação entre Carteira Geral e Minhas Demandas — Design

**Data:** 24 de julho de 2026  
**Status:** aprovado para implementação pelo responsável do produto

## 1. Problema

A implementação inicial tratou `Minhas demandas` tecnicamente como `scope=meu` dentro da mesma tela e o retorno para a carteira geral ficou associado a ações de filtro. Isso não corresponde ao modelo mental do usuário: ao acessar `Minhas demandas`, ele entende que entrou em outra área do sistema, não que ativou um filtro comum.

Consequências observadas:

- o caminho de retorno para todas as demandas não é evidente;
- `Limpar filtros` parece uma ação inadequada para trocar de carteira;
- a carteira pessoal só pode ser reencontrada facilmente voltando ao dashboard;
- a navegação não comunica que existem duas áreas permanentes e equivalentes: geral e pessoal.

## 2. Decisão de produto

A carteira geral e a carteira pessoal passam a ser áreas de navegação distintas.

### Rotas

- `/demandas`: carteira geral da equipe;
- `/minhas-demandas`: carteira pessoal do usuário autenticado;
- `/demandas?escopo=meu`: compatibilidade legada; redireciona para `/minhas-demandas`, preservando os demais parâmetros de busca e filtros.

A rota será a fonte de verdade do escopo. `scope` deixa de ser apresentado ou contado como filtro comum.

## 3. Navegação principal

A barra de navegação passa a conter:

1. `Visão geral`;
2. `Demandas`;
3. `Minhas demandas`;
4. `Administração`, quando autorizada.

A aba `Minhas demandas` terá ícone de pasta/usuário e estado ativo próprio. Ela permanecerá visível em todas as áreas autenticadas, permitindo reentrada direta na carteira pessoal sem retorno ao dashboard.

## 4. Alternador dentro da listagem

As duas telas de carteira compartilharão a mesma listagem, filtros e tabela, mas exibirão no topo um alternador de contexto claro e simétrico:

- na carteira geral: título `Todas as demandas`, texto `Consulte a carteira completa da equipe.` e ação destacada `Ver minhas demandas`;
- na carteira pessoal: título `Minhas demandas`, texto `Acompanhe sua carteira de processos.` e ação destacada `Ver todas as demandas`.

O alternador terá aparência de cabeçalho de área, não de filtro. A ação muda de rota e preserva filtros úteis de refinamento, mas elimina qualquer parâmetro legado de escopo.

## 5. Comportamento dos filtros

- `Limpar filtros` limpa somente busca, status, tipo, classificação, setor, período e filtros rápidos;
- limpar filtros nunca troca de carteira;
- a carteira geral sempre usa `scope=equipe` internamente;
- a carteira pessoal sempre usa `scope=meu` internamente;
- a filtragem pessoal continua baseada exclusivamente no UUID do usuário autenticado;
- demandas sem `responsavel_id`, incluindo `Vanessa Migrado`, não aparecem em nenhuma carteira pessoal;
- a exportação Excel respeita a carteira atual e os filtros aplicados.

## 6. Acesso destacado no cabeçalho

O bloco grande criado anteriormente será substituído por um quinto cartão compacto dentro da mesma grade dos indicadores.

Características:

- título `Minhas demandas`;
- texto `Acompanhe sua carteira de processos.`;
- ícone de pasta e seta de acesso;
- fundo azul institucional suave, borda e sombra diferenciadas dos indicadores numéricos;
- sem contagem, para não duplicar indicadores nem gerar ambiguidade sobre ativos/encerrados;
- clique em qualquer área do cartão abre `/minhas-demandas`;
- permanece visível em todas as áreas autenticadas, permitindo acesso direto também a partir da carteira geral;
- apresenta estado ativo quando a rota pessoal estiver aberta;
- a grade responsiva poderá mantê-lo na primeira linha ou quebrá-lo para a linha seguinte, inclusive abaixo da região de `Vencem hoje`, conforme a largura disponível;
- em telas menores, ocupa a largura disponível seguindo a ordem natural dos indicadores.

O cartão é um atalho permanente e visualmente destacado; a aba é o mecanismo estrutural principal de navegação.

## 7. Remoções

- remover o callout grande de `Minhas demandas` da `VisaoGeral`;
- remover a faixa `personal-scope-banner` do `FilterPanel`;
- remover `scope` da contagem de filtros ativos;
- remover a dependência de `Limpar filtros` para sair da carteira pessoal.

## 8. Arquitetura de componentes

### `Header`

Receberá:

- `personalWorkspaceActive: boolean`;
- `onOpenMinhasDemandas: () => void`.

Renderizará o cartão compacto na grade de indicadores e comunicará seu estado ativo.

### `CarteiraContextHeader`

Novo componente apresentacional responsável por:

- comunicar a carteira atual;
- oferecer a ação inversa;
- não conhecer filtros ou dados;
- receber `mode: 'geral' | 'pessoal'` e `onSwitch`.

### `App`

Será a autoridade de rotas e escopo:

- reconhecerá `minhas-demandas` como aba própria;
- derivará o escopo efetivo da rota;
- aplicará esse escopo ao motor de filtros sem depender de estado visual de filtro;
- redirecionará URLs legadas;
- preservará filtros ao alternar entre carteiras.

## 9. Acessibilidade

- abas com `aria-current="page"`;
- alternador com título semântico e botão acessível por teclado;
- foco visível;
- textos explícitos, sem depender apenas de cor ou ícone;
- cartão do cabeçalho implementado como botão semântico;
- ordem de tabulação correspondente à ordem visual.

## 10. Responsividade

- quatro abas podem quebrar ou rolar horizontalmente sem reduzir excessivamente as áreas de toque;
- cartão pessoal participa da grade responsiva e ocupa largura total quando necessário;
- alternador interno empilha texto e ação em telas estreitas;
- a tabela e os filtros mantêm o comportamento responsivo atual.

## 11. Testes obrigatórios

- rota `/minhas-demandas` mostra somente registros do UUID autenticado;
- rota `/demandas` mostra a carteira geral;
- aba ativa corresponde à rota;
- alternância geral ↔ pessoal preserva filtros e troca o conjunto de dados;
- `Limpar filtros` não troca de rota nem de carteira;
- URL legada `?escopo=meu` redireciona corretamente;
- cartão do cabeçalho abre a carteira pessoal e indica o estado ativo;
- demandas sem UUID não aparecem na carteira pessoal;
- exportação usa o conjunto da carteira atual;
- smoke tests desktop e mobile validam navegação, foco e responsividade.

## 12. Fora de escopo

- alterações no Supabase, schema, migrations ou dados;
- mudança de permissões;
- novos indicadores pessoais;
- contagem pessoal no cartão;
- alterações nos conceitos de prazo, status ou classificação;
- criação de dashboard pessoal independente.
