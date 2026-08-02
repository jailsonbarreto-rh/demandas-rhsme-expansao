# Política de Manutenção de Dependências — CTRH v1.0

**Data:** 1º de agosto de 2026  
**Status:** vigente após integração da Rodada 0

## 1. Objetivo

Garantir que atualizações de bibliotecas, ferramentas, runtime e GitHub Actions sejam deliberadas, compatíveis, rastreáveis e testadas, sem produção automática de filas de PRs de versão que permaneçam sem análise.

## 2. Modelo adotado

O projeto não utilizará Dependabot para abrir PRs automáticos de atualização de versão.

Esta decisão alcança exclusivamente a abertura automática de PRs de versão configurada por `.github/dependabot.yml`.

A Rodada 0 não altera configurações de segurança, alertas, notificações ou mecanismos de detecção de vulnerabilidades. Permanecem preservados, sem modificação por este plano:

- Dependency Graph;
- Dependabot Alerts ou mecanismo equivalente de alerta de vulnerabilidade;
- notificações relacionadas à segurança;
- eventuais recursos de correção de segurança configurados fora de `.github/dependabot.yml`;
- `npm audit --audit-level=high`;
- `npm audit signatures`;
- workflows e gates de validação existentes.

Qualquer mudança futura em alertas, notificações ou automações específicas de segurança exigirá avaliação e decisão próprias. Esta política não autoriza nem determina essa alteração.

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

Os alertas e notificações existentes não são alterados pela Rodada 0. O problema tratado nesta etapa é a criação automática de PRs de versão que permaneciam sem análise, e não a existência de alertas.

O responsável pelo produto decide quais atualizações entram no plano. A análise técnica deve apresentar benefício, risco, compatibilidade, impacto perceptível e custo de reversão.

## 8. Histórico da decisão

A configuração automática anterior abriu múltiplos PRs de atualização de versão sem integração, alguns obsoletos ou incompatíveis com a base atual. A Rodada 0 encerra essa fila sem merge e substitui esse mecanismo por manutenção controlada, preservando os mecanismos atuais de alerta e segurança.