# Central de Trabalho CTRH — design de evolução controlada

- **Status:** aprovado para execução pelo Plano Mestre v1.0
- **Data de corte:** 2026-07-21
- **Documento canônico:** `docs/execution/Plano_Mestre_Execucao_CTRH_v1.0.md`
- **Contexto de produto:** `docs/PRODUCT_CONTEXT.md`

## Objetivo

Evoluir a Central de Demandas de um cadastro operacional pesquisável para a central diária de trabalho do CTRH, reunindo carteira, agenda, prontuário e informação gerencial sem romper busca, exportação, acessibilidade, responsividade, RLS, Realtime ou rotas existentes.

O sistema resultante deve orientar o usuário para a próxima providência, representar corretamente esperas externas e sobrestamentos, tornar mutações auditáveis, declarar lacunas dos dados e eliminar a necessidade de reconstruir controles paralelos.

## Gate de produto

### Pessoas e dor

- **Editor:** precisa iniciar o dia pela própria carteira e registrar trabalho sem falsificar mudança de status.
- **Administrador:** precisa distribuir atenção por estoque, risco e qualidade, sem transformar volume em desempenho.
- **Leitor:** precisa localizar e compreender uma demanda sem risco de alteração.

Hoje, status isolado, responsáveis textuais, prazos ambíguos, histórico parcial e relatórios genéricos exigem reconstrução mental ou planilhas auxiliares.

### Resultado esperado

- primeira providência identificável em até dez segundos;
- andamento simples sem troca de status;
- carteira pessoal por UUID;
- alertas completos e preventivos;
- relatórios parametrizados com o mesmo recorte da tela;
- dados incompletos explicitados, nunca inferidos como fato.

### Comportamentos protegidos

Busca multi-termo e aproximada explicada, normalização de número, filtros e rota na URL, buscas recentes, `Ctrl/Command+K`, Excel seguro, três papéis, RLS, RPCs, Realtime, modais acessíveis, drawer navegável e desktop/mobile.

### Evidência além dos testes

Cada ciclo homologa o cenário real descrito no contexto do produto, mede passos e preservação de contexto, compara cartão com destino filtrado e registra evidência visual quando houver mudança de interface.

## Linha de base e reconciliação da main

O plano registrou `ca9c783b` como SHA auditado. A execução iniciou na `main` remota `1b8a61219dddd52edbb62fbe451bcd6ed066388c`.

Entre os dois SHAs houve apenas:

- remoção do import de `brand-overrides.css` e ajuste de formatação em `src/main.tsx`;
- restauração de `git.deploymentEnabled: false` em `vercel.json`.

Essas mudanças não alteram os contratos, arquivos centrais ou premissas dos Ciclos 0 e 1. Não existe conflito material que exija revisão do plano.

O gate técnico inicial foi executado na branch `docs/central-trabalho-gate-0`:

| Verificação | Resultado inicial |
|---|---|
| `npm ci` | aprovado, lockfile preservado |
| auditoria e assinaturas npm | zero vulnerabilidades; assinaturas aprovadas |
| lint | aprovado sem warnings |
| testes com cobertura | 33 arquivos e 158 testes aprovados |
| build e orçamento de bundle | aprovados |
| Playwright | 18 testes desktop/mobile aprovados |

### Linha de base contratual do banco

O Plano Mestre registrou 379 demandas, 385 eventos de histórico, 5 perfis, 23 vencidas aparentes, 354 sem prazo final, 369 sem prazo interno, 376 demandas somente com evento inicial, 262 em `Tramitado` e 16 valores textuais distintos de responsável. A verificação corrente deve ser somente leitura e registrar qualquer divergência sem sobrescrever esses valores silenciosamente.

Em 2026-07-21, uma consulta agregada e somente leitura no projeto `CTRH PROCESSOS` repetiu todas essas medidas. Os nove resultados coincidiram exatamente com a linha de base contratual; nenhuma divergência de dados exige reconciliação.

## Princípios arquiteturais

- React/Vite continua como SPA; `App.tsx` compõe rotas e diálogos.
- Regras de status, prioridade, filtros e métricas são funções puras fora dos componentes.
- Componentes apresentam dados e estados; não definem semântica de negócio.
- Serviços encapsulam Supabase e modo local sintético.
- RPCs transacionais concentram mutações e trilha auditável.
- Nenhum gerenciador global de estado, mecanismo externo de busca ou biblioteca de gráficos é adicionado.
- ExcelJS, Supabase, React Router, TanStack Table, React Hook Form e Zod permanecem.

## Modelo funcional

### Carteira

Os seis status permanecem e são traduzidos em quatro categorias operacionais por `src/domain/workSemantics.ts`. `Tramitado` permanece em acompanhamento e não representa ação CTRH imediata nem encerramento. A decisão completa está em `docs/adr/ADR-001-semantica-status-carteira.md`.

### Agenda

