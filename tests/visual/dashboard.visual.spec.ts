import { test, expect } from '@playwright/test';
import { AuthPage } from '../page-objects/AuthPage';
import { DashboardPage } from '../page-objects/DashboardPage';

test.describe('Dashboard Visual Tests', () => {
    let authPage: AuthPage;
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
        authPage = new AuthPage(page);
        dashboardPage = new DashboardPage(page);

        // Login first
        await authPage.goto();
        const testUser = {
            email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
            password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
        };
        await authPage.login(testUser.email, testUser.password);
        await authPage.expectLoggedIn();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Wait for dashboard to fully render
    });

    test('dashboard home view', async ({ page }) => {
        // Navigate to home/dashboard
        await dashboardPage.navigateToHome();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot('dashboard-home.png', {
            fullPage: true,
            // Mask dynamic content like dates
            mask: [page.locator('[data-testid*="date"]'), page.locator('time')],
        });
    });

    test('dashboard with notifications panel open', async ({ page }) => {
        await dashboardPage.navigateToHome();
        await page.waitForLoadState('networkidle');

        // Open notifications if there's a notification button
        const notifButton = page.locator('[data-testid="notifications-button"]');
        if (await notifButton.isVisible().catch(() => false)) {
            await notifButton.click();
            await page.waitForTimeout(500);
        }

        await expect(page).toHaveScreenshot('dashboard-notifications-open.png', {
            fullPage: true,
            mask: [page.locator('[data-testid*="timestamp"]'), page.locator('time')],
        });
    });

    test('dashboard sidebar navigation', async ({ page }) => {
        await dashboardPage.navigateToHome();
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveScreenshot('dashboard-sidebar.png', {
            fullPage: false,
            clip: { x: 0, y: 0, width: 300, height: 800 },
        });
    });

    test('dashboard with modal overlay', async ({ page }) => {
        await dashboardPage.navigateToHome();
        await page.waitForLoadState('networkidle');

        // Try to open a "new item" modal if available
        const addButton = page.locator('button:has-text("Add"), button:has-text("+")').first();
        if (await addButton.isVisible().catch(() => false)) {
            await addButton.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('dashboard-modal-open.png', {
                fullPage: true,
            });
        }
    });
});

