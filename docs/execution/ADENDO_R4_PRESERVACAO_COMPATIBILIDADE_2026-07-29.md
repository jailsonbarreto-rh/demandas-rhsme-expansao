# Adendo R4 — Preservação e compatibilidade final

**Data:** 29 de julho de 2026  
**Branch:** `feat/r4-prazos-providencias`  
**PR:** `#103`  
**Situação:** complemento do candidato, ainda não homologado

Este adendo complementa o Handoff e a atualização executiva do R4. As migrations listadas abaixo formam uma cadeia única e devem ser lidas em ordem cronológica.

## Cadeia completa de migrations do R4

1. `20260730023000_r4_deadlines_and_follow_up_rules.sql`
   - cria helpers e quatro RPCs completas;
   - aplica regras de cadastro, edição, movimentação e próxima providência vencida;
   - grava histórico estruturado.

2. `20260730023100_r4_deadline_consistency_constraints.sql`
   - substitui constraints antigas incompatíveis com a decisão de `Não se aplica` sem justificativa inicial;
   - representa uma etapa intermediária da cadeia.

3. `20260730023200_r4_preserve_legacy_deadline_metadata.sql`
   - preserva justificativas históricas quando o prazo não muda;
   - limpa metadado obsoleto apenas quando data ou estado são efetivamente alterados;
   - permite preservar estado excepcional vindo do legado.

4. `20260730023300_r4_final_deadline_state_constraints.sql`
   - estabelece a forma final das constraints;
   - valida apenas coerência entre estado e data;
   - não usa justificativa histórica legada como bloqueio estrutural;
   - permanece `NOT VALID` para não reclassificar o legado, mas vale para novas escritas.

5. `20260730023400_r4_optional_reason_compatibility.sql`
   - cria sobrecargas aditivas para consumidores que ainda não enviem o novo campo de justificativa;
   - delega às RPCs completas com valor vazio;
   - não enfraquece a regra: data vencida continua rejeitada pelas funções completas sem justificativa suficiente.

## Regra final de preservação

- nova operação não cria prazo interno `Não se aplica`;
- nova operação não grava justificativa inicial para prazo final `Não se aplica`;
- eventual estado ou justificativa histórica já existente continua legível;
- edição não relacionada não apaga nem bloqueia metadado legado;
- quando o prazo muda conscientemente, metadado antigo que se tornaria obsoleto é limpo;
- o motivo da nova alteração fica no evento histórico auditável.

## Efeito nos documentos anteriores

Quando o Handoff ou o Plano Executivo mencionarem apenas as migrations `23000` e `23100`, esta lista de cinco arquivos prevalece como fotografia mais recente do candidato.

Nenhuma dessas migrations foi aplicada ao Supabase remoto. A cadeia somente poderá ser publicada após replay integral, invariantes SQL, testes de aplicação e homologação do mesmo SHA.
