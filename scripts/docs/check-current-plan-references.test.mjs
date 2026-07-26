import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const runner = process.env.VITEST
  ? await import('vitest')
  : await import('node:test');
const { afterEach, test } = runner;

const SCRIPT_PATH = resolve(
  process.cwd(),
  'scripts/docs/check-current-plan-references.mjs',
);
const fixtureRoots = new Set();

const PATHS = {
  adendo: 'docs/execution/ADENDO_GOVERNANCA_POR_ETAPA_CTRH_v2.0.4.md',
  protocol:
    'docs/product/PROTOCOLO_HOMOLOGACAO_DECISOES_PRODUTO_CTRH_v1.3.md',
  decisions: 'docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md',
  policy: 'docs/product/POLITICA_SINCRONIZACAO_DOCUMENTAL_CTRH_v1.1.md',
  product: 'docs/PRODUCT_CONTEXT.md',
  strategy: 'docs/execution/Plano_Integrado_Reformulado_CTRH_v3.1.md',
  execution: 'docs/execution/Plano_Executivo_Operacao_Atual_CTRH_v1.2.md',
  handoff: 'docs/HANDOFF.md',
  history: 'docs/execution/HISTORICO_DOCUMENTAL_CTRH.md',
  supabase: 'docs/SUPABASE_SETUP.md',
  oldPlan: 'docs/execution/Plano_Remanescente_Execucao_CTRH_v2.1.md',
  oldAdendo: 'docs/execution/ADENDO_GOVERNANCA_POR_ETAPA_CTRH_v2.0.3.md',
  oldProtocol:
    'docs/product/PROTOCOLO_HOMOLOGACAO_DECISOES_PRODUTO_CTRH_v1.2.md',
  oldPolicy: 'docs/product/POLITICA_SINCRONIZACAO_DOCUMENTAL_CTRH_v1.0.md',
};

const REQUIRED_ORDER = [
  PATHS.adendo,
  PATHS.protocol,
  PATHS.decisions,
  PATHS.policy,
  PATHS.product,
  PATHS.strategy,
  PATHS.execution,
  PATHS.handoff,
];

async function write(root, path, content) {
  const target = join(root, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content, 'utf8');
}

afterEach(async () => {
  await Promise.all(
    [...fixtureRoots].map((root) => rm(root, { recursive: true, force: true })),
  );
  fixtureRoots.clear();
});

async function createValidFixture() {
  const root = await mkdtemp(join(tmpdir(), 'ctrh-doc-gate-'));
  fixtureRoots.add(root);

  await write(
    root,
    'AGENTS.md',
    [
      '# Instruções',
      '## Leitura obrigatória',
      ...REQUIRED_ORDER.map((path, index) => `${index + 1}. \`${path}\`;`),
      'O Plano Remanescente v2.1 é histórico e foi superado para execução futura.',
    ].join('\n'),
  );

  await write(
    root,
    'README.md',
    [
      '# CTRH',
      `Estratégia geral: \`${PATHS.strategy}\`.`,
      `Trilho A: \`${PATHS.execution}\`.`,
      'O Plano Remanescente v2.1 é histórico.',
    ].join('\n'),
  );

  await write(
    root,
    PATHS.product,
    [
      '# Contexto',
      `Estratégia geral: \`${PATHS.strategy}\`.`,
      `Execução do Trilho A: \`${PATHS.execution}\`.`,
      'Supabase: `kdhekkzwcokfrpcrsllr`.',
      'Nenhuma decisão OP-Dxx foi aprovada automaticamente.',
    ].join('\n'),
  );

  await write(
    root,
    PATHS.handoff,
    [
      '# Handoff',
      '<!-- IMPLEMENTATION_AUTHORIZATION: none -->',
      '| Implementação funcional autorizada | Nenhuma |',
      `| Estratégia geral | \`${PATHS.strategy}\` |`,
      `| Trilho A | \`${PATHS.execution}\` |`,
      'Supabase: `kdhekkzwcokfrpcrsllr`.',
    ].join('\n'),
  );

  await write(
    root,
    PATHS.decisions,
    [
      '# Registro de decisões',
      '<!-- IMPLEMENTATION_AUTHORIZATION: none -->',
      'A nova cadeia documental foi aprovada.',
      'Nenhuma decisão OP-Dxx foi aprovada automaticamente.',
    ].join('\n'),
  );

  await write(
    root,
    PATHS.supabase,
    [
      '# Supabase',
      'Projeto `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`.',
      `Estratégia: \`${PATHS.strategy}\`.`,
      `Trilho A: \`${PATHS.execution}\`.`,
    ].join('\n'),
  );

  await write(
    root,
    PATHS.adendo,
    [
      '# Adendo',
      '**Status documental:** VIGENTE',
      `Estratégia: \`${PATHS.strategy}\`.`,
      `Trilho A: \`${PATHS.execution}\`.`,
    ].join('\n'),
  );
  await write(
    root,
    PATHS.protocol,
    [
      '# Protocolo',
      '**Status documental:** VIGENTE',
      `Estratégia: \`${PATHS.strategy}\`.`,
      `Trilho A: \`${PATHS.execution}\`.`,
    ].join('\n'),
  );
  await write(
    root,
    PATHS.policy,
    [
      '# Política',
      '**Status documental:** VIGENTE',
      `Estratégia: \`${PATHS.strategy}\`.`,
      `Trilho A: \`${PATHS.execution}\`.`,
    ].join('\n'),
  );

  await write(root, PATHS.strategy, '# Plano Integrado v3.1\n');
  await write(root, PATHS.execution, '# Plano Executivo v1.2\n');

  await write(
    root,
    PATHS.history,
    [
      '# Histórico documental',
      `<!-- CURRENT_PLAN_ROLE: strategy_general=${PATHS.strategy} -->`,
      `<!-- CURRENT_PLAN_ROLE: track_a_execution=${PATHS.execution} -->`,
      '## Documentos vigentes',
      `- \`${PATHS.strategy}\`;`,
      `- \`${PATHS.execution}\`.`,
      '## Documentos históricos',
      `- \`${PATHS.oldPlan}\`;`,
      `- \`${PATHS.oldAdendo}\`;`,
      `- \`${PATHS.oldProtocol}\`;`,
      `- \`${PATHS.oldPolicy}\`.`,
    ].join('\n'),
  );

  for (const historicalPath of [
    PATHS.oldPlan,
    PATHS.oldAdendo,
    PATHS.oldProtocol,
    PATHS.oldPolicy,
  ]) {
    await write(
      root,
      historicalPath,
      [
        '> **Nota de superação:** documento preservado como histórico.',
        '**Status documental:** HISTÓRICO',
        '# Conteúdo original',
      ].join('\n'),
    );
  }

  return root;
}

