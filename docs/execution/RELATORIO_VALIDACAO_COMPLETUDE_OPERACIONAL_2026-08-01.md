# Relatório de validação — conclusão funcional inicial

**Data:** 1º de agosto de 2026<br>
**Escopo:** R5 Essencial, recuperação de senha e rebaseline por completude operacional<br>
**Branch funcional:** `feat/r5-essencial-completude-operacional`<br>
**Estado:** implementação, configuração remota, homologação, publicação controlada e encerramento concluídos

## 1. Resultado

A implementação publicada atende ao escopo autorizado por GOV-013, R5-E-A01, AUTH-E-D01 e V1-E-A01 sem introduzir a arquitetura avançada anteriormente prevista para o R5. O pacote:

- expõe `Registrar andamento` sem alterar o status;
- usa a transição auditável existente para reabrir uma demanda encerrada;
- consolida o drawer e as rotas profundas como prontuário operacional inicial;
- adiciona recuperação segura de senha com resposta neutra e rota exclusiva;
- transforma as RPCs anteriores ao R4 em wrappers das regras atuais;
- reclassifica os ciclos e pacotes remanescentes como materializados, essenciais ou condicionados.

Não foram criadas tabela, coluna, taxonomia histórica, página completa de demanda, snapshot, backfill, restauração, paginação remota ou permissão operacional adicional.

## 2. Gate local integral

O gate foi executado em instalação limpa administrada pelo `npm` 11 e Node 24:

| Verificação | Resultado |
|---|---|
| `npm audit --audit-level=high` | zero vulnerabilidades |
| assinaturas do registry | 558 pacotes com assinatura verificada e 146 com atestação verificada |
| compatibilidade de dependências | 3/3 casos aprovados |
| coerência documental | 9/9 testes e verificador canônico aprovados |
| lint | aprovado com zero avisos |
| testes Vitest | 76 arquivos e 354 testes aprovados |
| cobertura — statements | 79,73% |
| cobertura — branches | 73,82% |
| cobertura — functions | 82,54% |
| cobertura — lines | 82,54% |
| TypeScript | aprovado |
| build de produção | 750 módulos transformados |
| bundle inicial | 194.126 bytes, 60,16% abaixo da linha de base e dentro do limite de 560.330 bytes |
| inspeção do bundle público | 50 arquivos confrontados com 50 identificadores administrativos; aprovado |
| Playwright | 36/36 cenários aprovados em desktop e viewport móvel de 320 px |

O chunk de exportação Excel permanece carregado sob demanda. Seu tamanho gera apenas o aviso já conhecido do empacotador e não aumenta o bundle inicial.

## 3. Comportamentos comprovados

### 3.1 R5 Essencial

- administrador e editor ativos podem registrar andamento em demanda aberta;
- leitor e demanda encerrada não recebem a ação de andamento;
- comentário, próxima providência, data e justificativa temporal seguem as validações vigentes;
- o andamento preserva o status e acrescenta evento `andamento` ao histórico;
- o status atual não é oferecido como destino;
- a reabertura é apresentada contextualmente e gera transição auditável;
- carteira, busca, filtros e rota permanecem preservados;
- tabela e drawer refletem a próxima providência após a mutação.

### 3.2 Recuperação de senha

- `Esqueci minha senha` exige e-mail institucional e mostra confirmação neutra;
- fora do desenvolvimento local, o destino é sempre `https://demandas-rhsme-expansao.vercel.app/redefinir-senha`;
- host externo, HTTP em produção, query string e fragmento são recusados antes da chamada ao Supabase;
- somente `PASSWORD_RECOVERY` habilita o formulário de nova senha;
- acesso manual, erro do provedor ou expiração não expõem o formulário;
- a senha exige oito caracteres, minúscula, maiúscula e número, com confirmação idêntica;
- a sessão temporária é encerrada localmente após a alteração;
- a rota de recuperação não carrega dados operacionais.
- a abertura direta de `/redefinir-senha` é encaminhada para a SPA pela configuração da Vercel e protegida por teste automatizado.

## 4. Supabase remoto

