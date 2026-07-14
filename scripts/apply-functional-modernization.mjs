import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const originalCommit = '7f96e5a53c0cad554136bab21f141ec7cd10685e';
const originalPath = '/tmp/apply-functional-modernization-original.mjs';

execFileSync('git', ['fetch', '--no-tags', 'origin', originalCommit], { stdio: 'inherit' });
const original = execFileSync(
  'git',
  ['show', `${originalCommit}:scripts/apply-functional-modernization.mjs`],
  { encoding: 'utf8' },
);
fs.writeFileSync(originalPath, original);
await import(`${pathToFileURL(originalPath).href}?run=${Date.now()}`);

function read(relativePath) {
  return fs.readFileSync(relativePath, 'utf8');
}

function write(relativePath, content) {
  fs.mkdirSync(path.dirname(relativePath), { recursive: true });
  fs.writeFileSync(relativePath, content.endsWith('\n') ? content : `${content}\n`);
}

function replaceOnce(relativePath, before, after) {
  const source = read(relativePath);
  if (!source.includes(before)) {
    throw new Error(`Padrão não encontrado em ${relativePath}: ${before.slice(0, 90)}`);
  }
  write(relativePath, source.replace(before, after));
}

fs.rmSync('.github/dependabot.yml', { force: true });

replaceOnce(
  'src/App.tsx',
  "  const [modalHistoricoAberto, setModalHistoricoAberto] = useState<boolean>(false);\n",
  "  const [modalHistoricoAberto, setModalHistoricoAberto] = useState<boolean>(false);\n  const drawerBloqueadoPorModal = modalEditarAberto || modalStatusAberto || modalHistoricoAberto;\n",
);
replaceOnce(
  'src/App.tsx',
  '          <div className="drawer-overlay" onClick={() => { setDrawerAberto(false); setDemandaSelecionada(null); }}>',
  `          <div\n            className="drawer-overlay"\n            inert={drawerBloqueadoPorModal ? true : undefined}\n            aria-hidden={drawerBloqueadoPorModal ? 'true' : undefined}\n            onClick={() => { setDrawerAberto(false); setDemandaSelecionada(null); }}\n          >`,
);

for (const relativePath of [
  'src/components/ModalNovo.tsx',
  'src/components/ModalEditar.tsx',
  'src/components/ModalStatus.tsx',
  'src/components/ModalHistorico.tsx',
]) {
  replaceOnce(
    relativePath,
    '<div className="modal-overlay" onClick={onClose}>',
    '<div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>',
  );
}

replaceOnce(
  'src/index.css',
  '  z-index: 1000;\n  animation: fadeIn var(--transition-normal) forwards;',
  '  z-index: 1100;\n  animation: fadeIn var(--transition-normal) forwards;',
);

let css = read('src/index.css');
if (!css.includes('.drawer-overlay[inert]')) {
  css = `${css.trimEnd()}\n\n.drawer-overlay[inert] {\n  pointer-events: none;\n}\n`;
  write('src/index.css', css);
}

replaceOnce(
  'vite.config.ts',
  "    setupFiles: './src/test/setup.ts',\n",
  "    setupFiles: './src/test/setup.ts',\n    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],\n",
);

let test = read('src/App.ux.test.tsx');
if (!test.includes('torna o drawer inerte enquanto um modal está aberto sobre ele')) {
  const block = `\n  it('torna o drawer inerte enquanto um modal está aberto sobre ele', async () => {\n    localStorage.setItem('demandas_user', 'teste@rioeduca.net');\n    const { container } = render(<App />);\n    const user = userEvent.setup();\n\n    await user.click(await screen.findByRole('button', { name: /^demandas$/i }));\n    await user.click((await screen.findAllByRole('button', { name: /^abrir$/i }))[0]);\n    await user.click(screen.getByRole('button', { name: /^editar$/i }));\n\n    const drawer = container.querySelector('.drawer-overlay');\n    expect(drawer).toHaveAttribute('inert');\n    expect(drawer).toHaveAttribute('aria-hidden', 'true');\n    expect(screen.getByRole('heading', { name: /editar dados da demanda/i })).toBeVisible();\n  });\n`;
  const marker = '\n});\n';
  const index = test.lastIndexOf(marker);
  if (index < 0) throw new Error('Fim da suíte App.ux.test.tsx não encontrado');
  test = test.slice(0, index) + block + test.slice(index);
  write('src/App.ux.test.tsx', test);
}

write('tests/e2e/modal-layering.spec.ts', `import { expect, test } from '@playwright/test';\n\nasync function login(page: import('@playwright/test').Page) {\n  await page.goto('/');\n  await page.getByPlaceholder('usuario@rioeduca.net').fill('teste@rioeduca.net');\n  await page.getByPlaceholder('••••••••').first().fill('senha-local-teste');\n  await page.getByRole('button', { name: /acessar sistema/i }).click();\n  await expect(page.getByRole('button', { name: /sair/i })).toBeVisible();\n}\n\ntest('modal de edição permanece interativo acima do drawer', async ({ page }) => {\n  await login(page);\n  await page.getByRole('button', { name: /^demandas$/i }).click();\n  await page.getByRole('button', { name: /^abrir$/i }).first().click();\n  await page.getByRole('button', { name: /^editar$/i }).click();\n  await expect(page.getByRole('heading', { name: /editar dados da demanda/i })).toBeVisible();\n  await page.getByRole('button', { name: /^cancelar$/i }).click();\n  await expect(page.getByRole('heading', { name: /editar dados da demanda/i })).toBeHidden();\n  await expect(page.getByRole('heading', { name: /processo nº/i })).toBeVisible();\n});\n`);

for (const relativePath of [
  '.github/modernizacao-trigger.txt',
  '.github/workflows/bootstrap-modernizacao.yml',
]) {
  fs.rmSync(relativePath, { force: true });
}

for (const relativePath of [
  'docs/superpowers/specs/2026-07-14-functional-modernization-design.md',
  'docs/superpowers/plans/2026-07-14-functional-modernization.md',
]) {
  if (fs.existsSync(relativePath)) {
    const content = read(relativePath)
      .replace('- Weekly dependency maintenance through Dependabot.\n', '')
      .replace('- [x] Add weekly dependency maintenance.\n', '');
    write(relativePath, content);
  }
}
