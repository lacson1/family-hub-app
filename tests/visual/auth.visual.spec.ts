import { test, expect } from '@playwright/test';
import { AuthPage } from '../page-objects/AuthPage';

test.describe('Authentication Visual Tests', () => {
    let authPage: AuthPage;

    test.beforeEach(async ({ page }) => {
        authPage = new AuthPage(page);
        await authPage.goto();
        // Wait for page to be fully loaded and stable
        await page.waitForLoadState('networkidle');
        // Ensure CSS animations have completed
        await page.waitForTimeout(500);
    });

    test('login page initial state', async ({ page }) => {
        await expect(page).toHaveScreenshot('auth-login-initial.png', {
            fullPage: true,
        });
    });

    test('login page with filled credentials', async ({ page }) => {
        await authPage.emailInput.fill('testuser@example.com');
        await authPage.passwordInput.fill('TestPassword123!');

        await expect(page).toHaveScreenshot('auth-login-filled.png', {
            fullPage: true,
        });
    });

    test('signup page initial state', async ({ page }) => {
        await authPage.switchToSignUp();
        await page.waitForTimeout(300); // Wait for form transition

        await expect(page).toHaveScreenshot('auth-signup-initial.png', {
            fullPage: true,
        });
    });

    test('signup page with filled form', async ({ page }) => {
        await authPage.switchToSignUp();
        await page.waitForTimeout(300);

        await authPage.nameInput.fill('Test User');
        await authPage.emailInput.fill('newuser@example.com');
        await authPage.passwordInput.fill('TestPassword123!');

        await expect(page).toHaveScreenshot('auth-signup-filled.png', {
            fullPage: true,
        });
    });

    test('login page with validation error', async ({ page }) => {
        // Try to login with empty fields to show validation
        await authPage.signInButton.click();
        await page.waitForTimeout(500); // Wait for error state

        await expect(page).toHaveScreenshot('auth-login-validation-error.png', {
            fullPage: true,
        });
    });
});

