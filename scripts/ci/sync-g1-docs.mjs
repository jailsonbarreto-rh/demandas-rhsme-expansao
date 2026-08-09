import { readFileSync, writeFileSync } from 'node:fs';

const tick = '`';

function replaceOnce(content, needle, replacement, label) {
  const first = content.indexOf(needle);
  if (first < 0) {
    if (content.includes(replacement)) return content;
    throw new Error(`Âncora não encontrada: ${label}`);
  }
  if (content.indexOf(needle, first + needle.length) >= 0) {
    throw new Error(`Âncora duplicada: ${label}`);
  }
  return content.slice(0, first) + replacement + content.slice(first + needle.length);
}

function syncHandoff() {
  const file = 'docs/HANDOFF.md';
  let content = readFileSync(file, 'utf8');

  content = replaceOnce(
    content,
    'Atualizado em: **9 de agosto de 2026 — correção transitiva de segurança tratada no PR #149; G1 TanStack Query permanece isolado no PR #148**',
    'Atualizado em: **9 de agosto de 2026 — PRs #149 e #150 concluídos; G1 TanStack Query validado no PR #151**',
    'data do Handoff',
  );

  content = replaceOnce(
    content,
    `| Atividade técnica atual | correção emergencial do ${tick}GHSA-rgw5-rvv9-x895${tick} tratada no PR #149, sem mudança funcional, de banco ou Production |\n| Próxima atualização candidata | concluir a correção transitiva; retomar o G1 TanStack Query no PR #148; depois seguir com a fundação do Trilho B e o estudo separado de observabilidade |`,
    `| Atividade técnica atual | G1 TanStack Query validado no PR #151; lint oficial, Devtools somente em desenvolvimento e gates de bundle ampliados |\n| Próxima atualização candidata | fundação B1 do Trilho B; depois observabilidade com minimização de dados em pacote próprio |`,
    'estado técnico atual',
  );

  const heading = '## G1 — Ferramental TanStack Query — 9 de agosto de 2026';
  if (!content.includes(heading)) {
    const section = `${heading}\n\nO PR #150 corrigiu antes do G1 uma fragilidade de infraestrutura: uploads de artifacts diagnósticos podiam bloquear os gates reais quando a cota do GitHub Actions estivesse indisponível. Os uploads agora ocorrem somente em falha, são não bloqueantes e têm retenção de três dias; audit, assinaturas, lint, cobertura, build, bundle, Playwright e replay do Supabase continuam obrigatórios.\n\nO PR #151 adiciona ${tick}@tanstack/eslint-plugin-query@5.101.4${tick} com a configuração oficial ${tick}flat/recommended${tick} e ${tick}@tanstack/react-query-devtools@5.101.4${tick} somente em desenvolvimento. Nenhuma regra do plugin foi desabilitada. A primeira execução detectou uma dependência instável real no callback de recarga de ${tick}useDemandasData${tick}; a correção passou a depender diretamente da referência estável ${tick}refetch${tick}, sem alterar cache, retries, Realtime ou comportamento funcional.\n\nOs Devtools ficam isolados em ${tick}src/dev/QueryDevtools.tsx${tick}, carregados dinamicamente apenas quando ${tick}import.meta.env.DEV${tick} é verdadeiro. O gate ${tick}check:dev-only-tools${tick} usa sentinela exclusiva e comprovou que o módulo não aparece no build de produção. O workflow principal passou a executar também ${tick}check:public-bundle${tick} e ${tick}check:dev-only-tools${tick}.\n\nO lockfile foi regenerado oficialmente pelo npm em Node 24. A validação do PR #151 aprovou instalação exata, documentação, zero vulnerabilidades, assinaturas, lint, cobertura, build, orçamento de bundle, inspeção pública, exclusão dos Devtools e Playwright desktop/mobile.\n\nA atualização de ${tick}supabase/setup-cli${tick} para v3 permanece adiada: o CI mantém a versão do CLI já validada e não fará downgrade nem adotará beta apenas para trocar a Action.\n\nEvidências: ${tick}docs/superpowers/plans/2026-08-09-g1-query-tooling-supabase.md${tick} e ${tick}docs/maintenance/G1_QUERY_TOOLING_2026-08-09.md${tick}.\n\n`;
    content = replaceOnce(
      content,
      '## Regra permanente de modernização proativa\n',
      `${section}## Regra permanente de modernização proativa\n`,
      'seção de modernização',
    );
  }

  const nextStageStart = content.indexOf('## Próxima etapa\n');
  const docsStart = content.indexOf('## Documentação vigente\n');
  if (nextStageStart < 0 || docsStart < 0 || docsStart <= nextStageStart) {
    throw new Error('Bloco Próxima etapa/Documentação vigente não encontrado');
  }
  const nextStage = `## Próxima etapa\n\nCom a correção transitiva do PR #149, a resiliência de CI do PR #150 e o G1 do PR #151 validados, a próxima frente autorizada é retomar o Trilho B pela fundação B1, em branch e PR próprios, sem carregar os 3.201 documentos reais em Production.\n\nO B1 permanece limitado à fundação privada de preservação, constraints, RLS/grants, imutabilidade e testes sintéticos. O pacote de qualidade da migração poderá adotar fast-check e pgTAP conforme o desenho aprovado; json-canonicalize entra no B2, quando os hashes reais forem implementados.\n\nObservabilidade de erros permanece próxima modernização geral de alto valor, mas deve ter desenho próprio de privacidade e minimização de dados antes de qualquer SDK. Lighthouse CI, MSW e CodeQL continuam separados por causa, risco e rollback. ESLint 10, TypeScript 7 e Supabase Action v3 continuam sem adoção automática.\n\nNenhuma extensão funcional do R5 avançado, R1 residual, R2 ou ciclos posteriores é autorizada por inferência. E2, segurança final e homologação consolidada do R12 permanecem gates antes da entrega final do produto.\n\n`;
  content = content.slice(0, nextStageStart) + nextStage + content.slice(docsStart);

  content = replaceOnce(
    content,
    `26. ${tick}docs/maintenance/BRACE_EXPANSION_SECURITY_2026-08-09.md${tick};\n27. este Handoff.`,
    `26. ${tick}docs/maintenance/BRACE_EXPANSION_SECURITY_2026-08-09.md${tick};\n27. ${tick}docs/maintenance/CI_ARTIFACT_RESILIENCE_2026-08-09.md${tick};\n28. ${tick}docs/superpowers/plans/2026-08-09-g1-query-tooling-supabase.md${tick};\n29. ${tick}docs/maintenance/G1_QUERY_TOOLING_2026-08-09.md${tick};\n30. este Handoff.`,
    'índice documental',
  );

  writeFileSync(file, content);
}

