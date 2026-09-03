# Registro de Oportunidades Técnicas e de Modernização — CTRH v1.1

**Data:** 3 de setembro de 2026  
**Status:** VIGENTE como inventário técnico; não autoriza implementação  
**Finalidade:** registrar capacidades concluídas, oportunidades futuras, limites conhecidos e alternativas rejeitadas sem transformar o inventário em fila automática.

## 1. Capacidades concluídas

| Capacidade | Estado material | Evidência principal |
|---|---|---|
| Error Boundaries | concluída e publicada | PR #119; release #121–#122 |
| Playwright 1.62.1 | atualização de patch concluída na preparação pré-TypeScript 6 | PR #137 |
| Plugin React para Vite 6.0.5 | atualização de patch concluída | PR #137 |
| `globals` 17.12.0 | atualização concluída na janela pré-migração | PR #176 |
| Supabase JavaScript 2.110.9 | concluída e publicada | PR #118 |
| GitHub Actions básicas v7 | concluída | PR #116 |
| Node 24 como fonte única | concluída e publicada | PR #125; release #127–#128 |
| JSDOM 30.0.1 | atualização de patch concluída e usada pelo Vitest | PR #137 |
| Supabase Action e CLI fixadas | Action 2.1.1 e CLI 2.111.0 concluídas | PR #126 |
| Knip 6.34.0 | atualizado e disponível em modo diagnóstico | PR #176 |
| TanStack Query 5.102.8 | atualizado na `main`; Production permanece na release anterior | PR #176 |
| Tabela responsiva em largura ampla | concluída e publicada | PR #129; release #130–#131 |
| Constante compartilhada de retry | concluída | PR #136 |
| Redução de dez exports internos | concluída sem apagar símbolos | PR #137 |
| Auditoria pré-TypeScript 6 do `tsconfig` | concluída; nenhuma alteração necessária | PR #137 |
| TypeScript 6.0.3 | atualização concluída, compatível e sem ajuste de código ou `tsconfig` | PR #138 |
| Supabase JavaScript 2.114.0 | atualização concluída e validada na `main`; ainda não publicada | PR #176 |
| React Hook Form 7.87.0 | atualização concluída e validada na `main`; ainda não publicada | PR #176 |
| Motion 13.2.0 | atualização concluída e validada na `main`; ainda não publicada | PR #176 |
| Vite 8.2.0 | atualização de build concluída | PR #143 |
| jest-dom 7.0.0 | atualização de testes concluída | PR #143 |

| Zod 4.5.4 | atualização concluída e validada na `main`; ainda não publicada | PR #176 |
| `@types/node` 26.4.1 | atualização experimental aprovada por gate integral, mantendo runtime Node 24 | PR #176 |
| `typescript-eslint` 8.69.0 | atualização concluída; também comprovou o bloqueio atual ao TypeScript 7 | PR #176 |
| TanStack Query tooling 5.102.8 | plugin oficial e Devtools atualizados, preservando exclusão do bundle público | PR #176 |

| TanStack Table 9.2.4 | migração estrutural concluída na `main`, com feature set v9 explícita e gate integral aprovado; ainda não publicada | PR #178 |

Itens concluídos não devem permanecer descritos como candidatos futuros.

## 2. Consolidações concluídas

### Rodada 3.1 — pós-TanStack Query

- documentação de manutenção atualizada;
- arquitetura de cache e mutações registrada;
- política de modernização proativa instituída;
- constante do evento de nova tentativa compartilhada;
- Knip executado e achados classificados manualmente;
- nenhuma exclusão automática realizada.

### Rodada 3.2 — preparação anterior ao TypeScript 6

- `npm outdated` executado no GitHub Actions;
- oito atualizações de desenvolvimento e tipos selecionadas;
- lockfile regenerado pelo npm, sem edição manual;
- dez exports internos tiveram apenas a visibilidade reduzida;
- sete símbolos sensíveis sem uso atual permaneceram preservados;
- o tipo `Json` permaneceu como contrato intencional do banco;
- `tsconfig.json` auditado contra a transição do TypeScript 6;
- nenhuma alteração preventiva ou relaxamento de regra foi necessário.

As Rodadas 3.1 e 3.2 não alteram banco, RLS, dados, migrations ou regras de negócio.

### Janela experimental de 3 de setembro

- PR #176 atualizou todas as dependências diretas viáveis para as versões `latest` então publicadas;
- `browserslist` vulnerável foi corrigido transitivamente no lockfile;
- TanStack Table 9 foi inicialmente reclassificado como migração estrutural após 14 falhas e, em seguida, migrado com sucesso pelo PR #178;
- TypeScript 7 e ESLint 10 foram efetivamente testados e permanecem bloqueados por peers upstream;
- nenhum bypass de compatibilidade foi utilizado;
- o lote final passou o gate integral;
- a atualização está na `main`, mas ainda não em Production.

## 3. Próximas oportunidades estruturais

