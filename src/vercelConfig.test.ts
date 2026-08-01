import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type VercelConfig = {
  rewrites?: Array<{
    source: string;
    destination: string;
  }>;
};

describe('configuração de rotas da Vercel', () => {
  it('serve a recuperação de senha diretamente pela SPA', () => {
    const config = JSON.parse(
      readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8'),
    ) as VercelConfig;

    expect(config.rewrites).toContainEqual({
      source: '/redefinir-senha',
      destination: '/index.html',
    });
  });
});
