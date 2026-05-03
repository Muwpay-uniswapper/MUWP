import { test, expect } from '@playwright/test';

test.describe('Homepage smoke tests', () => {
  test('page loads with a title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
  });

  test('swap card is rendered', async ({ page }) => {
    await page.goto('/?chain=137&toChain=42161');
    await expect(page.getByRole('heading', { name: 'Swap' })).toBeVisible();
    await expect(
      page.getByText('Choose 1 or more input tokens'),
    ).toBeVisible();
  });

  test('connect wallet button is visible when not connected', async ({ page }) => {
    await page.goto('/?chain=137&toChain=42161');
    await expect(
      page.getByRole('button', { name: 'Connect Wallet' }),
    ).toBeVisible();
  });
});
