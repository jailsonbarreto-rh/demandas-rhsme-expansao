# Governança técnica e preparação da migração legada

## Objetivo

Integrar ao SITE CTRH controles permanentes de qualidade e uma ferramenta administrativa capaz de transformar exportações paginadas do sistema legado em um lote validado, auditável e compatível com a RPC de importação já existente no Supabase.

## Escopo

A entrega inclui:

1. ESLint com regras de TypeScript, React Hooks e acessibilidade;
2. cobertura de testes com V8 e linha de base mínima no CI;
3. verificação de assinaturas e proveniência npm;
4. Dependabot para npm e GitHub Actions;
5. conversor de arquivos legados `.csv` e `.xlsx`;
6. consolidação de vários arquivos de 50 registros;
7. correção conservadora de texto UTF-8 interpretado como Windows-1252;
8. normalização de status e inferência segura do tipo pelo número;
9. detecção de duplicidades e campos impeditivos;
10. geração de `payload.json`, manifesto de hashes, relatório CSV e relatório Excel;
11. cliente de dry-run que usa a RPC `importar_sme_demandas_lote` sem gravar dados.

## Arquitetura

A migração permanece fora da aplicação web. Os scripts são executados administrativamente em Node.js 24, evitando expor a chave secreta no navegador e impedindo que usuários comuns executem cargas. A preparação é determinística: as mesmas fontes e opções produzem o mesmo payload e os mesmos hashes.

A ferramenta divide o processo em duas etapas:

- **Preparação local:** lê, corrige, normaliza, valida e produz artefatos para revisão;
- **Dry-run remoto:** envia o lote ao Supabase com `p_apply = false` e grava o recibo da validação do servidor.

A aplicação definitiva não será automatizada nesta entrega. Ela continuará exigindo uma decisão explícita posterior, após conferência do relatório e do recibo de dry-run.

## Regras de transformação

- `Número`, `Assunto`, `Responsável`, `Status` e `Setor` são campos obrigatórios para um registro pronto;
- status são normalizados apenas quando há correspondência inequívoca;
- `Tipo` é inferido a partir do padrão do número e registrado no relatório;
- `Classificação` recebe o valor padrão informado na execução, com `Outros` como padrão conservador;
- datas vazias permanecem vazias;
- datas inválidas bloqueiam apenas o registro afetado;
- números duplicados são comparados também após remoção de pontuação e conversão para maiúsculas;
- nenhuma linha inválida é silenciosamente descartada;
- o texto original é preservado nos relatórios de pendência.

## Artefatos gerados

- `payload.json`: registros aptos para a RPC;
- `manifest.json`: fontes, hashes, contagens, opções e hash do payload;
- `issues.csv`: pendências e advertências por arquivo e linha;
- `relatorio-migracao.xlsx`: resumo gerencial, registros prontos e pendências;
- `dry-run-receipt.json`: resposta do Supabase, quando executado o dry-run.

## Segurança

- a chave `SUPABASE_SECRET_KEY` somente é aceita no processo Node.js;
- a chave nunca é incluída nos arquivos gerados;
- o dry-run usa `p_apply = false`;
- o script recusa chave ausente e ator administrativo ausente;
- o diretório padrão de saída deve permanecer ignorado pelo Git;
- os arquivos reais de migração não serão adicionados ao repositório.

## Testes e aceitação

A entrega é aceita quando:

- o lint não apresenta erros ou advertências;
- a cobertura respeita os limites definidos;
- os testes demonstram falha antes da implementação e passam depois;
- um CSV representativo com caracteres quebrados é corrigido;
- vários arquivos são consolidados sem duplicar números;
- linhas incompletas aparecem como pendência e não entram no payload;
- o XLSX de uma coluna contendo linhas CSV é reconhecido;
- o cliente de dry-run monta os parâmetros corretos sem executar escrita;
- `npm run check:full` permanece aprovado.
