# Relatório de implementação e estado atual

Data de consolidação: **21 de julho de 2026**

## Resumo executivo

A Central de Demandas — Expansão opera em produção no modo **Supabase**, no projeto `kdhekkzwcokfrpcrsllr`. O modo **local** permanece disponível somente no desenvolvimento e nos testes, com oito registros sintéticos; builds de produção recusam explicitamente esse modo.

Nenhuma senha, chave secreta ou credencial administrativa foi salva no repositório.

## Trabalho concluído

### Compatibilidade e segurança operacional

- Preservação do login local `teste@rioeduca.net` e da sessão `demandas_user`.
- Preservação das coleções locais `demandas_data` e `demandas_history` apenas no ambiente de demonstração.
- Seleção explícita de backend por `VITE_APP_MODE`, com `local` como padrão exclusivo do desenvolvimento sem variáveis.
- Build de produção funcional com a configuração pública oficial do Supabase.
- Bloqueio de `VITE_APP_MODE=local` quando `PROD=true`.
- Scanner obrigatório contra a presença de identificadores administrativos em `dist/assets`.

### Supabase preparado

- Cliente público lazy, usando somente URL e chave publicável.
- Autenticação por e-mail e senha do domínio `@rioeduca.net`.
- Solicitação de primeiro acesso com perfil pendente.
- Perfis e níveis `administrador`, `editor` e `leitor`.
- Tabelas de perfis, demandas e histórico com RLS.
- Políticas separadas para leitura, edição e administração.
- Helpers privados com privilégios controlados e `search_path` seguro.
- RPCs atômicas para criar demanda e atualizar status com histórico.
- Realtime para demandas e histórico.
- Administração real de perfis no modo Supabase.

### Bootstrap inicial

O script `npm run bootstrap:supabase` está pronto para:

- preparar `wilson.peixoto@rioeduca.net` como administrador;
- preparar `jailsonbsilva@rioeduca.net` como administrador;
- preparar `teste@rioeduca.net` como editor;
- importar de forma idempotente as 50 demandas do acervo administrativo original e seus históricos.

O acervo fica em `scripts/bootstrap/initial-demandas.json`, fora de `src` e do grafo Vite. As senhas temporárias são recebidas somente pelas variáveis privadas específicas de cada conta em `.env.bootstrap`, arquivo ignorado pelo Git.

### Interface e experiência do usuário

- Aparência, composição, cabeçalho, abas, cartões, filtros, tabela e drawer preservados.
- Credenciais dos formulários limpas no logout.
- Controle acessível para mostrar e ocultar senha.
- Nomes acessíveis para menus, drawer e modais.
- Foco de teclado visível e alvos de toque ampliados no mobile.
- Ações locais simuladas identificadas como **Demonstração**.
- E-mail do perfil de teste exibido de forma consistente.

### Qualidade e documentação

- 164 testes unitários/de integração e 18 cenários Playwright cobrindo configuração, autenticação, repositórios, migração, bootstrap, integração local/Supabase, administração, busca e acessibilidade.
- Build TypeScript/Vite aprovado.
- Auditoria npm sem vulnerabilidades conhecidas.
- CI configurada para instalar dependências, auditar, testar e gerar o build.
- Guia completo de ativação e rollback em `docs/SUPABASE_SETUP.md`.

## Estado atual dos ambientes

| Ambiente | Estado |
|---|---|
| GitHub | Código-fonte, migração, testes e documentação publicados na branch principal |
| Vercel Production | Modo Supabase; aparência e acesso atuais preservados |
| Supabase | Projeto `CTRH PROCESSOS` ativo e saudável; linha de base de 379 demandas, 385 históricos e 5 perfis em 21/07/2026 |

## Controles operacionais atuais

1. validar alterações em Preview antes de Production;
2. executar `npm run check:full` antes de publicar;
3. manter o acervo administrativo fora de `src`;
4. usar somente o modo Supabase em produção;
5. recuperar falhas pela correção da configuração ou por um deployment Supabase conhecido como estável, sem fallback local.

## Busca avançada e encontrabilidade

A área Demandas possui busca multi-termo sobre número, tipo, assunto, responsável, setor, classificação, status e histórico. A comparação é tolerante a acentos, caixa e pontuação de números. Resultados indicam os campos correspondentes, mostram contexto do histórico e destacam os termos visíveis. O sistema mantém até cinco buscas recentes por navegador, oferece o atalho Ctrl/Command+K e filtra prazo interno, prazo final ou movimentações por período preservado na URL.
