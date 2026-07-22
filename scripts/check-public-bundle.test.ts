import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkPublicBundle, findPublicBundleLeaks } from './check-public-bundle.mjs';

const temporaryDirectories: string[] = [];

function makeTemporaryDirectory() {
  const directory = mkdtempSync(join(tmpdir(), 'ctrh-public-bundle-'));
  temporaryDirectories.push(directory);
  return directory;
}

function syntheticDemanda(numero: string) {
  return {
    id: 1,
    numero,
    tipo: 'Processo',
    assunto: 'Registro administrativo sintético',
    responsavel: 'Usuário Sintético',
    limite1: '',
    limite2: '',
    status: 'Aguardando Andamento',
    setor: 'Setor Sintético',
    classificacao: 'Outros',
  };
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('check-public-bundle', () => {
  it('aprova assets que não contêm identificadores administrativos', () => {
    const root = makeTemporaryDirectory();
    const assetsDirectory = resolve(root, 'dist', 'assets');
    mkdirSync(assetsDirectory, { recursive: true });
    writeFileSync(resolve(assetsDirectory, 'index-clean.js'), 'const numero="DEMO-PRO-001";');

    expect(findPublicBundleLeaks(assetsDirectory, [syntheticDemanda('ADM-SINTETICO-001')]))
      .toEqual([]);
  });

  it('reprova o bundle sem revelar o identificador encontrado na mensagem', () => {
    const root = makeTemporaryDirectory();
    const assetsDirectory = resolve(root, 'dist', 'assets');
    const adminDataPath = resolve(root, 'initial-demandas.json');
    const identifier = 'ADM-SINTETICO-SEGREDO-001';
    mkdirSync(assetsDirectory, { recursive: true });
    writeFileSync(resolve(assetsDirectory, 'index-leaky.js'), `const numero="${identifier}";`);
    writeFileSync(adminDataPath, JSON.stringify([syntheticDemanda(identifier)]));

    expect(() => checkPublicBundle({ adminDataPath, assetsDirectory }))
      .toThrow(/registros afetados.*1/i);

    try {
      checkPublicBundle({ adminDataPath, assetsDirectory });
    } catch (error) {
      expect(String(error)).not.toContain(identifier);
    }
  });
});
