# Plano Consolidado de Manutenção e Modernização — CTRH v1.1

**Data:** 3 de agosto de 2026  
**Status:** VIGENTE como plano técnico complementar; não autoriza automaticamente nenhuma implementação  
**Linha de base documental:** `main` em `15aa5c049c3c7122db365eec6a2e9f629e3c38ea`

## 1. Finalidade

Organizar a manutenção técnica, a atualização de dependências e a adoção de capacidades modernas sem separar artificialmente esse trabalho das necessidades reais do produto.

Este plano complementa, sem substituir:

- o `Plano_Integrado_Reformulado_CTRH_v3.1.md`;
- o `Plano_Executivo_Operacao_Atual_CTRH_v1.2.md`;
- o Registro de Decisões;
- o Adendo de Governança;
- o Product Context;
- o Handoff vigente.

A presença de uma possibilidade neste documento não constitui autorização. Cada atualização, instalação, refatoração estrutural ou mudança funcional continua sujeita a análise, escopo explícito, branch própria, validação integral e autorização do responsável pelo produto.

## 2. Princípios

1. Manutenção técnica e evolução funcional devem servir ao produto e às pessoas que o utilizam.
2. Não se instala ou atualiza um pacote apenas porque existe versão mais recente.
3. Não se mantém uma solução limitada apenas para evitar avaliar uma tecnologia mais adequada.
4. Sempre que uma tarefa, erro, limitação, melhoria visual ou nova capacidade puder alcançar resultado materialmente melhor por meio de atualização, instalação ou ampliação tecnológica, essa alternativa deve ser apresentada ao responsável pelo produto.
5. A proposta tecnológica deve ser feita antes da implementação e explicar benefício, impacto, riscos, compatibilidade, segurança, esforço de testes e rollback.
6. Nenhum agente pode instalar silenciosamente uma dependência, alterar runtime ou introduzir nova arquitetura sem autorização expressa.
7. Mudanças com causas de falha, superfícies ou rollbacks distintos permanecem em PRs separados.
8. Nenhuma incompatibilidade será mascarada com `--force`, `--legacy-peer-deps`, relaxamento artificial de tipos ou supressão permanente de erro.
9. A solução deve preservar regras de negócio, segurança, RLS, dados, histórico, acessibilidade, responsividade e rastreabilidade, salvo decisão expressa em sentido diferente.
10. O ganho esperado deve ser proporcional ao custo de adoção e manutenção.

## 3. Critérios para propor modernização durante qualquer tarefa

Ao receber uma solicitação de correção, melhoria ou nova funcionalidade, o executor deve avaliar se a tecnologia atual:

- impede a solução definitiva;
- exige contornos frágeis ou duplicação excessiva;
- limita acessibilidade, responsividade, desempenho ou confiabilidade;
- dificulta testes, observabilidade, manutenção ou segurança;
- torna a implementação desproporcionalmente complexa;
- não oferece capacidade já madura e estável no ecossistema do projeto;
- produz experiência inferior à que poderia ser alcançada com atualização ou pacote especializado.

Quando uma dessas condições for material, a proposta deve conter:

1. problema concreto observado;
2. limite da abordagem atual;
3. pacote, atualização ou capacidade sugerida;
4. benefício funcional e técnico esperado;
5. alternativa sem nova dependência;
6. impacto no bundle e no runtime;
7. compatibilidade com React, TypeScript, Vite, Vitest, Playwright, Supabase e Node, conforme aplicável;
8. riscos de segurança, privacidade e dados;
9. estratégia de testes e homologação;
10. rollback;
11. recomendação técnica claramente identificada como recomendação;
12. necessidade de autorização expressa antes da implementação.

A proposta não deve interromper tarefas independentes que possam prosseguir com segurança. Somente o item materialmente afetado pelo limite tecnológico deve aguardar decisão.

## 4. Estado real das rodadas

### Rodada 0 — Governança e linha de base

O PR #115 foi criado sobre uma base anterior e permaneceu aberto enquanto as Rodadas 1, 2 e 3 foram executadas em PRs independentes. Seu conteúdo tornou-se temporalmente desatualizado antes do merge.

Este plano v1.1 substitui o plano proposto naquele PR. O PR #115 deve ser encerrado sem merge após a criação do PR substituto, preservando seu histórico como registro da preparação inicial.

### Rodada 1 — Mudanças seguras e reversíveis — CONCLUÍDA

| Unidade | Resultado | PR |
|---|---|---:|
| Ferramentas de desenvolvimento | Playwright 1.62.0, plugin React 6.0.4 e `globals` 17.8.0 | #117 |
| Supabase JavaScript | `@supabase/supabase-js` 2.110.9 | #118 |
| Recuperação localizada de erros | Error Boundaries globais e regionais | #119 |
| Estabilização de testes | fuso operacional e interação robusta com menu | #120 |
| Publicação | Production e restauração do bloqueio da Vercel | #121 e #122 |

### Rodada 2 — Configuração controlada — CONCLUÍDA

