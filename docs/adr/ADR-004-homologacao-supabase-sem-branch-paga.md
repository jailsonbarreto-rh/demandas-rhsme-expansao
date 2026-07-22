# ADR-004 — Homologação do Supabase sem branch paga

- **Status:** Aceita e implementada
- **Data:** 2026-07-22
- **Decisor:** responsável pelo produto
- **Ciclo:** 3 — expansão aditiva do modelo de dados

## Contexto

O Plano Mestre exige que migrations materiais sejam executadas em banco isolado antes da produção. A alternativa inicialmente identificada foi uma branch Supabase de homologação, cotada em US$ 0,01344 por hora.

O responsável pelo produto decidiu que o projeto não pode assumir novos gastos neste momento. Essa decisão não autoriza reduzir os controles de segurança nem usar o banco de produção como ambiente de teste.

A organização Supabase está no plano gratuito. Esse plano não oferece backup automático acessível pelo Dashboard. Por isso, a estratégia precisa separar dois riscos:

1. validar tecnicamente a migration sem usar produção;
2. preservar um estado recuperável dos dados afetados antes da aplicação remota.

## Decisão

Não criar branch Supabase paga.

### Homologação sem custo

A homologação SQL do Ciclo 3 será executada em ambiente Supabase local e efêmero dentro do GitHub Actions, usando Docker no runner descartável e a CLI oficial do Supabase.

O fluxo:

1. inicia uma base Supabase limpa sem a migration do Ciclo 3;
2. aplica as migrations anteriores;
3. insere somente dados sintéticos que representam registros legados;
4. aplica a migration do Ciclo 3 sobre esses registros;
5. valida backfill, constraints, índices, relações e compatibilidade das RPCs v1;
6. recria a base do zero e reaplica a cadeia completa de migrations;
7. destrói o ambiente ao final da execução.

Nenhuma credencial remota, dado real ou recurso pago é usado nesse gate.

### Salvaguarda da produção sem custo adicional

Como o projeto gratuito não possui backup automático acessível, a própria migration cria, antes de alterar o contrato público, snapshots privados de:

- `sme_demandas`;
- `sme_historico`;
- `perfis_usuarios`;
- manifesto com as contagens capturadas.

As cópias ficam no schema `private`, sem privilégios para `anon` ou `authenticated`. Elas preservam somente o estado anterior das tabelas afetadas e deverão ser removidas por migration posterior, depois da estabilidade confirmada.

Essa salvaguarda não substitui um backup externo contra falha total de infraestrutura. Ela é aceita especificamente para reduzir o risco desta migration, que é aditiva e não remove nem sobrescreve colunas existentes.

## Implementação

- workflow: `.github/workflows/supabase-local-migrations.yml`;
- fixture sintética: `supabase/tests/cycle3_legacy_fixture.sql`;
- invariantes: `supabase/tests/cycle3_invariants.sql`;
- seed local vazio: `supabase/seed.sql`;
- CLI Supabase resolvida pela ação oficial na versão estável atual;
- snapshots: tabelas `private.cycle3_backup_*_20260722` criadas no início da migration.

## Resultado da homologação local

O gate efêmero foi aprovado integralmente:

- base anterior criada;
- fixture legada inserida;
- migration aplicada sobre dados existentes;
- snapshots e manifesto validados;
- backfill validado;
- constraints e índices validados;
- RPCs v1 de criação e mudança de status preservadas;
- inexistência de históricos órfãos confirmada;
- cadeia completa de migrations reaplicada do zero;
- ambiente destruído ao final.

## Consequências positivas

- preserva o gate de banco isolado sem criar cobrança adicional do Supabase;
- testa a migration sobre dados legados sintéticos, e não apenas sobre base vazia;
- comprova que as RPCs atuais continuam funcionando após a expansão;
- torna a cadeia de migrations reproduzível para futuras alterações;
- impede que produção seja usada para tentativa e erro;
- cria uma cópia privada do estado anterior das tabelas afetadas.

## Limitações aceitas

- o ambiente efêmero não é uma cópia dos 379 registros reais;
- o teste não substitui as consultas de invariantes após a aplicação em produção;
- o snapshot interno não protege contra perda total do projeto ou do disco;
- o smoke autenticado real continua dependendo de credencial de teste disponível;
- os snapshots privados deverão ser removidos por migration posterior, não manualmente.

## Condições para produção

A migration só poderá ser aplicada ao projeto remoto depois de:

1. registrar a linha de base imediatamente antes da aplicação;
2. confirmar que as tabelas afetadas continuam dentro da capacidade do plano gratuito;
3. usar a migration versionada como único executor;
4. repetir contagens, duplicidades, órfãos, manifesto e distribuições depois da aplicação;
5. manter pronto o rollback operacional para o deployment do Ciclo 2;
6. não promover o frontend se qualquer invariante divergir.

## Alternativas rejeitadas

### Branch Supabase paga

Rejeitada por restrição orçamentária atual.

### Aplicar diretamente em produção para validar

Rejeitada por risco operacional e por violar o Plano Mestre.

### Executar DDL temporário com rollback no banco real

Rejeitada porque ainda utiliza produção como ambiente de teste e não reproduz integralmente o comportamento de migrations, triggers e histórico.

### Aceitar somente testes estáticos de SQL

Rejeitada porque não comprova execução real da migration nem compatibilidade das RPCs legadas.

### Tratar snapshot interno como backup completo

Rejeitada. O snapshot é uma salvaguarda operacional limitada ao risco da migration, não um mecanismo de recuperação contra perda total da infraestrutura.
