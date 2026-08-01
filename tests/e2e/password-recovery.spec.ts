import { expect, test, type Page } from '@playwright/test';

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(overflow.content).toBeLessThanOrEqual(overflow.viewport + 1);
}

test('solicita recuperação sem revelar se a conta existe', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');
  await page.getByRole('button', { name: /esqueci minha senha/i }).click();

  await expect(page.getByRole('heading', { name: /recuperar acesso/i })).toBeVisible();
  await page.getByLabel(/e-mail corporativo para recuperação/i).fill('pessoa@rioeduca.net');
  await page.getByRole('button', { name: /enviar link de recuperação/i }).click();

  await expect(page.getByRole('heading', { name: /confira seu e-mail/i })).toBeVisible();
  await expect(page.getByText(/se houver uma conta vinculada a esse e-mail/i)).toBeVisible();
  await expect(page.getByText(/esta confirmação é igual para todos os e-mails/i)).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await expectNoHorizontalOverflow(page);
  expect(consoleErrors).toEqual([]);
});

test('bloqueia a criação de senha quando a rota não possui sessão de recuperação', async ({ page }) => {
  await page.goto('/redefinir-senha');

  await expect(page).toHaveURL(/\/redefinir-senha$/);
  await expect(page.getByRole('heading', { name: /link inválido ou expirado/i })).toBeVisible();
  await expect(page.getByLabel(/^nova senha$/i)).toHaveCount(0);
  await expect(page.getByLabel(/confirmar nova senha/i)).toHaveCount(0);
  await expectNoHorizontalOverflow(page);

  await page.getByRole('button', { name: /voltar e solicitar novo link/i }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('button', { name: /acessar sistema/i })).toBeVisible();
});