function runAudit(root) {
  return spawnSync(process.execPath, [SCRIPT_PATH, root], {
    encoding: 'utf8',
    windowsHide: true,
  });
}

function diagnostics(result) {
  return `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
}

function expectFailure(result, code) {
  assert.notEqual(result.status, 0, diagnostics(result));
  assert.match(diagnostics(result), new RegExp(`\\[${code}\\]`));
}

test('accepts one coherent canonical documentation chain', async () => {
  const root = await createValidFixture();
  const result = runAudit(root);

  assert.equal(result.status, 0, diagnostics(result));
  assert.match(result.stdout, /Documentação canônica coerente/);
});

test('DOC001 detects missing canonical plans', async () => {
  const root = await createValidFixture();
  await rm(join(root, PATHS.strategy));
  await rm(join(root, PATHS.execution));

  expectFailure(runAudit(root), 'DOC001');
});

test('DOC002 detects the remnant plan as current authority', async () => {
  const root = await createValidFixture();
  await write(
    root,
    'README.md',
    '# CTRH\nPlano vigente: `docs/execution/Plano_Remanescente_Execucao_CTRH_v2.1.md`.\n',
  );

  expectFailure(runAudit(root), 'DOC002');
});

test('DOC003 detects duplicate current plans for one role', async () => {
  const root = await createValidFixture();
  const duplicate =
    '<!-- CURRENT_PLAN_ROLE: strategy_general=docs/execution/Outro_Plano_vigente.md -->';
  await write(
    root,
    PATHS.history,
    [
      '# Histórico documental',
      `<!-- CURRENT_PLAN_ROLE: strategy_general=${PATHS.strategy} -->`,
      duplicate,
      `<!-- CURRENT_PLAN_ROLE: track_a_execution=${PATHS.execution} -->`,
    ].join('\n'),
  );

  expectFailure(runAudit(root), 'DOC003');
});

test('DOC004 detects a read order that inverts strategy and execution', async () => {
  const root = await createValidFixture();
  const inverted = [...REQUIRED_ORDER];
  [inverted[5], inverted[6]] = [inverted[6], inverted[5]];
  await write(
    root,
    'AGENTS.md',
    [
      '# Instruções',
      '## Leitura obrigatória',
      ...inverted.map((path, index) => `${index + 1}. \`${path}\`;`),
      'O Plano Remanescente v2.1 é histórico.',
    ].join('\n'),
  );

  expectFailure(runAudit(root), 'DOC004');
});

test('DOC005 detects the incorrect Supabase project ref in a current document', async () => {
  const root = await createValidFixture();
  await write(
    root,
    PATHS.product,
    '# Contexto\nSupabase vigente: `kdhekkzwcokfrsllr`.\n',
  );

  expectFailure(runAudit(root), 'DOC005');
});

test('DOC006 detects an implementation authorization absent from the decision register', async () => {
  const root = await createValidFixture();
  await write(
    root,
    PATHS.handoff,
    [
      '# Handoff',
      '<!-- IMPLEMENTATION_AUTHORIZATION: R1 -->',
      '| Implementação funcional autorizada | R1 |',
      'Supabase: `kdhekkzwcokfrpcrsllr`.',
    ].join('\n'),
  );

  expectFailure(runAudit(root), 'DOC006');
});

test('DOC007 detects an OP-D decision shown as approved without a registry entry', async () => {
  const root = await createValidFixture();
  await write(
    root,
    PATHS.product,
    '# Contexto\nOP-D01 — APROVADA.\nSupabase: `kdhekkzwcokfrpcrsllr`.\n',
  );

  expectFailure(runAudit(root), 'DOC007');
});

test('DOC008 detects a historical document presented as current', async () => {
  const root = await createValidFixture();
  await write(
    root,
    PATHS.oldPlan,
    '# Plano Remanescente v2.1\n**Status documental:** VIGENTE\n',
  );

  expectFailure(runAudit(root), 'DOC008');
});
