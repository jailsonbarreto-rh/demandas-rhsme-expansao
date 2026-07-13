# Handoff Operacional — Central de Demandas CTRH SME

Atualizado em: 2026-07-13 — saneamento final do Gate 0 no PR #4

---

## Norte operacional e status

A infraestrutura visual, o modo local e a camada de integração Supabase estão **prontos para homologação remota**, mas o Gate 0 somente será considerado homologado após a execução da migration e do bootstrap em um projeto Supabase de testes e a aprovação dos testes funcionais de administrador, editor e leitor.

- **URL de produção atual:** [demandas-rhsme-expansao.vercel.app](https://demandas-rhsme-expansao.vercel.app)
- **Repositório GitHub:** [WilsonMPeixoto-2/demandas-rhsme-expansao](https://github.com/WilsonMPeixoto-2/demandas-rhsme-expansao)
- **Pull Request ativo:** [#4 — Homologação Gate 0](https://github.com/WilsonMPeixoto-2/demandas-rhsme-expansao/pull/4)
- **Branch de trabalho:** `homologacao/gate-0`

---

## Entregas do saneamento final

### 1. Banco, RLS e RPCs

- Inserção direta em `sme_demandas` e `sme_historico` removida para usuários comuns.
- Alteração direta da coluna `status` removida; mudanças de status passam pela RPC transacional `atualizar_status_sme_demanda`.
- Exclusão de demandas restrita a administradores ativos.
- RPCs de aplicação executadas como `security definer`, com `search_path` vazio e validação interna de permissão.
- Trigger `private.prevent_no_active_admin()` protege contra a ausência de administrador ativo e serializa alterações concorrentes com advisory lock transacional.
- RPC `public.bootstrap_importar_demanda` restrita à `service_role`, com inserção atômica de demanda e histórico e reparação de carga incompleta.

### 2. Bootstrap

- Senhas iniciais distintas por usuário, fornecidas por variáveis de ambiente separadas.
- Usuários existentes não têm a senha redefinida.
- Perfis recém-criados pela trigger no estado `leitor/pendente` são promovidos; perfis já personalizados são preservados.
- Carga inicial não depende da senha pessoal de um administrador.
- Reexecuções importam somente registros ausentes e podem reparar demanda sem histórico inicial.

### 3. Repositórios e interface

- Modo local preserva bases válidas com qualquer quantidade de registros e trata dados estruturais inválidos.
- Atualizações comuns ignoram `status`; a operação é exclusiva do fluxo de movimentação com histórico.
- `canEdit` e `canDelete` estão separados, mantendo exclusão apenas para administradores.
- Loader e banner de erro são globais.
- Logout limpa abas, filtros, modais, drawer e dados administrativos da sessão anterior.

### 4. Datas e exportação

- `DateMaskInput` utiliza entrada progressiva pelo evento `onChange`, compatível com colagem, mobile e tecnologias assistivas.
- Modais de criação e edição validam datas no envio.
- O mapper recusa datas parciais ou inexistentes antes de montar o valor para o banco.
- CSV utiliza `;`, cabeçalho `sep=;` e neutralização de células com potencial de fórmula.

### 5. Validação automatizada

- Testes de regressão cobrem permissões da migration, credenciais do bootstrap, datas inválidas, exclusão do `status` no update comum e validação dos formulários.
- GitHub Actions executa instalação bloqueada, auditoria de dependências, testes e build de produção.
- A contagem final de testes e o SHA homologado devem ser confirmados na execução mais recente da CI do PR #4.

---

## Próximas etapas obrigatórias

1. Confirmar CI e Preview verdes sobre o SHA final do PR #4.
2. Criar projeto Supabase exclusivo de homologação.
3. Aplicar `supabase/migrations/20260707000000_sme_demandas.sql`.
4. Executar `npm run bootstrap:supabase` com credenciais privadas e distintas.
5. Homologar administrador, editor e leitor.
6. Testar RLS, RPCs, concorrência administrativa, idempotência do bootstrap e Realtime.
7. Somente após aprovação formal, mesclar o PR #4 na `main`.
8. Ativar Supabase em Production apenas depois da homologação do Preview.
