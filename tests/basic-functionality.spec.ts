import { test, expect } from '@playwright/test';

test.describe('Basic App Functionality', () => {
  test('should load auth page', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Should see auth page
    await expect(page.locator('[data-testid="email"]')).toBeVisible();
    await expect(page.locator('[data-testid="password"]')).toBeVisible();
    await expect(page.locator('[data-testid="signup-button"]')).toBeVisible();
  });

  test('should sign up and see family setup', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Fill signup form
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="signup-button"]');
    
    // Wait for navigation or family setup
    await page.waitForTimeout(3000);
    
    // Check if we see family setup or main app
    const familySetup = page.locator('text=Create Your Family');
    const mainApp = page.locator('text=Welcome back');
    
    // One of these should be visible
    const isFamilySetupVisible = await familySetup.isVisible().catch(() => false);
    const isMainAppVisible = await mainApp.isVisible().catch(() => false);
    
    expect(isFamilySetupVisible || isMainAppVisible).toBeTruthy();
  });
});
