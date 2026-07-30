import { readFile, writeFile } from 'node:fs/promises';

const path = 'src/App.supabase.test.tsx';
let source = await readFile(path, 'utf8');

const replacements = [
  [
    "    await user.selectOptions(screen.getByLabelText('Responsável'), officialResponsible.id);\n    await user.selectOptions(screen.getByLabelText('Status'), 'Aguardando Andamento');",
    "    await user.selectOptions(screen.getByLabelText('Responsável'), officialResponsible.id);\n    await user.type(screen.getByLabelText('Data de prazo interno'), '15082026');\n    await user.click(screen.getByRole('radio', { name: 'Não se aplica' }));\n    await user.selectOptions(screen.getByLabelText('Status'), 'Aguardando Andamento');",
  ],
  ["screen.getByLabelText('Próxima ação')", "screen.getByLabelText('Próxima providência')"],
  ["screen.getByLabelText('Data de acompanhamento')", "screen.getByLabelText('Data da próxima providência')"],
  ["'Filtrar por demandas com prazo hoje'", "'Filtrar por demandas cujo prazo final vence hoje'"],
  ["'Filtrar por demandas vencidas'", "'Filtrar por demandas com prazo final vencido'"],
];

for (const [before, after] of replacements) {
  if (!source.includes(before)) {
    throw new Error(`Trecho esperado não encontrado: ${before}`);
  }
  source = source.replaceAll(before, after);
}

await writeFile(path, source);
