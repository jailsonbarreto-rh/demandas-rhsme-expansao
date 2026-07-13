# Handoff Operacional — Central de Demandas CTRH SME

Atualizado em: 2026-07-13 (Saneamento de Bloqueadores do PR #3 concluído com 65 testes)

---

## 📌 Norte Operacional e Status

Toda a infraestrutura visual, design system editorial, fluxo estático e integração Supabase endurecida e segura estão **prontos para homologação**. O Pull Request #3 foi atualizado no GitHub para sanar todas as revisões críticas do Gate 0.

*   **URL de Produção**: [demandas-rhsme-expansao.vercel.app](https://demandas-rhsme-expansao.vercel.app)
*   **Repositório GitHub**: [github.com/WilsonMPeixoto-2/demandas-rhsme-expansao](https://github.com/WilsonMPeixoto-2/demandas-rhsme-expansao)
*   **Pull Request Ativo**: [#3 (Homologação Gate 0 - Ajustes de Segurança e UX)](https://github.com/WilsonMPeixoto-2/demandas-rhsme-expansao/pull/3)

---

## 🛠️ Entregas Realizadas no Saneamento (PR #3)

### 1. Hardening do Banco de Dados e RPCs
* **Revogação de INSERT Direto:** Retirado o privilégio de `INSERT` na tabela `sme_demandas` para usuários autenticados, forçando a criação a passar exclusivamente pela RPC `criar_sme_demanda`.
* **Segurança Concorrente de Administradores:** Atualizada a trigger administrativa `private.prevent_no_active_admin()` para incluir travamento explícito de linhas usando `SELECT ... FOR UPDATE` nas transações concorrentes através de um advisory lock transacional (`pg_advisory_xact_lock`), e escopo estendido com retornos válidos de `OLD`/`NEW` para operações `BEFORE UPDATE OR DELETE` no banco de dados.
* **Validações nas RPCs:** Adicionada checagem contra strings nulas ou vazias (`btrim(...) = ''`) para parâmetros obrigatórios de processos e status.
* **Restrição de Exclusão:** Limitada a política de RLS do `DELETE` na tabela `sme_demandas` exclusivamente a administradores ativos.

### 2. Script de Bootstrap Seguro e Idempotente
* **Carga Atômica via RPC de Bootstrap:** Criada a RPC `public.bootstrap_importar_demanda` (com privilégios de execução revogados de `public` e `authenticated`) para realizar a carga inicial transacional contendo a demanda e o histórico, sem depender de sessões de login com senhas pessoais dos administradores no script de bootstrap.
* **Senhas Iniciais Únicas:** As contas geradas recebem senhas exclusivas e distintas concatenadas com o prefixo de seus e-mails, eliminando senhas compartilhadas no bootstrap.
* **Idempotência de Usuários:** Substituído o `upsert` na tabela `perfis_usuarios` por uma promoção direcionada: perfis novos no estado inicial da trigger (`leitor` e `status = 'pendente'`) são elevados aos níveis corretos do bootstrap. Configurações personalizadas em perfis já existentes no banco de dados são rigorosamente preservadas.

### 3. Robustez e Reconciliação do Repositório Local
* **Validação Estrutural:** Implementada checagem estrutural rigorosa dos dados locais do LocalStorage (`isValidDemandaArray`, `isValidHistoryArray`) no `load()`. Em caso de inconsistência profunda ou dados nulos/corrompidos, redefine ambas as chaves de forma mútua para evitar quebras silenciosas.
* **Paridade de Validação:** Lançamento de erro explícito no repositório local ao tentar atualizar IDs inexistentes ou criar demandas com números de processo duplicados. Ignora atualizações diretas de `status` no método `update` local para conformidade de contratos.

### 4. Aprimoramento da Interface e UX
* **Formatação Progressiva de Data:** O componente `DateMaskInput.tsx` foi reescrito para utilizar formatação progressiva baseada no evento `onChange` padrão do HTML5 (não mais no `keydown`), permitindo colagem livre de datas (`onPaste`), suporte a qualquer dispositivo móvel e leitores de tela. O estado do pai é mantido como `""` por padrão se não houver interação do usuário.
* **Validação de Data no Submit:** Adicionada validação rigorosa das datas nos formulários de criação (`ModalNovo`) e edição (`ModalEditar`), recusando submissões com datas parciais ou inválidas.
* **Restrição Visual de Exclusão:** Separadas as permissões visuais na interface. O botão de excluir demandas agora é exibido unicamente a administradores ativos (`canDelete`), impedindo que editores vejam opções que o banco rejeitaria.
* **Alertas e Skeletons Globais:** Movidos os loaders (`data.loading`) e o banner de falha de conexão (`data.error`) para o nível global do `App.tsx` para evitar exibição de abas ou painéis SPA vazios durante a carga.
* **Sanitização de CSV Injection:** Otimizada a sanitização do CSV para aplicar `trim()` e escapar caracteres de controle e espaços iniciais antes do escape de segurança.

### 5. Validação da Suíte de Testes
* Suíte de testes automatizados unitários (`vitest`) rodando e passando com **65 testes em verde** (100% de sucesso).
* Build de produção Vite + TypeScript executando com 100% de sucesso.

---

## 🔮 Próximas Etapas (Fluxo de Homologação)

1. Aplicar a migração `20260707000000_sme_demandas.sql` em um banco de dados de **preview/homologação** do Supabase.
2. Rodar o script de bootstrap na base remota de testes.
3. Testar o fluxo de login dos usuários de teste, a carga remota e a consistência das restrições RLS.
4. Após validação em preview, aprovar o Pull Request #3 na branch `main` e aplicar na base de produção.
