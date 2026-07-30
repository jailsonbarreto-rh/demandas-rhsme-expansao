import { expect, test } from '@playwright/test';

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByPlaceholder('usuario@rioeduca.net').fill('teste@rioeduca.net');
  await page.getByPlaceholder('••••••••').first().fill('senha-local-teste');
  await page.getByRole('button', { name: /acessar sistema/i }).click();
  await expect(page.getByRole('button', { name: /sair/i })).toBeVisible();
}

test('edição apresenta somente informações úteis e motivo contextual', async ({ page }) => {
  await signIn(page);
  await page.getByRole('button', { name: /^todas as demandas$/i }).click();

  const search = page.getByRole('combobox', { name: /busca por texto/i });
  await search.fill('DEMO-OUT-2026-005');
  await expect(page.getByRole('button', { name: 'DEMO-OUT-2026-005', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /^abrir$/i }).first().click();
  await page.getByRole('button', { name: /^editar$/i }).click();

  const dialog = page.getByRole('dialog', { name: /editar dados da demanda/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/registro legado/i)).toHaveCount(0);
  await expect(dialog.getByText(/responsável legado/i)).toHaveCount(0);
  await expect(dialog.getByDisplayValue(/ID:\s*5/i)).toHaveCount(0);
  await expect(dialog.getByLabel(/motivo da alteração/i)).toHaveCount(0);

  await dialog.getByRole('radiogroup', { name: /situação de prazo interno/i })
    .getByLabel('Data definida')
    .click();
  await dialog.getByLabel('Data de prazo interno').fill('20/08/2099');
  await expect(dialog.getByLabel(/motivo da alteração/i)).toHaveCount(0);

  await dialog.getByLabel('Assunto').fill('Monitoramento revisado de condição externa');
  const reason = dialog.getByLabel('Motivo da alteração *');
  await expect(reason).toBeVisible();
  await expect(dialog.getByText('O motivo será registrado no histórico da demanda.')).toBeVisible();

  const geometry = await reason.evaluate((element) => {
    const textarea = element as HTMLTextAreaElement;
    const parent = textarea.parentElement;
    const style = getComputedStyle(textarea);
    return {
      textareaWidth: textarea.getBoundingClientRect().width,
      parentWidth: parent?.getBoundingClientRect().width ?? 0,
      height: textarea.getBoundingClientRect().height,
      resize: style.resize,
    };
  });

  expect(geometry.textareaWidth).toBeGreaterThanOrEqual(geometry.parentWidth - 2);
  expect(geometry.height).toBeGreaterThanOrEqual(90);
  expect(geometry.resize).toBe('none');

  await dialog.getByRole('button', { name: /^cancelar$/i }).click();
  await page.getByRole('button', { name: /descartar alterações/i }).click();
});
