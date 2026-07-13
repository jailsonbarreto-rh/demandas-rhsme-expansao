# Central de Demandas — Expansão

Sistema institucional para acompanhamento de demandas de Recursos Humanos da Secretaria Municipal de Educação do Rio de Janeiro.

- Produção: [demandas-rhsme-expansao.vercel.app](https://demandas-rhsme-expansao.vercel.app)
- Repositório: [WilsonMPeixoto-2/demandas-rhsme-expansao](https://github.com/WilsonMPeixoto-2/demandas-rhsme-expansao)

## Situação atual

O modo local continua sendo o padrão e preserva o login e os dados já usados no navegador. A integração Supabase está preparada, mas permanece desligada até a criação do projeto e a configuração das variáveis públicas.

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

## Ativar o Supabase futuramente

Siga o guia [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md). A chave secreta de bootstrap nunca deve ser configurada no frontend nem rastreada pelo Git.

## Relatório do projeto

O histórico consolidado do trabalho entregue e o estado atual dos ambientes estão em [docs/RELATORIO_ESTADO_ATUAL.md](docs/RELATORIO_ESTADO_ATUAL.md).
