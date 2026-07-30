# Relatório de Validação — R4 Prazos e Próxima Providência

**Data:** 30 de julho de 2026  
**Branch funcional:** `feat/r4-prazos-providencias`  
**PR:** #103  
**Estado:** candidato funcional validado em aplicação e navegador; replay SQL remoto isolado ainda pendente

## 1. Proteções preservadas

- nenhuma migration foi aplicada ao Supabase remoto;
- nenhum deployment foi promovido para Production;
- nenhum merge foi realizado;
- a branch funcional mantém o bloqueio normal de deploy;
- as validações Vercel ocorreram em branches temporárias sem promoção.

## 2. Gate completo da aplicação

O candidato foi executado em Preview temporário com `npm run check`.

Resultados aprovados:

- instalação determinística por `npm ci`;
- patches transitivos aplicados;
- auditoria npm sem vulnerabilidades;
- verificação de assinaturas e proveniência;
- compatibilidade transitiva: 3 de 3 verificações;
- gate documental: 9 de 9 verificações;
- lint sem erro;
- 67 arquivos de teste aprovados;
- 309 testes unitários e de integração aprovados;
- cobertura global de 81,23% das instruções, 72,11% dos ramos, 85,58% das funções e 81,66% das linhas;
- TypeScript aprovado;
- build Vite aprovado;
- inspeção do bundle público aprovada.

## 3. Desempenho

A introdução do `AppBootstrap` retirou a aplicação completa do carregamento inicial e preservou uma tela de espera acessível.

Resultado do gate:

- bundle inicial: 194.068 bytes;
- linha de base: 487.290 bytes;
- redução: 60,17%;
- orçamento máximo preservado: 560.330 bytes.

O orçamento não foi elevado artificialmente.

## 4. Navegador e acessibilidade

Os testes Playwright foram executados em Chromium no runner Amazon Linux 2023, com instalação temporária das bibliotecas nativas apenas na branch de validação.

Resultado final:

- 22 de 22 cenários aprovados;
- desktop aprovado;
- mobile de 320 px aprovado;
- login e primeiro acesso sem violações críticas de acessibilidade;
- visão geral, carteira e administração acessíveis;
- diálogo e drawer acessíveis;
- camadas de modal e drawer corretas;
- carteiras pessoal e geral preservadas;
- rotas, busca e histórico preservados;
- Excel baixado com nomenclatura do Radar de Governança;
- sem dependências externas de fontes ou CDN;
- sem erros de console;
- sem estouro horizontal.

Durante o gate foi corrigido o contraste do estado `Não informada`, elevando a cor de texto para atender ao WCAG 2 AA.

## 5. Excel

Os testes automatizados aprovaram:

- geração e reabertura do workbook;
- duas abas preservadas;
- ausência de partes OOXML órfãs;
- autofiltro válido;
- proteção contra formula injection;
- estados e justificativas dos prazos;
- próxima providência e sua situação temporal;
- nomenclatura `radar_governanca_analitico_...xlsx`.

## 6. Banco e migrations

Foram aprovados os testes estáticos das migrations e dos contratos RPC no conjunto unitário.

Permanece obrigatório antes de merge ou aplicação remota:

1. criar uma branch temporária isolada do Supabase;
2. reproduzir a cadeia integral de migrations;
3. executar `supabase/tests/r4_deadlines_follow_up_invariants.sql`;
4. executar os invariantes anteriores de segurança e compatibilidade;
5. excluir a branch temporária após a coleta das evidências.

A criação de branch Supabase possui cobrança por hora e depende de autorização específica do responsável pelo produto.

## 7. GitHub Actions

Os workflows GitHub associados ao PR encerraram antes da primeira etapa e não produziram logs nem artefatos. O workflow da branch era idêntico ao da `main`. Como contingência, os mesmos gates de aplicação foram executados em Preview temporário da Vercel, com resultados documentados acima.

Essa contingência não autoriza ignorar o replay SQL isolado.

## 8. Estado de aceite

O R4 está aprovado nos gates de aplicação, TypeScript, build, desempenho, Excel, acessibilidade e navegador.

O candidato continua em PR draft e não está autorizado para merge, migration remota ou Production enquanto o replay SQL isolado e a sincronização documental final não forem concluídos.
