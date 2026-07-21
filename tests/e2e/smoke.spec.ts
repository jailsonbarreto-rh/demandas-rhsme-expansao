import { expect, test } from '@playwright/test';

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(overflow.content).toBeLessThanOrEqual(overflow.viewport + 1);
}

test('fluxos críticos funcionam sem erros, dependências externas ou estouro horizontal', async ({ page }) => {
  const consoleErrors: string[] = [];
  const externalAssetRequests: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('request', (request) => {
    if (/fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com/.test(request.url())) {
      externalAssetRequests.push(request.url());
    }
  });

  await page.goto('/');
  await expect(page).toHaveTitle(/Fluxo CTRH/i);
  await expect(page.getByRole('button', { name: /acessar sistema/i })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByPlaceholder('usuario@rioeduca.net').fill('teste@rioeduca.net');
  await page.getByPlaceholder('••••••••').first().fill('senha-local-teste');
  await page.getByRole('button', { name: /acessar sistema/i }).click();

  await expect(page.getByRole('button', { name: /sair/i })).toBeVisible();
  await expect(page.getByText(/Ambiente Local/i)).toBeVisible();
  await expectNoHorizontalOverflow(page);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /exportar excel/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^central_demandas_analitico_\d{4}-\d{2}-\d{2}_\d{4}\.xlsx$/);

  await page.getByRole('button', { name: /nova demanda/i }).click();
  await expect(page.getByRole('heading', { name: /nova demanda/i })).toBeVisible();
  await page.getByRole('button', { name: /^cancelar$/i }).click();

  await page.getByRole('button', { name: /^demandas$/i }).click();
  await page.getByRole('button', { name: /^abrir$/i }).first().click();
  await expect(page.getByRole('heading', { name: /processo nº/i })).toBeVisible();
  await page.getByRole('button', { name: /^editar$/i }).click();
  await expect(page.getByRole('heading', { name: /editar dados da demanda/i })).toBeVisible();
  await page.getByRole('button', { name: /^cancelar$/i }).click();
  await page.getByRole('button', { name: /^fechar$/i }).click();
  await expectNoHorizontalOverflow(page);

  expect(externalAssetRequests).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
