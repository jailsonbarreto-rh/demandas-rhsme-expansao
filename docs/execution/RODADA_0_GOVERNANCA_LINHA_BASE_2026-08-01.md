# Rodada 0 — Governança, limpeza e linha de base

**Data:** 1º de agosto de 2026  
**Branch:** `chore/rodada-0-governanca-dependencias`  
**Base:** `main` em `361d41f63d9667b652dada72d5833559f7405b3b`

## 1. Autorização

A Rodada 0 foi expressamente autorizada para organizar a manutenção técnica e a modernização do produto antes da seleção final das rodadas seguintes.

## 2. Escopo executado

- criação do plano consolidado de manutenção e modernização;
- criação da política de manutenção de dependências;
- criação do registro de oportunidades adiadas e alternativas rejeitadas;
- desativação da abertura automática de PRs de versão pelo Dependabot;
- inventário e encerramento dos PRs automatizados antigos, sem merge;
- preservação dos alertas de vulnerabilidade, auditorias e gates existentes;
- confirmação de que nenhuma dependência ou funcionalidade foi alterada.

## 3. PRs automatizados a encerrar

| PR | Conteúdo | Tratamento |
|---:|---|---|
| #64 | `@types/node` 25 | encerrar; runtime atual permanece Node 24 |
| #65 | ESLint 10 | encerrar; incompatibilidade atual de peer dependency |
| #66 | JSDOM 30 | encerrar; será reavaliado junto com a padronização do Node |
| #67 | `actions/checkout` 7 | encerrar; será recriado sobre a `main` atual |
| #68 | Supabase Setup CLI 3 | encerrar; atualização exige remoção de entrada obsoleta e configuração própria |
| #80 | Supabase JS 2.110.9 | encerrar; será recriado em PR controlado e isolado |
| #81 | Playwright, plugin React e `globals` | encerrar; será recriado sobre a `main` atual |

O encerramento não promove nenhum código e não representa rejeição definitiva das atualizações tecnicamente recomendadas.

## 4. Linha de base preservada

Esta rodada não altera:

- `package.json`;
- `package-lock.json`;
- código de aplicação;
- testes;
- workflows de CI;
- Supabase;
- migrations;
- dados;
- regras de negócio;
- interface;
- Vercel ou deployments.

## 5. Documentos criados

- `docs/execution/PLANO_CONSOLIDADO_MANUTENCAO_MODERNIZACAO_CTRH_v1.0.md`;
- `docs/product/POLITICA_MANUTENCAO_DEPENDENCIAS_CTRH_v1.0.md`;
- `docs/product/REGISTRO_OPORTUNIDADES_TECNICAS_MODERNIZACAO_CTRH_v1.0.md`;
- este relatório de execução.

## 6. Estado das rodadas seguintes

Nenhuma Rodada 1 a 4 está autorizada automaticamente. A composição final será decidida pelo responsável pelo produto antes de qualquer atualização de pacote ou melhoria funcional.

## 7. Rollback

O rollback consiste em restaurar `.github/dependabot.yml` e reverter os documentos desta branch. Não há rollback de aplicação, banco ou dados porque nenhum deles foi alterado.