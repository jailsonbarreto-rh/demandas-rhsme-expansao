import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('limites de recuperação da aplicação', () => {
  it('protege globalmente e isola as quatro regiões operacionais definidas', async () => {
    const source = await readFile(resolve(process.cwd(), 'src/App.tsx'), 'utf8');

    expect(source).toContain("import { ErrorBoundary } from './components/ErrorBoundary';");
    expect(source).toContain('Não foi possível carregar o sistema');
    expect(source).toContain('Não foi possível exibir o Radar de Governança');
    expect(source).toContain('Não foi possível exibir a lista de demandas');
    expect(source).toContain('Não foi possível abrir o prontuário');
    expect(source).toContain('Não foi possível exibir a Administração');
    expect(source.match(/<ErrorBoundary/g)).toHaveLength(5);
  });
});
