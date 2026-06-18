import { test, expect } from '@playwright/test';

test('create account button opens the registration modal', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /Create account/i }).click();

  await expect(page.getByRole('heading', { name: /Open New Account/i })).toBeVisible();
  await expect(page.getByPlaceholder(/Amit Kumar/i)).toBeVisible();
  await expect(page.getByPlaceholder(/amit@email.com/i)).toBeVisible();
});
