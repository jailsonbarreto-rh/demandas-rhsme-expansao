# ADR-001 — Semântica de status e carteira

- **Status:** aceito
- **Data:** 2026-07-21
- **Escopo:** domínio, filtros, alertas, painel e relatórios

## Contexto

Os seis status existentes descrevem etapas diferentes do trabalho do CTRH, mas a leitura genérica de todo registro não encerrado como “ativo” mistura providência interna, espera externa e monitoramento. Isso impede que usuários identifiquem com precisão o que exige ação imediata sem alterar a terminologia já reconhecida pela equipe.

## Decisão

Os seis status existentes permanecem inalterados. A aplicação deriva uma categoria operacional única para cada status:

| Status | Categoria operacional | Exige ação CTRH agora | Em acompanhamento | Regra operacional |
|---|---|---:|---:|---|
| Aguardando Andamento | Providência CTRH | sim | sim | exige próxima ação e data |
| Ajustar | Providência CTRH | sim | sim | exige correção descrita, próxima ação e data |
| Para Assinatura | Providência CTRH | sim | sim | exige próxima ação; alerta após três dias |
| Tramitado | Aguardando retorno externo | não | sim | não é encerrado; exige data de acompanhamento |
| Sobrestado | Monitoramento | não | sim | exige motivo e data de revisão |
| Encerrado | Encerrada | não | não | limpa próxima ação e preserva histórico |

Os termos oficiais de interface são:

- **Em acompanhamento:** todos, exceto `Encerrado`;
- **Com providência CTRH:** `Aguardando Andamento`, `Ajustar` e `Para Assinatura`;
- **Aguardando retorno:** `Tramitado`;
- **Sobrestadas:** `Sobrestado`;
- **Encerradas:** `Encerrado`.

O rótulo “Demandas Ativas” será substituído por “Em acompanhamento”. Funções puras de domínio serão a única fonte para componentes, filtros, alertas, métricas e Excel.

## Consequências

- `Tramitado` continua visível na carteira e nunca conta como encerrado ou providência CTRH.
- Painel e relatórios podem mostrar simultaneamente o estoque em acompanhamento e o subconjunto que exige ação interna.
- Nenhum componente pode reinterpretar status isoladamente.
- Busca, URLs e filtros antigos recebem compatibilidade explícita durante a migração.

## Decisões rejeitadas

- Criar novos status para representar categorias operacionais.
- Tratar todo status diferente de `Encerrado` como uma única categoria acionável.
- Remover `Tramitado` da carteira após o encaminhamento externo.