Projeto verificado: `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, região `sa-east-1`.

### 4.1 Migration e integridade

- migration remota presente: `20260801044712_r5_essential_harden_pre_r4_progress_status`;
- 379 demandas ativas;
- zero demandas excluídas;
- 764 registros históricos;
- nenhuma alteração ou backfill de dado operacional no pacote.

As duas assinaturas de compatibilidade anteriores ao R4 estão com:

- `EXECUTE` para `authenticated`;
- sem `EXECUTE` para `anon` e `service_role`;
- `SECURITY DEFINER` com `search_path` vazio;
- delegação direta às funções R4, que preservam validação de papel, estado, auditoria e justificativa temporal.

### 4.2 Auth

- redirect exato de produção adicionado e confirmado na lista permitida;
- senha mínima remota alterada de 6 para 8 caracteres;
- requisito remoto alterado para minúscula, maiúscula e número;
- confirmação de e-mail e mudança segura de e-mail preservadas;
- proteção contra senhas vazadas continua indisponível no plano Free; não houve upgrade nem contratação.

### 4.3 Advisors

Os Advisors não apontaram regressão bloqueante produzida por esta migration.

Avisos de segurança conhecidos:

- duas tabelas `private` de importação têm RLS sem policies por serem staging interno deliberadamente inacessível;
- funções operacionais atômicas aparecem como `SECURITY DEFINER` executáveis por `authenticated`; isso é intencional, e as funções mantêm checagem interna de identidade, perfil e papel. Os novos wrappers não admitem `anon` nem `service_role`;
- proteção contra senhas vazadas está indisponível no plano Free e foi compensada pela política forte alinhada no cliente e no servidor.

Informações de desempenho não bloqueantes:

- duas chaves estrangeiras sem índice de cobertura;
- tabelas privadas de backup sem chave primária;
- um índice ainda sem uso observado.

Esses itens já pertencem ao inventário operacional e não justificam ampliar o escopo deste release sem evidência de desempenho ou decisão própria.

Referências de remediação do linter:

- [funções SECURITY DEFINER expostas a autenticados](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable);
- [política e proteção de senhas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection);
- [RLS sem policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy);
- [chaves estrangeiras sem índice](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys).

## 5. Resultado dos gates de release

| Gate | Resultado e evidência |
|---|---|
| rastreabilidade funcional | PR #112 integrado no merge `1a1a8bec6eb0d6acc1ff4890b7ec45c3d6339e09` |
| CI funcional | gates do SHA `22bd92623fe7e0c67f29aacec33503032322053c` aprovados, inclusive replay integral das migrations e 36/36 cenários Playwright |
| Preview | `dpl_GkBQLRVNk98sJyU4z5e8eNz48Vry`, `READY`, no SHA `a1b26235fff5ec83377eab066bf3e12c5959c398` |
| homologação do Preview | acesso, confirmação neutra, retorno seguro, abertura direta de `/redefinir-senha`, rotas profundas e console aprovados |
| release | PR #113 integrado no merge `501f8cfb6c193f90a71ffabc2456230dbe0dc026` após novo CI integral aprovado |
| Production | `dpl_AZARXi92PqtR5WrRJtgpvDZgxZjD`, `READY`, com alias canônico e SHA de merge confirmados |
| verificação em Production | acesso, confirmação neutra, `/redefinir-senha`, `/demandas`, `/minhas-demandas` e `/admin` aprovados; console e runtime sem erros |
| encerramento | PR #114 restaura `deploymentEnabled: false` a partir do commit `6335fbd87e70a9b13ce11ab2140d226f596c8d18` |

Os fluxos autenticados de andamento, reabertura e permissões foram comprovados pela suíte comportamental e pelos 36 cenários de navegador executados no CI. A verificação manual de Preview e Production concentrou-se nas superfícies públicas e rotas profundas, sem usar ou inventar credenciais operacionais.

O encerramento deste pacote não autoriza automaticamente R5 avançado, R1 residual, R2, extensões de R6 a R11 ou qualquer incorporação do legado. E2 e a homologação consolidada permanecem gates separados antes da entrega final do produto.
