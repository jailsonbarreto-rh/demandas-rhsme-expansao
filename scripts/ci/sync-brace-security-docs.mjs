import { readFileSync, writeFileSync } from 'node:fs';

const tick = '`';

function replaceOnce(content, needle, replacement, label) {
  const first = content.indexOf(needle);
  if (first < 0) throw new Error(`Âncora não encontrada: ${label}`);
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
    'Atualizado em: **3 de agosto de 2026 — Rodada 5 concluída; pacotes compatíveis atualizados e ESLint 10 adiado por incompatibilidade oficial**',
    'Atualizado em: **9 de agosto de 2026 — correção transitiva de segurança tratada no PR #149; G1 TanStack Query permanece isolado no PR #148**',
    'data do Handoff',
  );

  content = replaceOnce(
    content,
    '| Atividade técnica atual | Rodada 5 encerrada; seis atualizações compatíveis integradas e validadas |\n| Próxima atualização candidata | estudo de observabilidade de erros; ESLint 10 aguarda suporte estável do JSX A11y; TypeScript 7 permanece adiado |',
    `| Atividade técnica atual | correção emergencial do ${tick}GHSA-rgw5-rvv9-x895${tick} tratada no PR #149, sem mudança funcional, de banco ou Production |\n| Próxima atualização candidata | concluir a correção transitiva; retomar o G1 TanStack Query no PR #148; depois seguir com a fundação do Trilho B e o estudo separado de observabilidade |`,
    'estado técnico atual',
  );

  const securitySection = `## Correção emergencial de segurança — 9 de agosto de 2026\n\nDurante o gate do pacote G1, o ${tick}npm audit --audit-level=high${tick} passou a reprovar a árvore já existente por ${tick}GHSA-rgw5-rvv9-x895${tick}, bypass de DoS em ${tick}brace-expansion${tick} que alcançou a versão ${tick}5.0.8${tick} anteriormente fixada por override global. O alerta não foi introduzido pelo G1.\n\nA investigação no PR #149 comprovou que um único override global é inadequado porque consumidores antigos e modernos de ${tick}minimatch${tick} dependem de linhas de API diferentes. Foram testadas e rejeitadas sem integração as alternativas ${tick}2.1.3${tick} e override global ${tick}2.1.4${tick}. O upstream oficial publicou backports do advisory em múltiplas linhas de manutenção.\n\nA correção adotada remove o override global de ${tick}brace-expansion${tick}, deixa o npm resolver a linha segura compatível com cada consumidor, remove os dois patches locais de ${tick}minimatch${tick} e retira ${tick}patch-package${tick} e seu ${tick}postinstall${tick}, que deixam de ter finalidade. O teste transitivo passa a validar consumidores antigos e modernos e reproduz os casos de regressão do advisory.\n\nA validação dedicada comprovou instalação limpa, zero vulnerabilidades de auditoria, assinaturas válidas, compatibilidade transitiva, lint, testes, build e inspeção de bundle. O gate integral inclui ainda cobertura e Playwright antes da integração. O pacote não altera regra de negócio, banco, migrations, RLS, dados, cache, autenticação, Vercel ou interface.\n\nA investigação e as evidências estão em ${tick}docs/maintenance/BRACE_EXPANSION_SECURITY_2026-08-09.md${tick}.\n\n`;

  content = replaceOnce(
    content,
    '## Regra permanente de modernização proativa\n',
    `${securitySection}## Regra permanente de modernização proativa\n`,
    'seção de modernização',
  );

  const nextStageStart = content.indexOf('## Próxima etapa\n');
  const docsStart = content.indexOf('## Documentação vigente\n');
  if (nextStageStart < 0 || docsStart < 0 || docsStart <= nextStageStart) {
    throw new Error('Bloco Próxima etapa/Documentação vigente não encontrado');
  }
  const nextStage = `## Próxima etapa\n\nA prioridade imediata é concluir a correção transitiva de segurança do PR #149 e manter a linha de base novamente com auditoria limpa. O problema é independente do G1 e foi tratado em branch própria para preservar causa de falha e rollback.\n\nDepois dessa integração, o G1 do PR #148 deve ser reaplicado sobre a nova ${tick}main${tick} e validado integralmente. O G1 adiciona lint oficial do TanStack Query e Devtools somente em desenvolvimento; a migração de ${tick}supabase/setup-cli${tick} para v3 permanece adiada enquanto o pacote npm estável do CLI não alcançar a versão já validada pelo CI.\n\nA fundação do Trilho B continua planejada em pacote separado, sem mistura com manutenção geral. Observabilidade de erros permanece próxima investigação geral de alto valor, sujeita a desenho próprio de privacidade, retenção e sanitização. ESLint 10 e TypeScript 7 continuam sem adoção automática.\n\nNenhuma extensão funcional do R5 avançado, R1 residual, R2 ou ciclos posteriores é autorizada por inferência. E2, segurança final e homologação consolidada do R12 permanecem gates antes da entrega final do produto.\n\n`;
  content = content.slice(0, nextStageStart) + nextStage + content.slice(docsStart);

  content = replaceOnce(
    content,
    '26. este Handoff.',
    `26. ${tick}docs/maintenance/BRACE_EXPANSION_SECURITY_2026-08-09.md${tick};\n27. este Handoff.`,
    'índice do Handoff',
  );

  content = replaceOnce(
    content,
    'Depois da Rodada 3.2, nenhuma fila funcional se abre automaticamente. O próximo trabalho será escolhido por valor, risco ou limite comprovado, conforme GOV-013 e a política de manutenção v1.1.',
    'Depois da Rodada 5 e da correção transitiva de 9 de agosto, nenhuma fila funcional se abre automaticamente. O próximo trabalho será escolhido por valor, risco ou limite comprovado, conforme GOV-013 e a política de manutenção v1.1.',
    'regra final de continuidade',
  );

  writeFileSync(file, content);
}

