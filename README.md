# Central de Demandas — Expansão

Sistema institucional para acompanhamento de demandas de Recursos Humanos da Secretaria Municipal de Educação do Rio de Janeiro.

- Produção: [demandas-rhsme-expansao.vercel.app](https://demandas-rhsme-expansao.vercel.app)
- Repositório: [WilsonMPeixoto-2/demandas-rhsme-expansao](https://github.com/WilsonMPeixoto-2/demandas-rhsme-expansao)

## Situação atual

A aplicação opera em produção no modo multiusuário integrado ao Supabase, com autenticação real, persistência compartilhada, RLS, RPCs transacionais e atualização em tempo real. Builds de produção utilizam o projeto Supabase oficial mesmo quando a hospedagem não sincroniza as variáveis públicas. O modo local existe somente para desenvolvimento e testes, usa oito demandas inequivocamente sintéticas e é rejeitado em produção.

O projeto inclui:

- autenticação local de desenvolvimento compatível com o site atual;
- autenticação e perfis pelo Supabase;
- banco com RLS e níveis `administrador`, `editor` e `leitor`;
- bootstrap administrativo idempotente dos usuários iniciais e do acervo original, mantido fora do grafo do cliente;
- Realtime para demandas e histórico;
- verificação automática de que identificadores administrativos não aparecem no bundle público.

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

Consulte o guia [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md). A chave secreta de bootstrap nunca deve ser configurada no frontend nem rastreada pelo Git.

## Relatório do projeto

O histórico consolidado do trabalho entregue e o estado atual dos ambientes estão em [docs/RELATORIO_ESTADO_ATUAL.md](docs/RELATORIO_ESTADO_ATUAL.md).

<!-- deployment-retry: 2026-07-14T06:53:00Z -->
