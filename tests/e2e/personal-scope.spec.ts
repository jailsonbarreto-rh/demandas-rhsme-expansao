import { expect, test, type Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('/');
  await page.getByPlaceholder('usuario@rioeduca.net').fill('teste@rioeduca.net');
  await page.getByPlaceholder('••••••••').first().fill('senha-local-teste');
  await page.getByRole('button', { name: /acessar sistema/i }).click();
  await expect(page.getByRole('button', { name: /sair/i })).toBeVisible();
}

test('dashboard abre e identifica a carteira pessoal', async ({ page }) => {
  await login(page);

  await expect(page.getByRole('heading', { name: 'Minhas demandas' })).toBeVisible();
  await expect(page.getByText('Acompanhe sua carteira de processos.')).toBeVisible();
  await page.getByRole('button', { name: 'Acessar minha carteira' }).click();

  await expect.poll(() => new URL(page.url()).searchParams.get('escopo')).toBe('meu');
  await expect(page.getByText('Minhas demandas')).toBeVisible();

  await page.getByRole('button', { name: 'Ver carteira da equipe' }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get('escopo')).toBeNull();
  await expect(page.getByRole('button', { name: 'Ver carteira da equipe' })).toHaveCount(0);
});
