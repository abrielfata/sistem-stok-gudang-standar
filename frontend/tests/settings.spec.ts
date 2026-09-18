import { test, expect } from '@playwright/test';

test.describe('Settings Page Automated QA Testing', () => {

  test('TC-SET-001: Access Settings Page & Tab Navigation', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:5173/');

    // 2. Navigate to Settings Page
    await page.goto('/settings');
    await expect(page.locator('h1')).toContainText('PENGATURAN SISTEM');

    // 3. Verify Tabs
    const companyTab = page.getByRole('button', { name: /PROFIL PERUSAHAAN/i });
    const inventoryTab = page.getByRole('button', { name: /PARAMETER STOK/i });
    const preferencesTab = page.getByRole('button', { name: /TAMPILAN & FORMAT/i });

    await expect(companyTab).toBeVisible();
    await expect(inventoryTab).toBeVisible();
    await expect(preferencesTab).toBeVisible();

    // 4. Test Tab Switching
    await inventoryTab.click();
    await expect(page.getByText('Format Prefix Nomor GRN')).toBeVisible();

    await preferencesTab.click();
    await expect(page.getByText('Format Tanggal', { exact: true })).toBeVisible();
  });

  test('TC-SET-002: Save & Persistence in LocalStorage', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await page.goto('/settings');
    
    // Change Company Name
    const companyNameInput = page.locator('form input[type="text"]').first();
    await companyNameInput.fill('PT Gudang Test Hermes');

    // Click Save
    await page.getByRole('button', { name: /SIMPAN PENGATURAN/i }).first().click();

    // Check Toast / Notification
    await expect(page.getByText('Pengaturan sistem berhasil disimpan')).toBeVisible();

    // Reload Page and verify persistence
    await page.reload();
    await expect(companyNameInput).toHaveValue('PT Gudang Test Hermes');
  });

});