| Oportunidade | Benefício esperado | Condição de retomada | Situação |
|---|---|---|---|
| Observabilidade de erros | detectar falhas reais de Production com contexto técnico sanitizado | definir ferramenta, dados proibidos, retenção, amostragem, ambientes e source maps privados | próximo estudo técnico recomendado |
| TypeScript 7 | avaliar o compilador nativo e a nova arquitetura da ferramenta | aguardar `typescript-eslint` publicar peer compatível; tentativa com 7.0.2 falhou por ERESOLVE | bloqueado por upstream |

Nenhuma oportunidade possui compromisso antecipado de implementação ou merge. Cada estudo deve permanecer separado de refatoração funcional, alteração de regras ou outra atualização major.

## 4. Atualizações identificadas e adiadas

| Possibilidade | Versão identificada | Razão do adiamento |
|---|---:|---|
| ESLint 10.9.1 | linha major | instalação limpa bloqueada pelo peer de `eslint-plugin-jsx-a11y@6.10.2`; ESLint 9.39.5 preservado |
| TypeScript 7.0.2 | linha major nativa | instalação bloqueada pelo peer de `typescript-eslint@8.69.0`; TypeScript 6.0.3 preservado |

A existência dessas versões não autoriza atualização. Cada retomada deve cumprir a política de manutenção e demonstrar benefício concreto.

## 5. Oportunidades funcionais condicionadas

| Possibilidade | Benefício potencial | Condição de retomada |
|---|---|---|
| Observabilidade de erros | detectar falhas reais de produção e regressões não cobertas | definir ferramenta, minimização de dados, retenção, ambientes e sanitização |
| Métricas reais de desempenho | orientar otimizações por evidência | definir métricas, privacidade e orçamento de desempenho |
| Radar interativo com drill-down | permitir análise e acesso operacional a partir dos indicadores | definir indicadores clicáveis e comportamento de filtro |
| Agenda de prazos e providências | organizar trabalho por dia ou semana | confirmar aderência à rotina da equipe |
| PWA instalável | acesso por ícone e janela própria | definir atualização e cache sem persistir conteúdo operacional sensível |
| Prontuário em PDF | produzir documento institucional para impressão ou compartilhamento | definir necessidade, conteúdo, autoria e segurança |
| Virtualização da tabela | manter fluidez com volume elevado | crescimento de base ou métrica de lentidão comprovada |
| Paginação e busca remotas | reduzir carga no cliente e suportar acervo ampliado | volume, latência ou memória justificarem mudança arquitetural |
| Central de comandos | acesso rápido a rotas e ações | quantidade real de ações globais justificar o recurso |

## 6. Regra de modernização proativa

O inventário não é a única fonte de propostas.

Durante qualquer tarefa, o executor deve avaliar se uma atualização, instalação ou capacidade não listada pode produzir solução materialmente superior. Quando houver benefício concreto, deve apresentar a proposta antes de implementar, conforme `POLITICA_MANUTENCAO_DEPENDENCIAS_CTRH_v1.1.md`.

Uma nova proposta deve ser adicionada a este registro quando:

- possuir relevância além da tarefa imediata;
- criar capacidade reutilizável;
- representar mudança estrutural;
- permanecer adiada após avaliação;
- alterar fundamento de alternativa anteriormente rejeitada.

## 7. Alternativas não recomendadas no estado atual

| Alternativa | Decisão atual | Motivo |
|---|---|---|
| Redux ou Zustand | não recomendado | não há necessidade demonstrada de estado global adicional |
| Reescrita em Tailwind ou shadcn | não recomendada | alto custo e risco sem benefício funcional comprovado |
| Fuse.js | não recomendado | busca existente já atende aos comportamentos atuais |
| Kanban com mudança direta por arraste | não recomendado | pode contornar justificativas, auditoria e regras de transição |
| Nova biblioteca de formulários | não recomendada | React Hook Form e Zod atendem ao produto |
| Nova biblioteca de notificações | não recomendada | Sonner atende ao produto |
| Nova biblioteca de modais | não recomendada | Radix atende ao produto |
| TanStack Query Devtools em Production | não recomendado | não agrega valor ao usuário e amplia superfície desnecessária |
| Virtualização sem evidência de lentidão | adiada | complexidade sem problema comprovado |
| PWA sem política de cache | adiada | risco de persistência indevida de dados e atualização descontrolada |
| `--force` ou `--legacy-peer-deps` | proibido | mascara incompatibilidades reais |

Essas decisões podem ser reavaliadas apenas quando nova evidência alterar o fundamento técnico ou funcional.

## 8. Alternativas históricas substituídas

A versão proposta no PR #115 listava como futuras várias capacidades já concluídas nas Rodadas 1, 2, 3, 3.1, 3.2 e 4. Essa classificação foi superada por este registro v1.1.

O PR #115 permanece útil somente como memória da preparação inicial. Não deve ser usado para determinar o estado atual ou a próxima atualização.

## 9. Regra de uso

Este registro:

- preserva oportunidades;
- impede que itens concluídos voltem a ser propostos como ausentes;
- evita repetição de alternativas já avaliadas sem nova evidência;
- apoia decisões futuras;
- não autoriza implementação;
- não substitui o Registro de Decisões de Produto;
- deve ser atualizado quando a realidade técnica mudar.
