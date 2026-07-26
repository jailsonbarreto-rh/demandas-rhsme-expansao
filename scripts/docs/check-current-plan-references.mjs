import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

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

const CURRENT_GUIDANCE = [
  'AGENTS.md',
  'README.md',
  PATHS.adendo,
  PATHS.protocol,
  PATHS.decisions,
  PATHS.policy,
  PATHS.product,
  PATHS.handoff,
  PATHS.history,
  PATHS.supabase,
];

const CURRENT_CONTENT = [
  ...CURRENT_GUIDANCE,
  PATHS.strategy,
  PATHS.execution,
];

const HISTORICAL_DOCUMENTS = [
  PATHS.oldPlan,
  PATHS.oldAdendo,
  PATHS.oldProtocol,
  PATHS.oldPolicy,
];

const REQUIRED_READ_ORDER = [
  PATHS.adendo,
  PATHS.protocol,
  PATHS.decisions,
  PATHS.policy,
  PATHS.product,
  PATHS.strategy,
  PATHS.execution,
  PATHS.handoff,
];

const EXPECTED_PLAN_ROLES = new Map([
  ['strategy_general', PATHS.strategy],
  ['track_a_execution', PATHS.execution],
]);

const WRONG_SUPABASE_REF = 'kdhekkzwcokfrsllr';
const OLD_PLAN_PATTERN =
  /Plano_Remanescente_Execucao_CTRH_v2\.1|Plano Remanescente v2\.1/iu;
const HISTORICAL_CONTEXT_PATTERN =
  /históric|superad|substitu|pré-reconcilia|retirad.{0,30}(cadeia|execução)|não.{0,20}vigente/iu;

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function readUtf8(root, path) {
  const absolutePath = resolve(root, path);
  if (!(await exists(absolutePath))) {
    return null;
  }

  return readFile(absolutePath, 'utf8');
}

function addDiagnostic(diagnostics, code, file, message) {
  diagnostics.push({ code, file, message });
}

function extractPlanRoles(content) {
  const roles = new Map();
  const marker =
    /<!--\s*CURRENT_PLAN_ROLE:\s*([a-z_]+)=([^\s>]+)\s*-->/giu;

  for (const match of content.matchAll(marker)) {
    const [, role, path] = match;
    const values = roles.get(role) ?? [];
    values.push(path);
    roles.set(role, values);
  }

  return roles;
}

function extractAuthorization(content) {
  const match = content.match(
    /<!--\s*IMPLEMENTATION_AUTHORIZATION:\s*([A-Za-z0-9_-]+)\s*-->/iu,
  );
  return match?.[1]?.toLowerCase() ?? null;
}

