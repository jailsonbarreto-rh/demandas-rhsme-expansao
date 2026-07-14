import { expect, test } from '@playwright/test';

test('login e fluxo de edição respondem sem erros no navegador', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');
  await expect(page).toHaveTitle(/Central de Demandas/i);
  await expect(page.getByRole('button', { name: /acessar sistema/i })).toBeVisible();

  await page.getByPlaceholder('usuario@rioeduca.net').fill('teste@rioeduca.net');
  await page.getByPlaceholder('••••••••').first().fill('senha-local-teste');
  await page.getByRole('button', { name: /acessar sistema/i }).click();

  await expect(page.getByRole('button', { name: /sair/i })).toBeVisible();
  await page.getByRole('button', { name: /^demandas$/i }).click();
  await page.getByRole('button', { name: /^abrir$/i }).first().click();

  await expect(page.getByRole('heading', { name: /processo nº/i })).toBeVisible();
  await page.getByRole('button', { name: /^editar$/i }).click();
  await expect(page.getByRole('heading', { name: /editar dados da demanda/i })).toBeVisible();
  await page.getByRole('button', { name: /^cancelar$/i }).click();
  await page.getByRole('button', { name: /^fechar$/i }).click();

  expect(consoleErrors).toEqual([]);
});