Prazo interno e prazo final distinguem `definido`, `nao_informado` e `nao_se_aplica`. Toda demanda nova ou movimentada e não encerrada exige próxima ação e data. O legado incompleto é saneado de modo assistido, sem inferência. A decisão está em `docs/adr/ADR-002-prazos-proxima-acao.md`.

### Prontuário

Criação, andamento, mudança de status, edição, reatribuição, prazo, exclusão e restauração produzem eventos tipados. Exclusão é lógica e recuperável. Evento e mutação compartilham transação. A decisão está em `docs/adr/ADR-003-historico-e-exclusao-logica.md`.

### Central de informação

Busca e filtros reutilizam funções puras. Alertas consolidam múltiplos sinais por demanda. Painel e sete modelos Excel consomem a mesma semântica, filtros, prioridade e métricas, exibindo cobertura e limitações.

## Modelo de dados e segurança

A evolução segue **expandir e contrair**:

1. adicionar campos, índices, eventos e RPCs sem remover APIs atuais;
2. publicar frontend compatível;
3. homologar e sanear legado;
4. revogar mutações antigas apenas no contrato final.

Campos principais adicionados a `sme_demandas`: `responsavel_id`, próxima ação e data, situação e justificativa de ambos os prazos, link de origem, origem e metadados de exclusão lógica. O histórico recebe tipo, status anterior e alterações em JSON.

Toda tabela exposta mantém RLS. Mutações validam papel dentro da RPC, usam `auth.uid()` como autor, produzem antes/depois no banco e não confiam em identidade enviada pelo cliente. Preferências e visões são isoladas por usuário. Chaves secretas e `service_role` nunca entram no cliente.

Novas tabelas expostas recebem `GRANT`s explícitos além de RLS, conforme o comportamento atual da Data API do Supabase.

## Ordem de entrega

Cada item é uma unidade publicável, com branch, commit, PR e Preview próprios:

| Ciclo | Produto independente |
|---:|---|
| 0 | linha de base, contexto, plano e ADRs |
| 1 | bundle sem dados reais e modo local bloqueado em produção |
| 2 | semântica única e filtros tipados |
| 3 | expansão aditiva do schema |
| 4 | mutações auditáveis e exclusão lógica |
| 5 | responsabilidade por UUID e “Minhas demandas” |
| 6 | prazos, próxima ação e qualidade de dados |
| 7 | andamento separado e prontuário completo |
| 8 | “Meu trabalho” e motor de alertas |
| 9 | Central de Relatórios Excel |
| 10 | painel gerencial com cobertura |
| 11 | preferências e visões por login |
| 12 | recuperação de senha e login simplificado |
| 13 | contrato final, homologação e produção |

O ciclo seguinte começa somente após merge do anterior ou autorização explícita para cadeia dependente.

## Estratégia de testes

- Testes RED ou de caracterização precedem mudanças de comportamento.
- Funções puras recebem relógio e datasets sintéticos determinísticos.
- Migrations têm testes estáticos, invariantes, RLS e papéis.
- Busca e Excel mantêm testes de regressão durante todos os ciclos.
- Playwright cobre desktop 1440 × 900, mobile 390 × 844 e mobile estreito 360 × 800.
- Axe verifica superfícies novas e fluxos críticos.
- Bundle é escaneado contra canários administrativos e limites de tamanho.
- Preview deve corresponder ao SHA do PR antes da homologação.

## Publicação, backup e rollback

- Nenhuma migration material é aplicada sem exportação legível de schema, perfis, demandas e histórico, com hashes fora do repositório e do bundle.
- Migration aditiva permanece durante rollback de frontend; não se apagam colunas em incidente.
- Falhas de RPC antes do contrato permitem retorno temporário às APIs antigas.
- Reversões preservam eventos válidos; não apagam histórico para restaurar estado.
- Deployments antigos são apenas inventariados até o Ciclo 13. Exclusão exige alvos exatos e autorização destrutiva específica.
- Produção só recebe o SHA homologado após CI, Preview, RLS por papel, busca, relatórios, alertas, acessibilidade, bundle, backup e rollback aprovados.

## Limites do design

- Nenhum código funcional é alterado no Ciclo 0.
- Nenhuma mudança de banco ou dado de produção ocorre nos Ciclos 0 e 1.
- O Ciclo 1 remove dados reais do grafo cliente e preserva o bootstrap fora de `src`.
- O plano não autoriza exclusão de deployments, dados ou histórico.
- Decisões substancialmente diferentes para o usuário exigem parada; não são completadas com padrões genéricos de software.

## Homologação de produto por ciclo

Além do gate técnico, o relato confirma:

1. fluxo mais curto ou mais claro;
2. próxima ação compreensível;
3. filtros, rota e escopo preservados;
4. dados confiáveis e limitações declaradas;
5. ausência de incentivo a controle paralelo.

O ciclo só é concluído quando código ou documentação, testes, revisão de escopo, PR, Preview e cenário real estiverem aprovados conforme o Plano Mestre.
