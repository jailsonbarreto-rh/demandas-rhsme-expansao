# Plano Consolidado de Manutenção e Modernização — CTRH v1.0

**Data:** 1º de agosto de 2026  
**Status:** vigente para organização; cada rodada posterior depende de autorização expressa  
**Linha de base:** `main` em `361d41f63d9667b652dada72d5833559f7405b3b`

## 1. Finalidade

Organizar atualizações técnicas e melhorias perceptíveis do produto em uma sequência única, classificada por risco, complexidade, dependências arquiteturais, reversibilidade e esforço de validação.

Este plano não autoriza automaticamente nenhuma atualização posterior. Cada rodada ou PR continua sujeito a escopo registrado, branch própria, validação integral e autorização expressa.

O plano serve para registrar decisões, organizar a execução e preservar oportunidades futuras. Ele não substitui a autoridade do responsável pelo produto, não cria impedimento autônomo para mudança de direção e deve ser atualizado quando novas decisões forem tomadas.

## 2. Princípios

1. Manutenção técnica e modernização funcional não competem entre si.
2. Mudanças seguras e facilmente reversíveis devem ocorrer primeiro.
3. Mudanças com causas de falha distintas permanecem em PRs separados, ainda que pertençam à mesma rodada.
4. Pacotes que alterem o fluxo central de dados, build, runtime, banco ou experiência global devem ser isolados.
5. Dependências arquiteturais reais podem alterar a ordem para evitar retrabalho.
6. Nenhuma atualização será forçada por `--force`, `--legacy-peer-deps` ou mecanismo equivalente.
7. O encerramento de uma oportunidade não significa rejeição definitiva quando houver condição futura explícita para reavaliação.
8. O responsável pelo produto pode rever prioridades, incluir, retirar, adiar ou reorganizar rodadas; a documentação deve registrar a decisão nova, e não funcionar como obstáculo a ela.

## 3. Critérios de classificação

- risco de incompatibilidade;
- superfície afetada;
- reversibilidade;
- esforço de configuração;
- esforço de validação;
- dependência arquitetural;
- impacto perceptível ao usuário;
- capacidade de isolamento e rollback.

## 4. Rodadas

### Rodada 0 — Governança, limpeza e linha de base

Escopo autorizado:

- encerrar PRs antigos do Dependabot sem merge;
- desativar exclusivamente a abertura automática de PRs de atualização de versão configurada por `.github/dependabot.yml`;
- não alterar alertas, notificações ou configurações de segurança;
- preservar auditorias e gates existentes;
- registrar política de manutenção de dependências;
- registrar oportunidades adiadas e alternativas rejeitadas;
- estabelecer a linha de base documental e técnica;
- não atualizar dependências;
- não modificar funcionalidades, regras, dados, interface ou Supabase.

### Rodada 1 — Mudanças seguras e facilmente reversíveis

Candidatos ainda sujeitos a confirmação:

- Playwright 1.62;
- `@vitejs/plugin-react` 6.0.4;
- `globals` 17.8;
- `@supabase/supabase-js` 2.110.9 em PR isolado;
- `actions/checkout` e `actions/setup-node` atuais;
- Error Boundaries e recuperação localizada de falhas.

### Rodada 2 — Configuração controlada

Candidatos ainda sujeitos a confirmação:

- padronização do Node 24;
- JSDOM 30;
- Supabase Setup CLI 3 com remoção de entrada obsoleta e versão fixada;
- Knip em uso diagnóstico, sem autofix e sem gate inicial.

### Rodada 3 — Modernização estrutural de dados

Candidato ainda sujeito a confirmação:

- TanStack Query em PR isolado, com desenho técnico específico para cache, Realtime, mutações, invalidação, sessão, erros e testes.

### Rodada 4 — Experimentos de maior risco

Candidato ainda sujeito a confirmação:

- TypeScript 6 em branch exclusiva, sem compromisso prévio de integração.

## 5. Validação por PR

Todo PR de atualização deverá, conforme aplicável, executar:

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

Mudanças de CI, Supabase CLI, runtime, cache, Realtime ou interface exigem também testes específicos do pacote.

## 6. Rollback

- cada PR deve possuir escopo independente e reversível;
- não haverá migrations destrutivas nesta agenda sem autorização específica;
- mudanças de dependências devem preservar o lockfile e permitir reversão integral do PR;
- falha em uma unidade não invalida automaticamente as demais unidades independentes da rodada;
- nenhuma mudança será promovida para produção sem verificação do mesmo SHA.

## 7. Estado da autorização

Somente a Rodada 0 está autorizada nesta data. As Rodadas 1 a 4 permanecem como planejamento e serão ajustadas após a seleção final das modernizações funcionais.

A autorização futura não depende de nomenclatura rígida, sequência imutável ou manutenção deste agrupamento exato. O registro documental será atualizado para refletir as decisões efetivamente tomadas pelo responsável pelo produto.