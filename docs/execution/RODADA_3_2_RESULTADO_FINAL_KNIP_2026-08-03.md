# Rodada 3.2 — Resultado final do Knip

**Data:** 3 de agosto de 2026  
**PR:** #137  
**Comando:** `npm run analyze:unused`  
**Modo:** diagnóstico, sem autofix e fora do gate obrigatório

## Resultado

Após a redução de visibilidade dos dez símbolos usados apenas dentro dos próprios módulos, o diagnóstico passou de 18 para oito símbolos exportados sem consumidor externo.

### Valores e funções preservados

- `isLegacyDeadlineCompletion`;
- `canPreserveMissingDeadline`;
- `canUseDeadlineStateAfterRegistration`;
- `getPrazoFinalSemantics`.

### Tipos preservados

- `DatabaseR4`;
- `Json`;
- `DeadlineValue`;
- `PrazoSemantics`.

Os sete símbolos diferentes de `Json` permanecem sujeitos a revisão específica antes de qualquer remoção, porque alcançam prazos legados, apresentação temporal, tipos de domínio ou contratos Supabase.

`Json` permanece intencionalmente exportado como contrato tipado do banco.

O Knip não apontou:

- arquivo não utilizado;
- dependência não utilizada;
- dependência ausente ou não listada;
- import ou executável não resolvido;
- duplicidade de export;
- problema de configuração.

## Evidência

- workflow run: `30786287671`;
- job: `91600330319`;
- artefato: `rodada-3-2-diagnosticos`;
- artefato ID: `8845359334`;
- digest: `sha256:e1762fbe357d17d7fa4d6a942e4c87db4c71f7ee19463c153773c0fda66da9a9`;
- TypeScript 5.9.3: compilação aprovada;
- instalação reproduzível: aprovada;
- vulnerabilidades: zero.

## Decisão

A limpeza conservadora atingiu seu objetivo sem apagar código ou contratos. Nenhuma remoção adicional é autorizada nesta rodada.