function syncMaintenancePlan() {
  const file = 'docs/execution/PLANO_CONSOLIDADO_MANUTENCAO_MODERNIZACAO_CTRH_v1.1.md';
  let content = readFileSync(file, 'utf8');

  const section = `## 7.1 Correção emergencial de segurança transitiva — 9 de agosto de 2026\n\nDurante a preparação do G1, o gate de auditoria detectou o novo advisory ${tick}GHSA-rgw5-rvv9-x895${tick} em ${tick}brace-expansion@5.0.8${tick}, versão que já fazia parte da linha de base. A correção foi isolada no PR #149 antes da continuidade das modernizações gerais.\n\nA análise mostrou que um override global é inadequado para a árvore atual porque versões antigas e modernas de ${tick}minimatch${tick} esperam APIs diferentes. A solução remove o override global, permite que o npm resolva os backports oficiais compatíveis de cada linha, elimina dois patches locais e retira ${tick}patch-package${tick} quando sua última finalidade desaparece.\n\nO pacote adiciona regressões específicas do advisory e mantém ${tick}npm audit --audit-level=high${tick}, assinaturas, lint, cobertura, build, bundle e Playwright como gates. Não altera comportamento funcional, banco, migrations, RLS, dados ou Production. A evidência detalhada está em ${tick}docs/maintenance/BRACE_EXPANSION_SECURITY_2026-08-09.md${tick}.\n\nA continuidade do G1 TanStack Query permanece independente: o plugin oficial de ESLint e os Devtools de desenvolvimento serão retomados sobre a linha de base já corrigida. A atualização do Supabase Action v3 permanece condicionada ao pacote npm estável do CLI alcançar a versão já validada no CI, evitando downgrade ou adoção beta por conveniência.\n\n`;

  content = replaceOnce(
    content,
    '## 8. Oportunidades funcionais condicionadas\n',
    `${section}## 8. Oportunidades funcionais condicionadas\n`,
    'seção de oportunidades',
  );

  writeFileSync(file, content);
}

syncHandoff();
syncMaintenancePlan();
