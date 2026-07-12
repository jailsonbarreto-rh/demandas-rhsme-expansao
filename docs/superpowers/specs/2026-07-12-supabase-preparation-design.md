# Preparação da integração Supabase — desenho técnico

## Contexto

A Central de Demandas CTRH SME está publicada como uma aplicação React/Vite e usa `LocalStorage` para autenticação simulada, demandas e histórico. O objetivo desta entrega é preparar integralmente o código, as migrações, os testes e a documentação para uma futura conexão com um novo projeto Supabase, sem criar esse projeto agora e sem alterar o comportamento visual da produção atual.

## Objetivos

- Preservar integralmente o modo local atual, incluindo o acesso de `teste@rioeduca.net`.
- Adicionar um modo Supabase completo, mas desativado por padrão.
- Preparar banco, autenticação, perfis, permissões, dados iniciais e sincronização multiusuário.
- Permitir a ativação futura apenas por configuração, sem nova alteração funcional no código.
- Publicar a preparação no GitHub somente depois de testes automatizados, build e verificação visual.

## Fora de escopo nesta entrega

- Criar o projeto Supabase.
- Aplicar as migrações em um banco remoto.
- Criar usuários reais antes de existir um projeto Supabase.
- Cadastrar credenciais na Vercel ou ativar o modo Supabase em produção.
- Redesenhar componentes, navegação ou identidade visual. Polimentos incrementais de acessibilidade, clareza e segurança são permitidos desde que preservem a composição existente.

## Modos de execução

O aplicativo terá dois modos explícitos:

- `local`: padrão seguro quando `VITE_APP_MODE` estiver ausente ou tiver o valor `local`. Mantém as mesmas chaves de `LocalStorage`, a autenticação simulada e as operações locais existentes.
- `supabase`: ativado somente quando `VITE_APP_MODE=supabase`, `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` estiverem definidos.

Configuração incompleta nunca deve trocar silenciosamente para o banco remoto. Se `VITE_APP_MODE=supabase` estiver definido sem as duas credenciais públicas, a aplicação deve exibir um erro de configuração controlado e não tentar autenticar.

O cliente Supabase será criado apenas no modo Supabase. Nenhuma chave administrativa ou `service_role` poderá ser importada por código executado no navegador.

## Modelo de dados

### `public.perfis_usuarios`

- `id uuid primary key references auth.users(id) on delete cascade`
- `nome text`
- `email text not null unique`
- `setor text`
- `nivel text` com valores `administrador`, `editor` ou `leitor`
- `status text` com valores `ativo`, `pendente` ou `inativo`
- `created_at timestamptz`
- `updated_at timestamptz`

Um gatilho em `auth.users` criará um perfil `pendente` para novos cadastros `@rioeduca.net`. Usuários de outros domínios não receberão autorização de acesso aos dados.

### `public.sme_demandas`

- Mantém os campos funcionais atuais.
- `numero` será único para permitir importação idempotente.
- `limite1` e `limite2` serão `date` anuláveis.
- Inclui `created_by`, `updated_by`, `created_at` e `updated_at`.
- O frontend continuará exibindo e recebendo datas no formato `dd/mm/aaaa` por meio de adaptadores.

### `public.sme_historico`

- Referência para `sme_demandas` com exclusão em cascata, preservando o comportamento atual.
- Armazena `status_novo`, `setor`, `comentario`, `created_by` e `created_at`.
- A data/hora será `timestamptz`, formatada em português no frontend.

## Operações atômicas

Duas funções SQL invocadoras serão expostas por RPC:

- criação de demanda junto com o primeiro registro de histórico;
- mudança de status junto com o comentário de histórico.

Cada função executará em uma única transação. Edição de campos e exclusão continuarão como operações diretas protegidas por RLS.

## Autenticação e usuários iniciais

O modo Supabase usará e-mail e senha pelo Supabase Auth. A sessão será restaurada pelo cliente e acompanhada por `onAuthStateChange`.

Um script administrativo local, nunca incluído no bundle do Vite, criará ou atualizará as contas iniciais depois da criação do projeto:

- `wilson.peixoto@rioeduca.net`: `administrador`, `ativo`.
- `jailsonbsilva@rioeduca.net`: `administrador`, `ativo`.
- `teste@rioeduca.net`: `editor`, `ativo`.

A senha temporária compartilhada será recebida pelo script através de uma variável de ambiente de execução. Ela não será escrita em arquivo rastreado, documentação, histórico Git ou configuração pública da Vercel.

Novos usuários criarão a própria senha e permanecerão pendentes até aprovação por um administrador.

