# Central de Demandas — Expansão

Sistema institucional para acompanhamento de demandas de Recursos Humanos da Secretaria Municipal de Educação do Rio de Janeiro.

- Produção: [demandas-rhsme-expansao.vercel.app](https://demandas-rhsme-expansao.vercel.app)
- Repositório: [WilsonMPeixoto-2/demandas-rhsme-expansao](https://github.com/WilsonMPeixoto-2/demandas-rhsme-expansao)

## Situação atual

A aplicação opera em produção no modo multiusuário integrado ao Supabase, com autenticação real, persistência compartilhada, RLS, RPCs transacionais e atualização em tempo real. O modo local permanece disponível apenas como mecanismo explícito de contingência e rollback.

O projeto inclui:

- autenticação local compatível com o site atual;
- autenticação e perfis pelo Supabase;
- banco com RLS e níveis `administrador`, `editor` e `leitor`;
- bootstrap idempotente dos usuários iniciais e das 50 demandas;
- Realtime para demandas e histórico;
- retorno imediato ao modo local por variável de ambiente.

## Executar localmente

Requisitos: Node.js 20 ou superior e npm.

```bash
npm ci
copy .env.example .env.local
npm run dev
```

Sem arquivo de ambiente, a aplicação também inicia em modo local.

## Validação

```bash
npm test
npm run build
```

## Configuração do Supabase

Consulte o guia [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md). A chave secreta de bootstrap nunca deve ser configurada no frontend nem rastreada pelo Git.

## Relatório do projeto

O histórico consolidado do trabalho entregue e o estado atual dos ambientes estão em [docs/RELATORIO_ESTADO_ATUAL.md](docs/RELATORIO_ESTADO_ATUAL.md).
