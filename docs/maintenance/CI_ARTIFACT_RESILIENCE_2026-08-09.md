# Resiliência de artifacts do CI — 2026-08-09

## Problema observado

Durante a validação da correção de segurança do PR #149, o workflow padrão executou com sucesso instalação, consistência documental e auditoria de vulnerabilidades, mas falhou ao tentar armazenar o relatório de auditoria porque a cota de GitHub Actions artifacts estava esgotada.

Como o upload era uma etapa normal do job, a falha de armazenamento impediu que assinaturas, lint, cobertura, build e Playwright fossem executados, apesar de o artifact ser apenas diagnóstico.

O mesmo risco existia no gate local do Supabase: o upload de relatórios ocorria antes do replay integral final das migrations e poderia bloquear esse replay por indisponibilidade de armazenamento.

## Regra adotada

Artifacts são evidência auxiliar. Eles não podem substituir nem bloquear os comandos que validam o sistema.

Os workflows passam a:

- executar todos os gates reais com o mesmo rigor existente;
- gerar artifacts somente quando houver falha anterior no job;
- tratar falha de upload como não bloqueante por `continue-on-error: true`;
- reduzir a retenção diagnóstica de 14 para 3 dias;
- manter falhas de audit, assinatura, lint, testes, cobertura, build, bundle, Playwright, migrations ou invariantes como falhas reais do job.

Não foi adicionado `continue-on-error` a nenhum comando de validação.

## Workflows afetados

### `.github/workflows/dependency-health.yml`

Relatórios de audit, lint, cobertura, build e navegador deixam de ser enviados em execuções bem-sucedidas. Em caso de falha, o upload é tentado por três dias de retenção; se a cota ou o serviço de artifacts estiver indisponível, essa indisponibilidade não altera o resultado do gate técnico que a precedeu.

### `.github/workflows/supabase-local-migrations.yml`

O pacote de diagnósticos do banco passa a ser enviado somente em falha e de forma não bloqueante. Em execução normal, o replay completo a partir do zero continua sendo obrigatório e não depende do armazenamento de artifacts.

## Impacto

Nenhuma regra de negócio, dependência npm, banco, migration, RLS, dado, interface ou configuração de Production é modificada.

## Validação esperada

O PR deve demonstrar que, mesmo enquanto a cota de artifacts estiver indisponível:

1. o workflow `Dependency health` alcança e executa audit, assinaturas, lint, cobertura, build, bundle e Playwright;
2. o workflow `Supabase local migration gate` executa todos os invariantes e o replay completo das migrations;
3. nenhum upload é necessário em execução bem-sucedida;
4. uma falha de validação continuaria reprovando o job normalmente.