function approvedOpDecisions(content) {
  const approved = new Set();

  for (const section of content.split(/(?=^###\s+OP-D\d{2}\b)/gimu)) {
    const id = section.match(/^###\s+(OP-D\d{2})\b/imu)?.[1]?.toUpperCase();
    if (id && /\*\*Decisão:\*\*\s*APROVADA/iu.test(section)) {
      approved.add(id);
    }
  }

  for (const line of content.split(/\r?\n/u)) {
    const ids = [...line.matchAll(/\bOP-D\d{2}\b/giu)].map((match) =>
      match[0].toUpperCase(),
    );
    if (ids.length === 0) {
      continue;
    }

    for (const id of ids) {
      const directApproval = new RegExp(
        `${id}\\s*(?:—|:|\\|)\\s*(?:decisão\\s*)?APROVAD[AO]`,
        'iu',
      );
      const verbalApproval = new RegExp(
        `${id}.{0,30}\\b(?:FOI|ESTÁ)\\s+APROVAD[AO]`,
        'iu',
      );
      if (directApproval.test(line) || verbalApproval.test(line)) {
        approved.add(id);
      }
    }
  }

  return approved;
}

function registeredApprovedOpDecisions(content) {
  const approved = new Set();
  const sections = content.split(/(?=^###\s+)/gmu);

  for (const section of sections) {
    const id = section.match(/^###\s+(OP-D\d{2})\b/imu)?.[1]?.toUpperCase();
    if (id && /\*\*Decisão:\*\*\s*APROVADA/iu.test(section)) {
      approved.add(id);
    }
  }

  return approved;
}

export async function auditCurrentPlanReferences(rootDirectory = process.cwd()) {
  const root = resolve(rootDirectory);
  const diagnostics = [];
  const contents = new Map();

  for (const path of new Set([...CURRENT_CONTENT, ...HISTORICAL_DOCUMENTS])) {
    contents.set(path, await readUtf8(root, path));
  }

  for (const canonicalPlan of [PATHS.strategy, PATHS.execution]) {
    if (contents.get(canonicalPlan) === null) {
      addDiagnostic(
        diagnostics,
        'DOC001',
        canonicalPlan,
        'Plano canônico obrigatório ausente.',
      );
    }
  }

  for (const path of CURRENT_GUIDANCE) {
    const content = contents.get(path);
    if (content === null) {
      continue;
    }

    let insideHistoricalSection = false;
    for (const [index, line] of content.split(/\r?\n/u).entries()) {
      if (path === PATHS.history && /^##\s+Documentos históricos/iu.test(line)) {
        insideHistoricalSection = true;
      } else if (
        path === PATHS.history &&
        /^##\s+/u.test(line) &&
        !/^##\s+Documentos históricos/iu.test(line)
      ) {
        insideHistoricalSection = false;
      }

      if (
        OLD_PLAN_PATTERN.test(line) &&
        !HISTORICAL_CONTEXT_PATTERN.test(line) &&
        !insideHistoricalSection
      ) {
        addDiagnostic(
          diagnostics,
          'DOC002',
          `${path}:${index + 1}`,
          'Plano Remanescente v2.1 aparece como orientação atual sem contexto histórico.',
        );
      }
    }
  }

  const historyContent = contents.get(PATHS.history) ?? '';
  const roles = extractPlanRoles(historyContent);
  for (const [role, expectedPath] of EXPECTED_PLAN_ROLES) {
    const paths = roles.get(role) ?? [];
    if (paths.length !== 1 || paths[0] !== expectedPath) {
      addDiagnostic(
        diagnostics,
        'DOC003',
        PATHS.history,
        `O papel ${role} deve possuir exatamente um plano vigente: ${expectedPath}.`,
      );
    }
  }

  const agentsContent = contents.get('AGENTS.md') ?? '';
  const readOrderPositions = REQUIRED_READ_ORDER.map((path) =>
    agentsContent.indexOf(path),
  );
  const missingReadOrderPath = readOrderPositions.some(
    (position) => position === -1,
  );
  const orderIsAscending = readOrderPositions.every(
    (position, index) => index === 0 || position > readOrderPositions[index - 1],
  );
  if (missingReadOrderPath || !orderIsAscending) {
    addDiagnostic(
      diagnostics,
      'DOC004',
      'AGENTS.md',
      'A ordem obrigatória de leitura não corresponde à hierarquia canônica v3.1/v1.2.',
    );
  }

  for (const path of CURRENT_GUIDANCE) {
    const content = contents.get(path);
    if (content?.includes(WRONG_SUPABASE_REF)) {
      addDiagnostic(
        diagnostics,
        'DOC005',
        path,
        `Documento vigente contém a ref incorreta ${WRONG_SUPABASE_REF}.`,
      );
    }
  }

  const handoffContent = contents.get(PATHS.handoff) ?? '';
  const decisionsContent = contents.get(PATHS.decisions) ?? '';
  const handoffAuthorization = extractAuthorization(handoffContent);
  const registryAuthorization = extractAuthorization(decisionsContent);
  const authorizationRow = handoffContent.match(
    /\|\s*Implementação funcional autorizada\s*\|\s*([^|]+)\|/iu,
  )?.[1];
  const rowSaysNone =
    authorizationRow !== undefined &&
    /\b(nenhum[ao]?|não autorizada)\b/iu.test(authorizationRow);
  const markersDisagree =
    handoffAuthorization === null ||
    registryAuthorization === null ||
    handoffAuthorization !== registryAuthorization;
  const noneMarkerDisagreesWithRow =
    handoffAuthorization === 'none' && !rowSaysNone;
  const activeMarkerMissingFromRow =
    handoffAuthorization !== null &&
    handoffAuthorization !== 'none' &&
    !authorizationRow?.toLowerCase().includes(handoffAuthorization);

  if (
    markersDisagree ||
    noneMarkerDisagreesWithRow ||
    activeMarkerMissingFromRow
  ) {
    addDiagnostic(
      diagnostics,
      'DOC006',
      PATHS.handoff,
      'A autorização de implementação do Handoff não corresponde ao Registro de Decisões.',
    );
  }

  const approvedInCurrentDocuments = new Set();
  for (const path of CURRENT_CONTENT) {
    const content = contents.get(path);
    if (content === null) {
      continue;
    }
    for (const id of approvedOpDecisions(content)) {
      approvedInCurrentDocuments.add(id);
    }
  }
  const approvedInRegistry = registeredApprovedOpDecisions(decisionsContent);
  for (const id of approvedInCurrentDocuments) {
    if (!approvedInRegistry.has(id)) {
      addDiagnostic(
        diagnostics,
        'DOC007',
        'documentação vigente',
        `${id} aparece como aprovada sem entrada aprovada correspondente no Registro de Decisões.`,
      );
    }
  }

  for (const path of HISTORICAL_DOCUMENTS) {
    const content = contents.get(path);
    const header = content?.split(/\r?\n/u).slice(0, 4).join('\n') ?? '';
    if (!/Status documental:\*\*\s*HISTÓRICO/iu.test(header)) {
      addDiagnostic(
        diagnostics,
        'DOC008',
        path,
        'Documento histórico não possui nota inicial inequívoca de status HISTÓRICO.',
      );
    }
  }

  return diagnostics;
}

export function formatDiagnostics(diagnostics) {
  return diagnostics
    .map(
      ({ code, file, message }) =>
        `[${code}] ${file}: ${message}`,
    )
    .join('\n');
}

async function main() {
  const root = process.argv[2] ?? process.cwd();
  const diagnostics = await auditCurrentPlanReferences(root);

  if (diagnostics.length > 0) {
    process.stderr.write(`${formatDiagnostics(diagnostics)}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(
    'Documentação canônica coerente: estratégia v3.1, Trilho A v1.2 e governança sincronizada.\n',
  );
}

const isCli =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isCli) {
  await main();
}
