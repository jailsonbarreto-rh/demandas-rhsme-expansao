# Relatório de Validação — R5-1 Lixeira Administrativa e Auditoria

**Data:** 30 de julho de 2026  
**Projeto:** Central de Demandas CTRH  
**Branch funcional:** `feat/r5-1-admin-trash-audit`  
**PR:** #106  
**Estado deste relatório:** aplicação e banco homologados; publicação do frontend ainda pendente

## 1. Escopo validado

O R5-1 implementa exclusivamente:

- exclusão lógica disponível somente a administrador ativo;
- motivo obrigatório e registro de autoria, data e hora;
- preservação integral da demanda e do histórico;
- seção `Demandas excluídas` na área administrativa;
- pesquisa e detalhe somente leitura;
- ausência de restauração, edição, mudança de status ou exclusão física na lixeira;
- retirada da restauração dos contratos públicos do frontend;
- preservação da função técnica de restauração no banco, sem execução por papéis da API.

R5-2 e pacotes posteriores não integram esta entrega.

## 2. TDD

### RED comprovado

1. `cycle4Contracts.test.ts` falhou enquanto `restore` permanecia exposto nos repositórios local e Supabase.
2. `r5TrashAuditMigration.test.ts` falhou enquanto a migration de revogação não existia.
3. `AdminTrashPanel.test.tsx` falhou enquanto a interface administrativa não existia.

### GREEN comprovado

- contratos local e Supabase sem `restore`;
- migration aditiva preservando a função e revogando os quatro papéis;
- quatro cenários do painel administrativo;
- exclusão ausente para perfil sem permissão administrativa;
- preservação da demanda excluída no armazenamento local e no histórico;
- repositório Supabase sem chamada de restauração.

## 3. Gate canônico final

**Deployment de validação:** `dpl_CHWakBVPusk3xKwrvWiZSpq7wENf`  
**Estado:** `READY`

Resultados:

- `npm ci` e patches transitivos: aprovados;
- auditoria de dependências: zero vulnerabilidades;
- assinaturas do registro: 560 pacotes verificados;
- atestações: 147 pacotes;
- compatibilidade transitiva: 3/3;
- documentação canônica: 9/9;
- ESLint com zero warnings: aprovado;
- arquivos de teste: **69 aprovados**;
- testes unitários e de integração: **317 aprovados**;
- cobertura global de linhas: **81,46%**;
- TypeScript: aprovado;
- build Vite: aprovado;
- bundle inicial: **194.114 bytes**, 60,16% abaixo da linha de base;
- limite de bundle preservado: 560.330 bytes;
- inspeção pública: 47 arquivos verificados contra 50 identificadores administrativos.

## 4. Navegador desktop e mobile

**Deployment E2E:** `dpl_GGKDV2Ek7MKhjMMXXJN2zmJbaD6t`  
**Resultado:** **22 de 22 cenários Playwright aprovados**.

Cobertura de navegador:

- desktop Chromium;
- mobile com largura de 320 px;
- acessibilidade automatizada;
- login e navegação;
- carteiras e filtros;
- modais e drawer;
- exportação;
- ausência de erros de console;
- ausência de estouro horizontal.

A lixeira possui cobertura funcional própria em Testing Library; o modo local usado pelo Playwright não exibe a área remota da lixeira, conforme o contrato de segurança.

## 5. Supabase

**Projeto:** `CTRH PROCESSOS`  
**Ref:** `kdhekkzwcokfrpcrsllr`  
**Migration remota:** `20260730180713_r5_1_disable_product_restore`

A migration executou somente:

```sql
revoke all on function public.restaurar_sme_demanda(bigint, text)
from public, anon, authenticated, service_role;
```

Também registrou comentário explicando o caráter técnico excepcional da função. Não houve DML, backfill, alteração de linha, drop de função ou mudança de RLS.

### Grants confirmados após a migration

| Função | public | anon | authenticated | service_role |
|---|---:|---:|---:|---:|
| `restaurar_sme_demanda(bigint, text)` | não | não | não | não |
| `excluir_sme_demanda(bigint, text)` | não | não | sim | sim |

`excluir_sme_demanda` continua protegida internamente por `private.is_admin()`. O grant autenticado não permite exclusão por editor ou leitor.

### Integridade pós-migration

| Item | Antes | Depois |
|---|---:|---:|
| Demandas | 379 | 379 |
| Demandas excluídas | 0 | 0 |
| Históricos | 764 | 764 |
| Perfis | 13 | 13 |

Nenhum registro de teste ou resíduo foi criado.

## 6. Segurança por papel

Confirmado por código, testes e RLS:

- administrador ativo recebe a ação de exclusão e acessa `/admin`;
- editor ativo não recebe `Excluir`;
- leitor não recebe controles de mutação;
- editor e leitor não consultam demandas ou históricos excluídos pela API;
- a lixeira não oferece restauração;
- a função técnica de restauração não é executável por qualquer papel da API;
- a exclusão física permanece indisponível no produto.

## 7. Conclusão técnica

A implementação está apta para integração e publicação controlada. A aprovação deste relatório não autoriza R5-2 nem qualquer outro pacote funcional.

Gates ainda posteriores a este documento:

1. merge do PR #106;
2. deployment Production do SHA integrado;
3. verificação de domínio, `/admin`, runtime e Supabase;
4. restauração de `deploymentEnabled: false`;
5. atualização final do Handoff com SHAs e deployment de Production.
