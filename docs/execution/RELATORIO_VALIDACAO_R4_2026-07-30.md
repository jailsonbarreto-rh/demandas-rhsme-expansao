# Relatório de Validação — R4 Prazos e Próxima Providência

**Data:** 30 de julho de 2026  
**Branch funcional:** `feat/r4-prazos-providencias`  
**PR:** #103  
**Estado:** aplicação, navegador e Supabase homologados; publicação do frontend pendente de integração do PR

## 1. Proteções preservadas

- nenhuma branch paga do Supabase foi criada;
- nenhum dado legado foi corrigido, preenchido ou reclassificado automaticamente;
- todos os cenários sintéticos remotos foram executados em transações com `ROLLBACK`;
- nenhum fixture de teste permaneceu no banco;
- nenhum deployment de validação foi promovido para Production;
- a branch funcional mantém o bloqueio normal de deploy automático.

## 2. Gate completo da aplicação

O candidato foi executado em ambiente temporário da Vercel com `npm run check`.

Resultados aprovados:

- instalação determinística por `npm ci`;
- patches transitivos aplicados;
- auditoria npm sem vulnerabilidades;
- verificação de assinaturas e proveniência;
- compatibilidade transitiva: 3 de 3 verificações;
- gate documental: 9 de 9 verificações antes da reconciliação final;
- lint sem erro;
- 67 arquivos de teste aprovados;
- 309 testes unitários e de integração aprovados;
- cobertura global superior aos gates vigentes;
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

## 6. Supabase remoto

Projeto validado: `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, plano gratuito.

### Estado anterior

A base continha:

- 379 demandas ativas, todas oriundas do legado;
- 764 registros históricos;
- 369 demandas sem prazo interno;
- 354 demandas sem prazo final;
- 379 demandas sem próxima providência.

### Migrations aplicadas

As seis migrations versionadas do R4 foram aplicadas em ordem e registradas remotamente como:

1. `20260730063742_r4_deadlines_and_follow_up_rules`;
2. `20260730063806_r4_deadline_consistency_constraints`;
3. `20260730063832_r4_preserve_legacy_deadline_metadata`;
4. `20260730063856_r4_final_deadline_state_constraints`;
5. `20260730063923_r4_optional_reason_compatibility`;
6. `20260730064021_r4_preserve_exceptional_internal_state`.

As migrations são aditivas e não executam atualização em massa das demandas.

### Estrutura e grants

A verificação confirmou:

- RPCs completas e sobrecargas de compatibilidade instaladas;
- execução concedida somente a `authenticated`;
- ausência de execução por `anon` e `service_role`;
- `private.can_edit()` preservado como guarda de autorização;
- constraints finais de coerência entre estado e data instaladas como `NOT VALID`, preservando o legado e validando novas escritas;
- trigger de limpeza de metadados obsoletos somente quando data ou estado do prazo forem efetivamente alterados.

### Invariantes funcionais remotos

Foram validados, em transações sintéticas integralmente revertidas:

- edição cadastral de demanda legada sem exigência ou invenção de prazo e providência;
- primeira adequação de prazo legado sem justificativa;
- evento histórico específico para a primeira adequação;
- bloqueio de alteração posterior de prazo sem justificativa;
- aceitação da alteração posterior quando justificada;
- bloqueio de movimentação legada sem próxima providência;
- aceitação da movimentação com próxima providência;
- bloqueio de nova demanda sem prazo interno;
- cadastro válido com prazo final `Não se aplica` sem justificativa inicial;
- bloqueio de providência passada sem justificativa;
- armazenamento da justificativa de data passada no histórico;
- limpeza da providência corrente no encerramento;
- compatibilidade dos contratos anteriores sem permitir contorno das regras novas.

### Integridade pós-teste

Depois dos `ROLLBACK`s:

- demandas: 379;
- históricos: 764;
- fixtures R4 persistidas: 0;
- contagens de lacunas legadas: inalteradas.

## 7. Advisors e logs

Os Advisors não apresentaram bloqueio novo introduzido pelo R4.

Os avisos de funções `SECURITY DEFINER` correspondem à arquitetura intencional das RPCs transacionais, com `search_path` fixo, grants restritos e verificação interna por `private.can_edit()`. Os avisos de índices, chaves estrangeiras e tabelas privadas de backup já existiam e permanecem fora do escopo do R4.

Os logs recentes do PostgreSQL registraram as migrations e as transações de homologação sem erro novo do R4.

## 8. GitHub Actions

Os workflows associados ao PR continuam encerrando antes da primeira etapa e sem logs. O bloqueio é externo ao código da branch. Como contingência, os gates de aplicação foram reproduzidos em ambiente temporário da Vercel e os invariantes de banco foram executados diretamente no Supabase com transações reversíveis.

## 9. Estado de aceite

O R4 está aprovado nos gates de aplicação, TypeScript, build, desempenho, Excel, acessibilidade, navegador, migrations, grants, preservação do legado e invariantes funcionais remotos.

A integração do PR e a publicação do frontend devem manter o bloqueio automático de deploy na configuração canônica. Nenhum ciclo posterior está autorizado automaticamente.
