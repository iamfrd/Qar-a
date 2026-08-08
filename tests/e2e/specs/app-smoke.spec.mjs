import { test, expect } from '@playwright/test';

test('Qarğa application shell loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/internal server error/i);
});
