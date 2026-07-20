# Relatório de implementação e estado atual

Data de consolidação: **12 de julho de 2026**

## Resumo executivo

A Central de Demandas — Expansão está preparada para operar em dois modos. O modo **local** continua ativo por padrão, preservando o site, o login de teste e os dados já salvos no navegador. O modo **Supabase** está implementado e testado, mas permanece desligado até a criação do projeto e o preenchimento das variáveis públicas.

Nenhuma senha, chave secreta ou credencial administrativa foi salva no repositório.

## Trabalho concluído

### Compatibilidade e segurança operacional

- Preservação do login local `teste@rioeduca.net` e da sessão `demandas_user`.
- Preservação das coleções locais `demandas_data` e `demandas_history`.
- Seleção explícita de backend por `VITE_APP_MODE`, com `local` como padrão seguro.
- Build funcional sem qualquer variável Supabase.
- Rollback imediato para o modo local por variável de ambiente.

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
- importar de forma idempotente as 50 demandas iniciais e seus históricos.

A senha temporária é recebida apenas pela variável privada `BOOTSTRAP_PASSWORD` em arquivo ignorado pelo Git.

### Interface e experiência do usuário

- Aparência, composição, cabeçalho, abas, cartões, filtros, tabela e drawer preservados.
- Credenciais dos formulários limpas no logout.
- Controle acessível para mostrar e ocultar senha.
- Nomes acessíveis para menus, drawer e modais.
- Foco de teclado visível e alvos de toque ampliados no mobile.
- Ações locais simuladas identificadas como **Demonstração**.
- E-mail do perfil de teste exibido de forma consistente.

### Qualidade e documentação

- 57 testes automatizados cobrindo configuração, autenticação, repositórios, migração, bootstrap, integração local/Supabase, administração e acessibilidade.
- Build TypeScript/Vite aprovado.
- Auditoria npm sem vulnerabilidades conhecidas.
- CI configurada para instalar dependências, auditar, testar e gerar o build.
- Guia completo de ativação e rollback em `docs/SUPABASE_SETUP.md`.

## Estado atual dos ambientes

| Ambiente | Estado |
|---|---|
| GitHub | Código-fonte, migração, testes e documentação publicados na branch principal |
| Vercel Production | Modo local; aparência e acesso atual preservados |
| Supabase | Projeto ainda não criado para esta aplicação |

## Única etapa externa pendente

Criar o projeto Supabase na região `sa-east-1` e seguir `docs/SUPABASE_SETUP.md`. A ativação deve ocorrer primeiro em Preview e somente depois em Production.

## Critérios para ativar o Supabase

Antes de trocar Production para `VITE_APP_MODE=supabase`:

1. aplicar a migração;
2. executar o bootstrap privado;
3. confirmar RLS e Advisors sem alertas críticos;
4. testar os três usuários em Preview;
5. validar CRUD, histórico, administração e Realtime;
6. manter documentado o rollback para `VITE_APP_MODE=local`.


## Busca avançada e encontrabilidade

A área Demandas possui busca multi-termo sobre número, tipo, assunto, responsável, setor, classificação, status e histórico. A comparação é tolerante a acentos, caixa e pontuação de números. Resultados indicam os campos correspondentes, mostram contexto do histórico e destacam os termos visíveis. O sistema mantém até cinco buscas recentes por navegador, oferece o atalho Ctrl/Command+K e filtra prazo interno, prazo final ou movimentações por período preservado na URL.