function syncMaintenancePlan() {
  const file = 'docs/execution/PLANO_CONSOLIDADO_MANUTENCAO_MODERNIZACAO_CTRH_v1.1.md';
  let content = readFileSync(file, 'utf8');

  const heading = '## 7.2 Resiliência de CI e G1 TanStack Query — 9 de agosto de 2026';
  if (!content.includes(heading)) {
    const section = `${heading}\n\nO PR #150 tornou artifacts diagnósticos independentes dos gates reais: uploads ocorrem somente em falha, são não bloqueantes e usam retenção curta. O workflow geral e o gate Supabase comprovaram execução integral sem depender da cota de armazenamento de artifacts.\n\nO PR #151 adiciona ${tick}@tanstack/eslint-plugin-query@5.101.4${tick} e ${tick}@tanstack/react-query-devtools@5.101.4${tick} como dependências de desenvolvimento. O plugin usa ${tick}flat/recommended${tick} sem supressões; a violação real encontrada em ${tick}useDemandasData${tick} foi corrigida pela dependência direta de ${tick}refetch${tick}.\n\nOs Devtools são carregados somente em desenvolvimento e o novo ${tick}check:dev-only-tools${tick} comprova sua ausência do bundle de produção. O workflow principal também passa a executar explicitamente ${tick}check:public-bundle${tick}. O pacote não altera banco, migrations, RLS, dados, política de cache, Realtime, autenticação ou Production.\n\nA Action Supabase v3 permanece condicionada à disponibilidade estável via npm de versão igual ou superior à já validada no CI. Observabilidade, Lighthouse CI, MSW, CodeQL e o ferramental específico do Trilho B permanecem pacotes independentes.\n\n`;
    content = replaceOnce(
      content,
      '## 8. Oportunidades funcionais condicionadas\n',
      `${section}## 8. Oportunidades funcionais condicionadas\n`,
      'seção de oportunidades',
    );
  }

  writeFileSync(file, content);
}

syncHandoff();
syncMaintenancePlan();
