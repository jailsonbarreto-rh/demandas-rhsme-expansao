# Política de Manutenção de Dependências — CTRH v1.0

**Data:** 1º de agosto de 2026  
**Status:** vigente após integração da Rodada 0

## 1. Objetivo

Garantir que atualizações de bibliotecas, ferramentas, runtime e GitHub Actions sejam deliberadas, compatíveis, rastreáveis e testadas, sem produção automática de filas de PRs não acompanhadas.

## 2. Modelo adotado

O projeto não utilizará Dependabot para abrir PRs automáticos de atualização de versão.

Permanecem preservados:

- Dependency Graph;
- Dependabot Alerts ou mecanismo equivalente de alerta de vulnerabilidade;
- `npm audit --audit-level=high`;
- `npm audit signatures`;
- workflows e gates de validação existentes.

PRs automáticos de segurança também não serão usados como substitutos da análise técnica. Um alerta de vulnerabilidade inicia uma avaliação controlada, mas não autoriza automaticamente alteração de versão.

## 3. Gatilhos para revisão

Uma revisão de dependências ocorrerá quando houver:

- alerta de vulnerabilidade relevante;
- perda ou proximidade de perda de suporte;
- preparação de release importante;
- início de ciclo funcional que dependa de nova capacidade;
- problema de compatibilidade, desempenho ou qualidade comprovado;
- solicitação expressa do responsável pelo produto;
- revisão periódica deliberadamente iniciada.

## 4. Processo obrigatório

1. inventariar versões atuais e candidatas;
2. verificar changelog e requisitos de runtime;
3. conferir compatibilidade entre pares e plugins;
4. classificar risco e superfície afetada;
5. decidir agrupamento ou isolamento;
6. registrar escopo, dependências e rollback;
7. criar branch própria sobre a `main` atual;
8. atualizar somente o pacote aprovado;
9. executar gate integral e testes específicos;
10. registrar resultado, incompatibilidades e decisões adiadas;
11. integrar somente após revisão e homologação aplicáveis.

## 5. Regras de agrupamento

Podem compartilhar PR:

- atualizações pequenas do mesmo ambiente;
- pacotes sem impacto em runtime de produção;
- mudanças com validação e rollback comuns;
- alterações cuja separação criaria incompatibilidade intermediária.

Devem permanecer isolados:

- SDK de produção;
- runtime Node;
- compilador TypeScript major;
- fluxo central de dados e cache;
- Supabase CLI e migrations;
- alterações que possam quebrar build, autenticação, Realtime, permissões ou publicação;
- modernizações funcionais com comportamento visível relevante.

## 6. Proibições

Não é permitido:

- integrar PR automatizado sem revisão humana;
- usar `--force`, `--legacy-peer-deps` ou equivalente para ocultar incompatibilidade;
- misturar atualização estrutural com refatoração oportunista;
- atualizar tipos de runtime para versão diferente do runtime adotado sem justificativa;
- promover uma atualização apenas porque existe versão mais nova;
- alterar dependências diretamente na `main`;
- deixar documentação e lockfile divergentes.

## 7. Notificações e responsabilidade

Os alertas de vulnerabilidade devem permanecer habilitados e com canal de notificação verificável. A ausência de notificação não elimina a necessidade de revisão deliberada antes de releases relevantes.

O responsável pelo produto decide quais atualizações entram no plano. A análise técnica deve apresentar benefício, risco, compatibilidade, impacto perceptível e custo de reversão.

## 8. Histórico da decisão

A configuração automática anterior abriu múltiplos PRs sem integração, alguns obsoletos ou incompatíveis com a base atual. A Rodada 0 encerra essa fila sem merge e substitui o modelo por manutenção controlada.