# Migração dos dados do sistema legado

> **Situação em 3 de setembro de 2026:** este procedimento é **histórico e não está autorizado para a próxima carga real**. O pré-flight B1 confirmou incompatibilidades entre este fluxo e o contrato de recepção preservativa atualmente recomendado: o normalizador pode inferir tipo e aplicar valores padrão, e a RPC antiga promove diretamente para `sme_demandas`. Consulte `docs/execution/B1_PREIMPLEMENTACAO_CTRH_2026-09-03.md`. Não execute estes comandos com fontes reais nem contra Production até aprovação das decisões B1 e substituição/adequação do caminho técnico.

Historicamente, este procedimento preparava exportações CSV ou XLSX do sistema legado para a importação atômica existente no Supabase do SITE CTRH. Ele permanece documentado para rastreabilidade e testes históricos, não como contrato vigente de recepção B1/B2.

A ferramenta foi desenhada para o cenário atual, no qual o sistema legado exporta somente os 50 registros exibidos em cada página. Vários arquivos podem ser informados de uma vez; eles serão consolidados, normalizados e conferidos como um único lote.

## Princípios de segurança

- Os arquivos reais permanecem fora do Git.
- A chave secreta do Supabase é usada somente por um script administrativo em Node.js.
- A preparação local não acessa o banco.
- O comando remoto desta etapa executa somente `p_apply = false`.
- Nenhuma demanda é criada durante o dry-run.
- Linhas inválidas são registradas no relatório e não são descartadas silenciosamente.
- A aplicação definitiva do lote exige uma decisão posterior e explícita.

## 1. Preparar o ambiente

Instale exatamente as dependências fixadas no lockfile:

```bash
npm ci
```

Crie um diretório local para receber os arquivos baixados. Esse diretório já está ignorado pelo Git:

```text
migration-input/
├── demandas-pagina-001.csv
├── demandas-pagina-002.csv
├── demandas-pagina-003.csv
└── ...
```

Também é possível utilizar diretamente um arquivo `.xlsx`. A ferramenta reconhece tanto uma planilha tabular convencional quanto o formato observado no arquivo aberto pelo Excel, em que cada linha CSV ficou concentrada na coluna A.

## 2. Preservar os arquivos originais

Não corrija os textos manualmente e não substitua os arquivos baixados.

Guarde sempre:

- os arquivos originais;
- a ordem ou identificação das páginas;
- a data e a hora da extração;
- os filtros utilizados durante o download;
- a quantidade total de registros informada pelo sistema legado.

O programa calcula um hash SHA-256 para cada arquivo e outro para o conjunto das fontes. Isso permite comprovar exatamente quais arquivos deram origem ao lote.

## 3. Preparar a migração

### Usando um diretório inteiro

```bash
npm run migration:prepare -- migration-input/
```

### Informando arquivos individuais

```bash
npm run migration:prepare -- \
  migration-input/demandas-pagina-001.csv \
  migration-input/demandas-pagina-002.csv
```

### Usando o XLSX aberto no Excel

```bash
npm run migration:prepare -- "migration-input/demandas (1).xlsx"
```

### Definindo outro diretório de saída

```bash
npm run migration:prepare -- \
  --out .migration/carga-final \
  migration-input/
```

### Definindo valores padrão

O arquivo legado atual não possui uma coluna de classificação. Por isso, a ferramenta utiliza `Outros` por padrão e registra uma advertência em cada linha afetada.

```bash
npm run migration:prepare -- \
  --default-classificacao Outros \
  --default-setor E/CTRH \
  migration-input/
```

O setor padrão só é aplicado quando a linha não traz um setor. Não substitui valores existentes.

## 4. Transformações realizadas

A preparação:

1. lê CSV com vírgula, ponto e vírgula ou tabulação;
2. respeita aspas e vírgulas existentes dentro do assunto;
3. remove BOM quando presente;
4. tenta UTF-8 e, quando necessário, Windows-1252;
5. corrige de forma conservadora textos como `ResponsÃ¡vel` e `CessÃ£o`;
6. padroniza cabeçalhos;
7. consolida todos os arquivos em uma sequência única;
8. padroniza os status reconhecidos;
9. converte datas para o formato do PostgreSQL;
10. infere o tipo a partir do número quando a coluna não existe;
11. aplica a classificação padrão definida;
12. detecta números repetidos, inclusive após remoção de pontuação;
13. valida o formato do número conforme o contrato da RPC;
14. separa registros prontos de registros com pendências;
15. calcula hashes das fontes e do payload.

A inferência de tipo segue estes critérios:

