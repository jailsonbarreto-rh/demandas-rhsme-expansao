# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **2026-07-22 — execução do Plano Mestre v1.0, Ciclo 2**

## Estado da execução

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| `main` remota observada | `d302c8d` (Ciclo 1 e atualizações seguras do PR #38/Actions) |
| SHA auditado no plano | `ca9c783b` |
| Branch do Ciclo 2 | `refactor/centralizar-semantica-filtros-ciclo-2` |
| Produção conhecida | `https://demandas-rhsme-expansao.vercel.app/` |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, ativo e saudável |
| Plano versionado | SHA-256 `C78B6F7FE840BBFC6B32F401D27B609681C1881CB146B25E72E8905F36AA0B87` |

O Ciclo 2 concentra a semântica operacional dos seis status, tipa o estado de filtros e normaliza a URL sem alterar schema ou dados. Busca exata e aproximada, filtros rápidos, período, exportação Excel e links antigos continuam compatíveis. Nenhum registro remoto, migration ou variável de ambiente foi alterado durante a implementação.

## Ciclo 2 — semântica única e filtros tipados

- `src/domain/workSemantics.ts` é a única fonte para classificar acompanhamento, providência CTRH e encerramento;
- `src/filters/filterTypes.ts` define o contrato canônico e os valores padrão;
- `src/filters/filterUrl.ts` migra URLs legadas, ignora valores desconhecidos e serializa somente parâmetros conhecidos;
- `src/filters/applyDemandFilters.ts` reúne os filtros puros antes da busca exata ou aproximada;
- o card antes chamado “Demandas Ativas” agora se chama “Em acompanhamento”;
- indicadores, prazos visuais e Excel usam as mesmas funções de domínio;
- o Excel permanece em import dinâmico e o bundle público continua sem identificadores administrativos;
- os esqueletos de carregamento passaram a expor `role=status`, e a auditoria de acessibilidade agora garante movimento reduzido de forma determinística.

### Semântica canônica

| Status | Categoria operacional |
|---|---|
| `Aguardando Andamento` | `providencia_ctrh` |
| `Ajustar` | `providencia_ctrh` |
| `Para Assinatura` | `providencia_ctrh` |
| `Tramitado` | `aguardando_retorno` |
| `Sobrestado` | `monitoramento` |
| `Encerrado` | `encerrada` |

`Tramitado` e `Sobrestado` permanecem em acompanhamento. Apenas os três primeiros status exigem providência CTRH, e somente `Encerrado` sai do acompanhamento.

### Gate técnico do Ciclo 2

| Comando/evidência | Resultado |
|---|---|
| testes RED de domínio, URL e integração | falhas esperadas observadas antes da implementação |
| testes focados do recorte funcional | PASS, 9 arquivos e 44 testes |
| regressão de semântica dos esqueletos | RED com 4 falhas; PASS após `role=status` |
| `rg -F "status !== 'Encerrado'" src --glob '!**/*.test.*'` | zero ocorrências |
| `npm run check:full` | PASS |
| `npm audit --audit-level=high` | PASS, zero vulnerabilidades |
| `npm audit signatures` | PASS, 539 assinaturas e 147 atestações verificadas |
| `npm run lint` | PASS |
| `npm run test:coverage` | PASS, 39 arquivos e 189 testes |
| `npm run build` | PASS |
| `npm run check:bundle` | PASS, crescimento de 8,58%, abaixo do limite de 15% |
| `npm run check:public-bundle` | PASS, 28 arquivos contra 50 identificadores administrativos |
| `npm run test:e2e` | PASS, 18 testes desktop/mobile |

### Gate de consciência do produto — Ciclo 2

- **Pessoas:** administradores, editores e leitores que acompanham a mesma carteira por indicadores, filtros, links e Excel.
- **Dor atual:** “ativa” era decidida em componentes distintos, enquanto valores de filtro e URL misturavam rótulos de interface com regras de negócio.
- **Ganho:** uma única classificação determina acompanhamento, providência e encerramento; links antigos são migrados para valores canônicos.
- **Proteção:** busca aproximada, buscas recentes, filtros rápidos, período, exportação Excel, navegação, acessibilidade e bundle público foram exercitados pelo gate integral.
- **Prova além dos testes:** a busca estrutural retornou zero comparações operacionais duplicadas e o build público repetiu a varredura dos 50 identificadores administrativos.

### Banco e ambiente

O Ciclo 2 não possui migration. Supabase, dados, grants, variáveis de Vercel e deployments históricos permaneceram intactos.

## Ciclo 1 — retirada de dados reais do bundle público

- o acervo administrativo original foi movido de `src/data/initialDemandas.ts` para `scripts/bootstrap/initial-demandas.json`;
- `src/data/demoDemandas.ts` fornece oito registros fictícios com prefixo `DEMO-` e usuários de demonstração;
- o bootstrap Node lê JSON e valida schema estrito antes de importar;
- `resolveAppConfig` recusa `VITE_APP_MODE=local` quando `PROD=true`;
- `scripts/check-public-bundle.mjs` compara os 50 identificadores administrativos com todos os arquivos de `dist/assets` sem imprimir o conteúdo protegido;
- o gate `check` executa essa varredura depois do build.

### Gate técnico do Ciclo 1

| Comando | Resultado |
|---|---|
| testes RED focados | 5 falhas esperadas antes da implementação |
| testes focados após implementação | PASS, 6 arquivos e 37 testes |
| `npm run check:full` | PASS |
| `npm audit --audit-level=high` | PASS, zero vulnerabilidades |
| `npm audit signatures` | PASS |
| `npm run lint` | PASS |
| `npm run test:coverage` | PASS, 35 arquivos e 164 testes |
| `npm run build` | PASS |
| `npm run check:bundle` | PASS, crescimento de 7,98%, abaixo do limite de 15% |
| `npm run check:public-bundle` | PASS, 29 arquivos contra 50 identificadores administrativos |
| `npm run test:e2e` | PASS, 18 testes desktop/mobile |

### Gate de consciência do produto — Ciclo 1

- **Pessoa:** qualquer visitante não autenticado e os responsáveis pela confidencialidade do acervo administrativo.
- **Dor atual:** o bundle público incorporava 50 demandas administrativas e a produção podia ser forçada ao modo local.
- **Ganho:** produção baixa somente o cliente Supabase; desenvolvimento local continua funcional com oito registros sintéticos.
- **Proteção:** autenticação Supabase, bootstrap privado, busca, exportação Excel, responsividade e contratos de persistência foram preservados.
- **Prova além dos testes:** a varredura do build comparou todos os números administrativos e aprovou com zero ocorrências.

### Inventário de deployments anteriores

Antes da publicação do Ciclo 1, o CLI da Vercel listou 81 deployments históricos: 52 em estado `Ready`, 27 cancelados e 2 com erro. Todos os 52 deployments servíveis antecedem esta correção e foram classificados como vulneráveis pelo grafo cliente da versão correspondente. A verificação direta do alias de Production confirmou os 50 identificadores administrativos nos três assets referenciados pela página.

Nenhum deployment foi apagado. A remoção dos 52 deployments legados permanece adiada para o Ciclo 13 e depende de autorização destrutiva específica, conforme o Plano Mestre.

## Reconciliação da `main`

Entre o SHA auditado e a linha de base do Ciclo 0 houve:

- remoção do import de `brand-overrides.css` e ajuste de formatação em `src/main.tsx`;
- restauração de `git.deploymentEnabled: false` em `vercel.json`.

Depois disso, o PR #37 incorporou o Ciclo 1 na `main`, retirando os dados administrativos do bundle público conforme documentado acima. A branch do Ciclo 2 nasceu limpa desse merge (`048a5de`). Durante a execução, o PR #38 atualizou oito dependências seguras de produção e dois commits atualizaram `actions/upload-artifact` e `actions/setup-node`; a branch foi rebaseada sobre essa nova base (`d302c8d`) sem conflito funcional. Não foi identificado conflito material com o Plano Mestre.

## Linha de base remota

As consultas foram agregadas e somente leitura; nenhum registro operacional foi impresso ou alterado.

| Dimensão | Plano | Verificação atual | Divergência |
|---|---:|---:|---:|
| Demandas | 379 | 379 | 0 |
| Históricos | 385 | 385 | 0 |
| Perfis | 5 | 5 | 0 |
| Vencidas aparentes | 23 | 23 | 0 |
| Sem prazo final | 354 | 354 | 0 |
| Sem prazo interno | 369 | 369 | 0 |
| Somente evento inicial | 376 | 376 | 0 |
| Status `Tramitado` | 262 | 262 | 0 |
| Responsáveis textuais distintos | 16 | 16 | 0 |

## Gate técnico inicial

| Comando | Resultado |
|---|---|
| `npm ci` | PASS |
| `npm audit --audit-level=high` | PASS, zero vulnerabilidades |
| `npm audit signatures` | PASS |
| `npm run lint` | PASS |
| `npm run test:coverage` | PASS, 33 arquivos e 158 testes |
| `npm run build` | PASS |
| `npm run check:bundle` | PASS |
| `npm run test:e2e` | PASS, 18 testes desktop/mobile |

## Documentação do Ciclo 0

- `AGENTS.md`: leitura obrigatória, disciplina de ciclos, validações, proibições e gate de produto.
- `docs/PRODUCT_CONTEXT.md`: pessoas, dores, cenários, vocabulário, decisões, experiência por papel e regressões proibidas.
- `docs/execution/Plano_Mestre_Execucao_CTRH_v1.0.md`: cópia integral conferida por hash.
- `docs/superpowers/specs/2026-07-22-central-trabalho-ctrh-design.md`: arquitetura, reconciliação, segurança, ordem de entrega e validação.
- `docs/adr/ADR-001-semantica-status-carteira.md`: seis status e categorias operacionais.
- `docs/adr/ADR-002-prazos-proxima-acao.md`: três situações de prazo e agenda obrigatória.
- `docs/adr/ADR-003-historico-e-exclusao-logica.md`: eventos auditáveis e remoção recuperável.

## Gate de consciência do produto — Ciclo 0

- **Pessoa:** responsável pelo produto e qualquer agente ou pessoa que continue a evolução.
- **Dor atual:** decisões estavam distribuídas entre código, documentos antigos e histórico de conversa, permitindo reinterpretação de status, prazo e responsabilidade.
- **Ganho:** a próxima sessão encontra contexto, decisões, exemplos, comandos e paradas no próprio repositório antes de alterar comportamento.
- **Proteção:** nenhuma busca, rota, dado, permissão, tela, exportação ou comportamento foi modificado.
- **Prova além dos testes:** a cópia do plano tem hash idêntico; os ADRs não possuem alternativas abertas; os caminhos citados existem; a linha de base do banco foi repetida sem divergência.

## Supabase CLI e acesso administrativo

`npx supabase@2.109.1 init` foi executado, criando `supabase/config.toml` e `supabase/.gitignore` sem segredos. A leitura remota foi realizada pelo conector oficial autenticado do Supabase. O OAuth do CLI em ambiente não interativo exige confirmação humana no navegador; uma janela interativa foi aberta para esse fluxo. O vínculo local deve ser confirmado com:

```bash
npx supabase link --project-ref kdhekkzwcokfrpcrsllr
```

Nenhuma migration foi aplicada no Ciclo 0.

## Vercel

O CLI Vercel 56.4.1 foi autenticado e o diretório local foi vinculado explicitamente a `wilson-m-peixotos-projects/demandas-rhsme-expansao`. Metadados locais, inclusive o token OIDC temporário, permanecem em arquivos ignorados pelo Git. Nenhuma variável de produção ou deployment foi alterado durante a linha de base.

## Próximo ciclo autorizado após merge

**Ciclo 3 — Expansão aditiva do modelo de dados.**

Precondições:

1. PR do Ciclo 2 aprovado e mesclado, salvo autorização explícita de branch dependente;
2. nova branch exclusiva para o Ciclo 3;
3. releitura de `AGENTS.md`, contexto, plano e ADRs;
4. snapshot seguro do schema e dos dados antes de qualquer aplicação externa;
5. testes RED estáticos da migration, dos mappers e dos repositórios;
6. migration somente aditiva, aplicada em produção apenas depois de Preview compatível, backup confirmado e invariantes aprovadas.
