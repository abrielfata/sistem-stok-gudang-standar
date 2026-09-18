import { test, expect } from '@playwright/test';

test.describe('WMS QA System Testing', () => {

  test('TC-AUTH-001 & 004: Login Valid & Logout', async ({ page }) => {
    await page.goto('/');
    // Check if redirected to login
    await expect(page).toHaveURL(/.*\/login/);

    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('http://localhost:5173/'); // Dashboard
    // logout
    await page.click('button[variant="ghost"], .lucide-log-out, text=Logout, text=Keluar, .user-menu');
    // We might need to adjust selectors based on shadcn UI
  });
});