| Unidade | Resultado | PR |
|---|---|---:|
| Node | Node 24 definido pelo `package.json` como fonte única para CI | #125 |
| JSDOM | JSDOM 30.0.0 usado pelo Vitest | #124 |
| Supabase CLI | Action 2.1.1 e CLI 2.111.0 fixadas e verificadas | #126 |
| Knip | Knip 6.29.0 disponível em modo diagnóstico, sem autofix e fora do gate obrigatório | #123 |
| Publicação | Production e restauração do bloqueio da Vercel | #127 e #128 |

### Correção responsiva intermediária — CONCLUÍDA

A tabela de demandas foi adaptada à largura disponível, com uso de área ampla, rolagem superior sincronizada e coluna de ações fixa quando necessária. A correção foi integrada pelo PR #129, publicada pelo PR #130 e encerrada operacionalmente pelo PR #131.

### Rodada 3 — TanStack Query — CONCLUÍDA

A integração de `@tanstack/react-query` 5.101.4 foi concluída pelo PR #132 e publicada pelos PRs #133 e #134.

Resultado consolidado:

- `QueryClient` único na raiz da aplicação;
- cache separado por usuário;
- consultas simultâneas deduplicadas;
- mutations confirmadas pelo repositório;
- invalidação seletiva;
- eventos Realtime agrupados;
- limpeza de cache na troca de sessão;
- recuperação explícita após falha de conectividade;
- ausência deliberada de optimistic updates e retries automáticos;
- 365 testes unitários e de integração aprovados;
- build, bundle, auditoria e testes de navegador aprovados;
- Production em estado `READY`.

A arquitetura está detalhada em `docs/architecture/ARQUITETURA_TANSTACK_QUERY_CTRH_v1.0.md`.

## 5. Rodada 3.1 — Consolidação pós-TanStack Query

### Escopo documental

- substituir o plano temporalmente superado do PR #115;
- registrar a conclusão real das Rodadas 1, 2 e 3;
- instituir a política de manutenção e modernização proativa;
- atualizar o registro de oportunidades;
- documentar a arquitetura atual do TanStack Query;
- sincronizar `AGENTS.md`, Handoff e índice documental.

### Escopo técnico pequeno e reversível

- extrair o nome do evento `demandas:retry` para constante compartilhada;
- executar `npm run analyze:unused`;
- revisar manualmente os achados do Knip;
- não excluir arquivos, exports ou dependências automaticamente;
- registrar falsos positivos, itens preservados e eventuais oportunidades reais em relatório próprio.

### Fora do escopo

- novos pacotes;
- mudanças de banco, migrations, RLS ou dados;
- mudanças de regra de negócio;
- optimistic updates;
- alteração do comportamento de cache;
- mudança visual;
- publicação funcional automática.

## 6. Próxima atualização estrutural candidata

### Rodada 4 — TypeScript 6 experimental

O TypeScript 6 permanece como próximo experimento estrutural candidato, em branch exclusiva e sem compromisso antecipado de integração.

Condições mínimas:

- versão exata;
- lockfile regenerado pelo npm;
- nenhuma combinação com refatoração funcional;
- preservação das opções estritas;
- nenhuma supressão permanente criada apenas para obter build verde;
- lint, testes, cobertura, build, bundle, Playwright e demais gates aprovados;
- documentação e rollback registrados;
- autorização expressa antes da execução.

## 7. Oportunidades funcionais condicionadas

Permanecem sujeitas a necessidade comprovada e desenho específico:

- observabilidade de erros com minimização de dados;
- métricas reais de desempenho;
- Radar interativo com drill-down;
- agenda de prazos e providências;
- PWA com política segura de cache;
- prontuário institucional em PDF;
- virtualização da tabela;
- paginação e busca remotas;
- central de comandos.

Nenhuma dessas possibilidades deve ser instalada ou implementada apenas por disponibilidade tecnológica. Da mesma forma, nenhuma deve ser descartada quando resolver de maneira substancial uma necessidade real do produto.

## 8. Validação por PR

Conforme aplicável:

```bash
npm ci
npm run check:docs
npm audit --audit-level=high
npm audit signatures
npm run lint
npm run test:coverage
npm run build
npm run check:bundle
npm run check:public-bundle
npm run test:e2e
```

Mudanças de dependência, CI, runtime, cache, Realtime, Supabase ou interface exigem testes específicos adicionais.

## 9. Rollback

- cada PR deve ser independente e reversível;
- dependências e lockfile devem ser revertidos juntos;
- nenhuma migration destrutiva integra esta agenda sem autorização específica;
- falha em uma unidade não invalida automaticamente unidades independentes;
- nenhuma atualização será promovida para produção sem confirmação do mesmo SHA;
- documentação temporalmente superada será preservada como histórico, não usada como orientação atual.

## 10. Autoridade

Este documento organiza manutenção e modernização. Não substitui decisões de produto, não autoriza novas funcionalidades por inferência e não cria uma sequência imutável.

O responsável pelo produto pode incluir, retirar, alterar ou reorganizar unidades. A documentação deve refletir a decisão mais recente e nunca funcionar como obstáculo artificial à adoção de uma solução tecnicamente superior e devidamente autorizada.