- números de processo e identificadores com `-PRO-` recebem `Processo`;
- identificadores com `-OFI-`, `-MEM-` ou `-CAP-` recebem `Expediente`;
- os demais recebem `Outros`.

Toda inferência é registrada como advertência no relatório, para que possa ser revisada antes da importação.

## 5. Artefatos produzidos

Por padrão, os arquivos são gravados em `.migration/legacy/`:

```text
.migration/legacy/
├── payload.json
├── manifest.json
├── issues.csv
└── relatorio-migracao.xlsx
```

### `payload.json`

Contém somente os registros sem pendências impeditivas, no formato esperado pela RPC do Supabase.

### `manifest.json`

Contém:

- arquivos de origem;
- SHA-256 de cada arquivo;
- quantidade de linhas por arquivo;
- hash agregado das fontes;
- parâmetros utilizados;
- quantidades encontradas;
- hash do payload.

### `issues.csv`

Contém todas as advertências e erros, com:

- arquivo;
- linha original;
- campo;
- valor recebido;
- código da ocorrência;
- orientação.

### `relatorio-migracao.xlsx`

Possui três abas:

- **Resumo** — contagens e hashes;
- **Prontos** — registros aptos para o dry-run;
- **Pendências** — erros e advertências para saneamento.

## 6. Interpretar o resultado

A execução termina com um dos códigos:

| Código | Significado |
|---:|---|
| `0` | Preparação concluída sem pendências impeditivas |
| `2` | Artefatos gerados, mas existem registros que precisam de correção |
| `1` | Falha técnica ou entrada inválida |

O código `2` não significa perda de dados. Ele indica que os registros problemáticos foram preservados no relatório e precisam ser corrigidos ou decididos antes do dry-run.

## 7. Executar o dry-run no Supabase

O dry-run depende de três variáveis administrativas:

```text
SUPABASE_URL
SUPABASE_SECRET_KEY
MIGRATION_ACTOR_ID
```

`MIGRATION_ACTOR_ID` deve ser o UUID de um perfil ativo com nível `administrador` no SITE CTRH.

### Linux ou macOS

```bash
SUPABASE_URL="https://projeto.supabase.co" \
SUPABASE_SECRET_KEY="chave-secreta" \
MIGRATION_ACTOR_ID="uuid-do-administrador" \
npm run migration:dry-run -- --dir .migration/legacy
```

### Windows PowerShell

```powershell
$env:SUPABASE_URL="https://projeto.supabase.co"
$env:SUPABASE_SECRET_KEY="chave-secreta"
$env:MIGRATION_ACTOR_ID="uuid-do-administrador"
npm run migration:dry-run -- --dir .migration/legacy
```

O script:

- lê o payload e o manifesto;
- recusa manifestos com pendências impeditivas;
- valida os hashes e o UUID do administrador;
- chama `importar_sme_demandas_lote` com `p_apply = false`;
- grava `dry-run-receipt.json` no diretório da carga.

O recibo não contém a chave secreta.

## 8. O que o dry-run verifica no banco

A RPC verifica, entre outros pontos:

- formato do lote;
- quantidade esperada;
- tipos, status e classificações;
- campos obrigatórios;
- datas;
- ordem dos prazos;
- formato dos identificadores;
- duplicidades dentro do lote;
- colisões com demandas já existentes;
- fotografia atual das tabelas de demandas e histórico.

Se o dry-run for aprovado, o recibo apresenta o hash calculado pelo servidor, as quantidades atuais e as fotografias do banco. Esses valores serão necessários para uma aplicação definitiva posterior.

## 9. Conferência antes de uma carga definitiva

Antes de autorizar qualquer aplicação, compare:

- total de registros do sistema legado;
- total de linhas nos arquivos recebidos;
- total de registros prontos;
- total de pendências resolvidas;
- totais por status;
- totais por setor;
- amostras dos registros mais antigos e mais recentes;
- duplicidades com os dados que já existem no Supabase.

O sistema legado deve ficar sem alterações durante a extração final ou deve ser feita uma carga complementar das alterações ocorridas depois do primeiro corte.

## 10. Limites desta etapa

Esta ferramenta prepara e valida o estado atual das demandas. Ela não:

- migra usuários ou senhas;
- acessa diretamente o Firebase;
- importa anexos;
- reconstrói históricos que não estejam presentes nos arquivos recebidos;
- aplica o lote definitivamente;
- altera migrations, RLS ou permissões.

Quando o administrador do sistema legado fornecer uma extração integral, ela poderá ser processada pelo mesmo fluxo, desde que os campos sejam mapeados para o contrato documentado.
