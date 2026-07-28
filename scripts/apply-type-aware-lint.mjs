import fs from 'node:fs';

const eslintConfig = `import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const typedSourceFiles = ['src/**/*.{ts,tsx}'];
const typedSourceConfigs = tseslint.configs.recommendedTypeChecked.map((config) => ({
  ...config,
  files: typedSourceFiles,
}));

export default tseslint.config(
  {
    ignores: [
      'coverage/**',
      'dist/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      '.migration/**',
    ],
  },
  {
    ...js.configs.recommended,
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.nodeBuiltin,
    },
  },
  ...tseslint.configs.recommended,
  ...typedSourceConfigs,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.nodeBuiltin,
      },
    },
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
  },
  {
    files: typedSourceFiles,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/only-throw-error': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'jsx-a11y': jsxA11y,
      'react-hooks': reactHooks,
    },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      'jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['region'] }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  {
    files: ['**/*.test.{ts,tsx,js,mjs}'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
);
`;
fs.writeFileSync('eslint.config.mjs', eslintConfig);

const appPath = 'src/App.tsx';
let app = fs.readFileSync(appPath, 'utf8');
const navigateMatches = app.match(/(?<!void )(?<!await )navigate\(/g) ?? [];
if (navigateMatches.length !== 8) {
  throw new Error(`Esperadas 8 chamadas de navigate sem tratamento; encontradas ${navigateMatches.length}.`);
}
app = app.replace(/(?<!void )(?<!await )navigate\(/g, 'void navigate(');

if (!app.includes('onLogout={handleLogout}') || !app.includes('onExportExcel={handleExportExcel}')) {
  throw new Error('Handlers assíncronos esperados no Header não foram encontrados.');
}
app = app
  .replace('onLogout={handleLogout}', 'onLogout={() => { void handleLogout(); }}')
  .replace('onExportExcel={handleExportExcel}', 'onExportExcel={() => { void handleExportExcel(); }}');
fs.writeFileSync(appPath, app);

fs.mkdirSync('docs/maintenance', { recursive: true });
const documentation = [
  '# Lint tipado — 28 de julho de 2026',
  '',
  '## Escopo ativado',
  '',
  'A análise com informação de tipos foi ativada para o código-fonte em `src/**/*.{ts,tsx}`, usando:',
  '',
  '- `typescript-eslint.configs.recommendedTypeChecked`;',
  '- `parserOptions.projectService`;',
  '- `@typescript-eslint/no-floating-promises` como erro;',
  '- `@typescript-eslint/no-misused-promises` como erro.',
  '',
  'Os arquivos TypeScript operacionais fora de `src` permanecem sob o preset recomendado sem informação de tipos. Essa delimitação acompanha o `tsconfig.json` atual, cujo escopo compilável é `src`.',
  '',
  '## Achados corrigidos',
  '',
  'O primeiro gate tipado identificou oito promessas de navegação sem tratamento explícito e dois handlers assíncronos fornecidos a atributos que esperavam retorno `void`. As chamadas intencionalmente não aguardadas passaram a usar `void`, e os handlers do cabeçalho receberam adaptadores síncronos explícitos.',
  '',
  '## Adoção progressiva',
  '',
  'O preset tipado também revelou famílias preexistentes de achados em mapeadores locais, exportação Excel e dublês de teste. As regras `no-unsafe-*`, `no-base-to-string`, `no-unnecessary-type-assertion`, `no-redundant-type-constituents`, `require-await` e `only-throw-error` permanecem explicitamente fora deste PR para evitar uma refatoração funcional ampla sem plano próprio.',
  '',
  'Essa delimitação não reduz nem desativa as duas regras de promessas que motivaram o pacote.',
  '',
].join('\n');
fs.writeFileSync('docs/maintenance/TYPE_AWARE_LINT_2026-07-28.md', documentation);
