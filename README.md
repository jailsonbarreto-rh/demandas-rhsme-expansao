# Central de Demandas — Expansão

Sistema institucional para acompanhamento de demandas de Recursos Humanos da Secretaria Municipal de Educação do Rio de Janeiro.

- Produção: [demandas-rhsme-expansao.vercel.app](https://demandas-rhsme-expansao.vercel.app)
- Repositório: [WilsonMPeixoto-2/demandas-rhsme-expansao](https://github.com/WilsonMPeixoto-2/demandas-rhsme-expansao)

## Situação atual

A aplicação opera em produção no modo multiusuário integrado ao Supabase, com autenticação real, persistência compartilhada, RLS, RPCs transacionais e atualização em tempo real. O modo local existe somente para desenvolvimento e testes, usa dados inequivocamente sintéticos e é rejeitado em produção.

O estado funcional atual inclui:

- responsáveis oficiais vinculados por UUID;
- 378 demandas históricas vinculadas aos perfis oficiais;
- preservação de uma informação histórica sem UUID (`Vanessa Migrado`);
- novas demandas e reatribuições sem nome livre ou responsável externo;
- carteira da equipe em `/demandas`;
- carteira pessoal por UUID em `/minhas-demandas`;
- indicadores contextuais conforme a carteira aberta;
- filtros, paginação visual e rotas profundas preservando o contexto;
- mutações auditáveis preparadas no Supabase.

A sequência de evolução retoma R1 e R2 antes de R4 e R5. Nenhum ciclo está automaticamente autorizado.

## Governança e documentação

Antes de alterar código, banco ou comportamento, leia `AGENTS.md`.

As referências vigentes são:

- [Registro de Decisões](docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md);
- [Contexto do Produto](docs/PRODUCT_CONTEXT.md);
- [Plano Remanescente v2.1](docs/execution/Plano_Remanescente_Execucao_CTRH_v2.1.md);
- [Adendo de Governança v2.0.3](docs/execution/ADENDO_GOVERNANCA_POR_ETAPA_CTRH_v2.0.3.md);
- [Protocolo de Decisões v1.2](docs/product/PROTOCOLO_HOMOLOGACAO_DECISOES_PRODUTO_CTRH_v1.2.md);
- [Política de Sincronização Documental](docs/product/POLITICA_SINCRONIZACAO_DOCUMENTAL_CTRH_v1.0.md);
- [Handoff Operacional](docs/HANDOFF.md).

Toda alteração de regra de negócio, lógica, permissão, obrigatoriedade, cálculo, dado ou rota deve atualizar no mesmo PR todos os documentos vigentes afetados. Código correto com documentação divergente não constitui entrega concluída.

Planos e especificações anteriores permanecem apenas como registros históricos no Git e não podem restaurar regras posteriormente alteradas.

## Executar localmente

Requisitos: Node.js 20 ou superior e npm.

```bash
npm ci
copy .env.example .env.local
npm run dev
```

Sem arquivo de ambiente, o servidor de desenvolvimento inicia em modo local com dados sintéticos. Um build de produção nunca aceita `VITE_APP_MODE=local`.

## Validação

```bash
npm test
npm run check:full
```

## Configuração do Supabase

Consulte [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md). Chaves secretas nunca devem ser configuradas no frontend nem rastreadas pelo Git.

## Relatório e estado operacional

O estado mais recente dos ambientes e a próxima atividade autorizada estão em [docs/HANDOFF.md](docs/HANDOFF.md). Relatórios antigos permanecem históricos e não substituem o Handoff atual.
