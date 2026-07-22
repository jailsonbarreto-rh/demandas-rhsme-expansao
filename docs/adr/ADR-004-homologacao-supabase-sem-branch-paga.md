# ADR-004 — Homologação do Supabase sem branch paga

- **Status:** Aceita
- **Data:** 2026-07-22
- **Decisor:** responsável pelo produto
- **Ciclo:** 3 — expansão aditiva do modelo de dados

## Contexto

O Plano Mestre exige que migrations materiais sejam executadas em banco isolado antes da produção. A alternativa inicialmente identificada foi uma branch Supabase de homologação, cotada em US$ 0,01344 por hora.

O responsável pelo produto decidiu que o projeto não pode assumir novos gastos neste momento. Essa decisão não autoriza reduzir os controles de segurança nem usar o banco de produção como ambiente de teste.

## Decisão

Não criar branch Supabase paga.

A homologação SQL do Ciclo 3 será executada em um ambiente Supabase local e efêmero dentro do GitHub Actions, usando Docker no runner descartável e a CLI oficial do Supabase.

O fluxo deverá:

1. iniciar uma base Supabase limpa sem a migration do Ciclo 3;
2. aplicar as migrations anteriores;
3. inserir somente dados sintéticos que representem registros legados;
4. aplicar a migration do Ciclo 3 sobre esses registros;
5. validar backfill, constraints, índices, relações e compatibilidade das RPCs v1;
6. recriar a base do zero e reaplicar a cadeia completa de migrations;
7. destruir o ambiente ao final da execução.

Nenhuma credencial remota, dado real ou recurso pago será usado nesse gate.

## Implementação

- workflow: `.github/workflows/supabase-local-migrations.yml`;
- fixture sintética: `supabase/tests/cycle3_legacy_fixture.sql`;
- invariantes: `supabase/tests/cycle3_invariants.sql`;
- seed local vazio: `supabase/seed.sql`;
- CLI Supabase fixada em `2.101.0` no workflow.

## Consequências positivas

- preserva o gate de banco isolado sem criar cobrança adicional do Supabase;
- testa a migration sobre dados legados sintéticos, e não apenas sobre uma base vazia;
- comprova que as RPCs atuais continuam funcionando após a expansão;
- torna a cadeia de migrations reproduzível para futuras alterações;
- impede que produção seja usada para tentativa e erro.

## Limitações aceitas

- o ambiente efêmero não é uma cópia dos 379 registros reais;
- o teste não substitui as consultas de invariantes após a aplicação em produção;
- o teste não confirma a existência de backup restaurável do projeto remoto;
- o smoke autenticado real continua dependendo de credencial de teste disponível.

## Condições para produção

Mesmo após o workflow local ficar verde, a migration só poderá ser aplicada ao projeto remoto depois de:

1. confirmar backup restaurável ou procedimento equivalente de recuperação;
2. registrar a linha de base imediatamente antes da aplicação;
3. usar a migration versionada como único executor;
4. repetir contagens, duplicidades, órfãos e distribuições depois da aplicação;
5. manter pronto o rollback operacional para o deployment do Ciclo 2.

## Alternativas rejeitadas

### Branch Supabase paga

Rejeitada por restrição orçamentária atual.

### Aplicar diretamente em produção para validar

Rejeitada por risco operacional e por violar o Plano Mestre.

### Executar DDL temporário com rollback no banco real

Rejeitada porque ainda utiliza produção como ambiente de teste e não reproduz integralmente o comportamento de migrations, triggers e histórico.

### Aceitar somente testes estáticos de SQL

Rejeitada porque não comprova execução real da migration nem compatibilidade das RPCs legadas.
