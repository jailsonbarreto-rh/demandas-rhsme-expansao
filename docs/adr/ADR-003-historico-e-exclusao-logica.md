# ADR-003 — Histórico auditável e exclusão lógica

- **Status:** aceito; restauração de produto superada por R5-1-D01
- **Data:** 2026-07-21; atualizado em 2026-07-30
- **Escopo:** RPCs, linha do tempo, autoria, edição, exclusão lógica e auditoria administrativa

## Contexto

O histórico registra mudanças de status e demais alterações relevantes de metadados, prazos, responsável e acompanhamento. Uma exclusão física apagaria contexto institucional e impediria recuperação técnica excepcional. O produto precisa responder quem fez, quando fez, o que mudou e por quê, sem inventar autoria para o legado.

O desenho inicial previa restauração administrativa. A decisão R5-1-D01 simplificou o produto: demandas excluídas permanecem preservadas e auditáveis, mas não retornam à carteira por ação disponível no sistema.

## Decisão

Toda mutação operacional passa por uma RPC nomeada e auditável. O contrato final não mantém `update(id, Partial<Demanda>)` genérico.

A linha do tempo reconhece os tipos:

| Tipo | Gatilho | Conteúdo mínimo |
|---|---|---|
| `criacao` | nova demanda | status, setor, autor e origem |
| `andamento` | comentário sem mudança de status | comentário, próxima ação e data alteradas |
| `mudanca_status` | status anterior diferente do novo | anterior, novo, comentário e próxima ação |
| `edicao` | alteração de metadados | lista antes/depois e justificativa |
| `reatribuicao` | alteração de responsável | responsável anterior e novo |
| `alteracao_prazo` | data, situação ou justificativa alterada | antes/depois por campo |
| `exclusao` | exclusão lógica | motivo obrigatório e autor |
| `restauracao` | somente eventual evento histórico anterior | motivo e autor preservados quando existentes |

Todo evento apresenta data e hora, autor ou `Autor não identificado`, setor, tipo, status resultante e descrição. Eventos legados sem autoria continuam sem identificação inventada.

A exclusão operacional é lógica, com `deleted_at`, `deleted_by` e motivo de pelo menos dez caracteres. Ela:

- preserva demanda e histórico;
- remove o item das consultas normais;
- fica disponível somente na área administrativa para consulta e auditoria;
- somente pode ser executada por administrador ativo;
- não oferece restauração, edição, mudança de status ou exclusão física.

A função técnica de restauração pode permanecer definida no banco para recuperação excepcional pelo proprietário, mas não possui `EXECUTE` para `public`, `anon`, `authenticated` ou `service_role`. Ela não integra o contrato público do frontend, hooks ou repositórios.

As RPCs operacionais autenticadas obtêm o ator por `auth.uid()`; o cliente nunca escolhe a identidade do ator. Em rotina administrativa privilegiada sem sessão pessoal, a função deve validar previamente a identidade e a autorização do ator antes de atribuí-lo, e o gatilho preserva esse valor validado. O banco produz o JSON antes/depois a partir dos valores reais. Evento e mutação ocorrem na mesma transação, e falha de auditoria reverte a alteração.

Responsabilidade e autoria são contratos independentes. `responsavel_id` indica a pessoa atribuída como referência da demanda, sem criar propriedade exclusiva. Administrador ou editor ativo pode atuar em demanda atribuída a outra pessoa; a ação registra o usuário que a praticou e não muda o responsável, salvo reatribuição explícita.

## Consequências

- Registrar andamento não exige falsificar mudança de status.
- Edição, reatribuição e prazo tornam-se rastreáveis.
- Ausência, férias ou apoio entre colegas não bloqueiam a continuidade por outro usuário autorizado.
- O histórico identifica o executor real sem transformar essa pessoa automaticamente em responsável.
- Exclusão não rompe a memória institucional e pode ser auditada por administrador.
- Editor e leitor não veem a ação de exclusão nem consultam a lixeira.
- Administrador exclui com motivo e consulta registros preservados, mas não restaura pelo produto.
- Recuperação excepcional exige procedimento técnico fora da aplicação.
- A migration de contrato revoga mutações legadas somente após o frontend compatível estar homologado.

## Decisões rejeitadas ou superadas

- Manter atualização genérica sem justificativa e sem evento.
- Tratar comentário de acompanhamento como mudança de status.
- Executar `DELETE` físico para remoção operacional.
- Inventar autoria ou estado anterior para eventos legados.
- Oferecer restauração a administradores pela interface ou pela API autenticada.
