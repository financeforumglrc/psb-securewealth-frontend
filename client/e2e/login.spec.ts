import { test, expect } from '@playwright/test';

test('demo login lands on dashboard', async ({ page }) => {
  await page.goto('/');

  // Wait for the demo accounts section and click the first one
  await page.getByRole('button', { name: /Deepanshu Sharma/ }).click();

  // After demo login the authenticated app should render
  await expect(page.getByText(/Good/i)).toBeVisible({ timeout: 10000 });
  await expect(page).toHaveURL(/\//);
});

test('navigate to Payments view', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Mrigesh Mohanty/ }).click();
  await page.getByRole('link', { name: /Payments/i }).click();
  await expect(page.getByText(/UPI|Pay|Transfer/i).first()).toBeVisible({ timeout: 10000 });
});