## Autorização e RLS

As tabelas públicas terão RLS ativada e privilégios explícitos para os papéis necessários da Data API.

- Perfil `ativo` e nível `leitor`: consulta demandas e histórico.
- Perfil `ativo` e nível `editor`: consulta, cria, edita, muda status e exclui demandas.
- Perfil `ativo` e nível `administrador`: permissões de editor e gerenciamento dos perfis.
- Perfil `pendente` ou `inativo`: não acessa dados operacionais.

Funções auxiliares privilegiadas, quando indispensáveis para evitar recursão de políticas, ficarão em esquema privado, terão `search_path` vazio, validarão `auth.uid()` e terão `EXECUTE` revogado de `PUBLIC`. Nenhum dado de autorização será lido de `user_metadata`.

## Camada de aplicação

O código será dividido em unidades pequenas:

- configuração e seleção do modo;
- cliente Supabase;
- adaptadores entre linhas do banco e os tipos atuais da interface;
- serviço de autenticação;
- repositório local compatível com as chaves atuais de `LocalStorage`;
- repositório Supabase para demandas e histórico;
- serviço de perfis administrativos.

O `App.tsx` continuará sendo o ponto de composição da interface. A refatoração ficará limitada à substituição das operações de persistência e autenticação por interfaces assíncronas comuns aos dois modos. Componentes visuais e CSS não serão redesenhados. A entrega poderá incluir melhorias locais confirmadas pela auditoria funcional: limpar credenciais ao sair, permitir visualizar ou ocultar senha, rotular controles apenas com ícones, reforçar foco por teclado e área de toque, e identificar claramente ações administrativas ainda demonstrativas.

## Dados iniciais

As 50 demandas existentes serão convertidas para uma carga idempotente. Valores `dd/mm/aaaa` ou vazios serão gravados como `null`; datas válidas serão convertidas para ISO. Cada demanda receberá um histórico inicial de importação somente quando for inserida pela primeira vez.

O processo de carga não poderá sobrescrever alterações já realizadas no banco.

## Sincronização

No modo Supabase, a aplicação assinará mudanças de `sme_demandas` e `sme_historico` pelo Realtime. Eventos remotos causarão nova leitura consistente das coleções. O modo local não abrirá conexões Realtime.

## Tratamento de erros

- Erros de configuração impedem somente o modo Supabase e informam quais variáveis públicas estão ausentes.
- Falhas de login não revelam se uma conta existe.
- Perfil pendente recebe mensagem própria e não entra no painel.
- Falhas de leitura ou escrita preservam o estado anterior da tela e exibem mensagem em português.
- Botões de envio ficam bloqueados durante operações assíncronas para evitar duplicação.
- Assinaturas Realtime são removidas no encerramento da sessão ou desmontagem.
- O modo local permanece disponível mesmo sem rede ou credenciais Supabase.

## Preservação da experiência atual

Com as variáveis atuais da Vercel, o aplicativo continuará no modo local. Devem permanecer reconhecíveis e estruturalmente inalterados:

- composição, identidade e estilo-base da tela de login;
- login local do perfil de teste com a credencial atual;
- abas, cabeçalho, filtros, tabela, modais, drawer e painel administrativo simulado;
- criação, edição, mudança de status, exclusão, exportação CSV e persistência local;
- responsividade desktop e mobile.

## Testes e critérios de aceitação

- Testes unitários para seleção de modo, validação de configuração, domínio de e-mail e conversão de datas/linhas.
- Testes dos repositórios local e Supabase com dependências injetadas.
- Teste do fluxo local de login do perfil de teste e das operações CRUD.
- Testes de autenticação para usuário ativo, pendente e erro de credencial.
- Verificação estática da migração para RLS, privilégios, funções e carga idempotente.
- `npm test` sem falhas.
- `npm run build` sem falhas e sem credenciais Supabase.
- `npm audit --audit-level=high` sem vulnerabilidades altas ou críticas.
- Comparação visual do modo local preparado contra o site atual em desktop e mobile.
- Smoke test final no deployment Vercel gerado pelo envio ao GitHub, confirmando o login de teste e a persistência local.

## Ativação futura

Depois que o projeto Supabase for criado:

1. vincular o repositório ao projeto;
2. aplicar a migração preparada;
3. executar a carga inicial;
4. executar o script seguro de usuários iniciais com as credenciais administrativas apenas no ambiente local;
5. configurar URL e chave pública na Vercel;
6. validar um deployment de preview com `VITE_APP_MODE=supabase`;
7. somente após homologação, ativar o modo Supabase em produção.
