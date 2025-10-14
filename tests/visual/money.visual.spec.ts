import { test, expect } from '@playwright/test';
import { AuthPage } from '../page-objects/AuthPage';
import { MoneyPage } from '../page-objects/MoneyPage';

test.describe('Money Management Visual Tests', () => {
    let authPage: AuthPage;
    let moneyPage: MoneyPage;

    test.beforeEach(async ({ page }) => {
        authPage = new AuthPage(page);
        moneyPage = new MoneyPage(page);

        // Login first
        await authPage.goto();
        const testUser = {
            email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
            password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
        };
        await authPage.login(testUser.email, testUser.password);
        await authPage.expectLoggedIn();

        // Navigate to money/transactions
        await moneyPage.goto();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Wait for charts to render
    });

    test('money overview dashboard', async ({ page }) => {
        await expect(page).toHaveScreenshot('money-overview.png', {
            fullPage: true,
            // Mask dates and dynamic amounts
            mask: [
                page.locator('[data-testid*="date"]'),
                page.locator('time'),
                page.locator('[data-testid*="balance"]'),
            ],
        });
    });

    test('money transactions list', async ({ page }) => {
        const transactionsTab = page.locator('[data-testid="transactions-tab"], button:has-text("Transactions")');
        if (await transactionsTab.isVisible().catch(() => false)) {
            await transactionsTab.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('money-transactions-list.png', {
                fullPage: true,
                mask: [page.locator('[data-testid*="date"]'), page.locator('[data-testid*="amount"]')],
            });
        }
    });

    test('money budget view', async ({ page }) => {
        const budgetTab = page.locator('[data-testid="budget-tab"], button:has-text("Budget")');
        if (await budgetTab.isVisible().catch(() => false)) {
            await budgetTab.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('money-budget-view.png', {
                fullPage: true,
                mask: [page.locator('[data-testid*="amount"]')],
            });
        }
    });

    test('money add transaction modal', async ({ page }) => {
        const addButton = page.locator('[data-testid="add-transaction"], button:has-text("Add Transaction")');
        if (await addButton.isVisible().catch(() => false)) {
            await addButton.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('money-add-transaction-modal.png', {
                fullPage: true,
            });
        }
    });

    test('money charts and analytics', async ({ page }) => {
        const chartsView = page.locator('[data-testid="charts-view"], button:has-text("Charts"), button:has-text("Analytics")');
        if (await chartsView.isVisible().catch(() => false)) {
            await chartsView.click();
            await page.waitForTimeout(1000); // Wait for chart rendering

            await expect(page).toHaveScreenshot('money-charts.png', {
                fullPage: true,
                mask: [
                    page.locator('[data-testid*="date"]'),
                    page.locator('[data-testid*="amount"]'),
                    page.locator('text'),
                ],
            });
        }
    });

    test('money category breakdown', async ({ page }) => {
        const categoryView = page.locator('[data-testid="category-view"], button:has-text("Categories")');
        if (await categoryView.isVisible().catch(() => false)) {
            await categoryView.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('money-categories.png', {
                fullPage: true,
                mask: [page.locator('[data-testid*="amount"]')],
            });
        }
    });

    test('money add budget modal', async ({ page }) => {
        const budgetTab = page.locator('[data-testid="budget-tab"], button:has-text("Budget")');
        if (await budgetTab.isVisible().catch(() => false)) {
            await budgetTab.click();
            await page.waitForTimeout(300);
        }

        const addBudgetButton = page.locator('[data-testid="add-budget"], button:has-text("Add Budget")');
        if (await addBudgetButton.isVisible().catch(() => false)) {
            await addBudgetButton.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('money-add-budget-modal.png', {
                fullPage: true,
            });
        }
    });
});

