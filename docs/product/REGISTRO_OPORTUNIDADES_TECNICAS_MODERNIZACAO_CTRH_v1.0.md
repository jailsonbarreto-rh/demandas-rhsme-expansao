# Registro de Oportunidades Técnicas e de Modernização — CTRH v1.0

**Data:** 1º de agosto de 2026  
**Finalidade:** preservar possibilidades avaliadas sem convertê-las automaticamente em obrigação ou autorização.

## 1. Oportunidades recomendadas no planejamento atual

| Oportunidade | Benefício esperado | Situação |
|---|---|---|
| Error Boundaries | impedir queda total da interface e oferecer recuperação localizada | candidata à Rodada 1 |
| TanStack Query | cache, atualização em segundo plano, mutações e integração mais organizada com Realtime | candidata à Rodada 3, isolada |
| Playwright 1.62 | atualização da ferramenta de testes E2E | candidata à Rodada 1 |
| Plugin React para Vite 6.0.4 | correção e alinhamento do ambiente de desenvolvimento | candidata à Rodada 1 |
| `globals` 17.8 | atualização do catálogo usado pelo lint | candidata à Rodada 1 |
| Supabase JS 2.110.9 | atualização controlada do SDK de produção | candidata à Rodada 1, PR isolado |
| GitHub Actions atuais | modernização do runtime das actions | candidata à Rodada 1 |
| Node 24 padronizado e JSDOM 30 | ambiente previsível e testes compatíveis | candidata à Rodada 2 |
| Supabase Setup CLI 3 | atualização do workflow local de migrations | candidata à Rodada 2, isolada |
| Knip | diagnóstico de arquivos, exports e dependências possivelmente não utilizados | experimento da Rodada 2 |
| TypeScript 6 | avaliação do compilador em versão major mais recente e compatível | experimento isolado da Rodada 4 |

## 2. Melhorias funcionais aguardando seleção

| Possibilidade | Razão para preservar | Condição de retomada |
|---|---|---|
| Radar interativo com ECharts | permitir drill-down, filtros e acesso operacional a partir dos gráficos | seleção expressa e desenho dos indicadores clicáveis |
| Agenda de prazos e providências | visualizar prazo interno, prazo final e próxima providência por dia ou semana | confirmação de aderência à rotina da equipe |
| PWA instalável | acesso por ícone, janela própria e atualização controlada da interface | definir política de cache sem persistir dados operacionais sensíveis |
| Prontuário em PDF | gerar documento institucional para impressão ou compartilhamento | comprovação de necessidade documental e definição do conteúdo |
| Virtualização da tabela | preservar fluidez com grande número de registros | crescimento da base ou métrica de lentidão comprovada |
| Paginação e busca remotas | reduzir carga no cliente e suportar acervo ampliado | volume e desempenho justificarem mudança arquitetural |
| Central de comandos | acesso rápido a ações e rotas | aumento real da quantidade de ações globais |
| Observabilidade de erros | detectar falhas reais de produção | definição de ferramenta e política de minimização de dados |
| Métricas reais de desempenho | orientar otimizações por evidência | definição de métricas e privacidade |

## 3. Alternativas fora do plano atual

| Alternativa | Decisão atual | Motivo |
|---|---|---|
| ESLint 10 | não implementar | incompatibilidade atual com plugin de acessibilidade e falha de resolução de dependências |
| TypeScript 7 | não implementar | incompatível com a faixa suportada pelo ecossistema atual de lint TypeScript |
| `@types/node` 25 | não implementar | runtime adotado é Node 24 |
| Node 26 | não implementar agora | não é a linha LTS adotada pelo projeto |
| Redux ou Zustand | não recomendado | não há necessidade demonstrada de estado global adicional |
| reescrita em Tailwind ou shadcn | não recomendado | alto custo e risco sem benefício funcional comprovado |
| Fuse.js | não recomendado | busca existente já possui correspondência exata, aproximada e contexto |
| Kanban com mudança direta por arraste | não recomendado | pode contornar justificativas, auditoria e regras de transição |
| nova biblioteca de formulários | não recomendado | React Hook Form e Zod já atendem ao produto |
| nova biblioteca de notificações ou modais | não recomendado | Sonner e Radix já atendem ao projeto |
| `--force` ou `--legacy-peer-deps` | proibido | mascara incompatibilidades reais |

## 4. Regra de reavaliação

Itens adiados podem voltar ao debate mediante necessidade comprovada, mudança do ecossistema, crescimento da base ou decisão expressa. Itens rejeitados não devem ser reintroduzidos por outro agente sem apresentar nova evidência que altere o fundamento desta decisão.