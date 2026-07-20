import fs from 'node:fs';

const path = 'src/components/FilterPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('role="combobox"')) {
  const source = `              type="search"
              id="busca"`;
  const replacement = `              type="search"
              role="combobox"
              aria-autocomplete="list"
              id="busca"`;
  if (!content.includes(source)) throw new Error('Campo de busca não encontrado.');
  content = content.replace(source, replacement);
  fs.writeFileSync(path, content, 'utf8');
}
