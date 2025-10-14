import { test, expect } from '@playwright/test';
import { AuthPage } from '../page-objects/AuthPage';
import { ShoppingPage } from '../page-objects/ShoppingPage';

test.describe('Shopping List Visual Tests', () => {
    let authPage: AuthPage;
    let shoppingPage: ShoppingPage;

    test.beforeEach(async ({ page }) => {
        authPage = new AuthPage(page);
        shoppingPage = new ShoppingPage(page);

        // Login first
        await authPage.goto();
        const testUser = {
            email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
            password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
        };
        await authPage.login(testUser.email, testUser.password);
        await authPage.expectLoggedIn();

        // Navigate to shopping list
        await shoppingPage.goto();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
    });

    test('shopping list default view', async ({ page }) => {
        await expect(page).toHaveScreenshot('shopping-list-default.png', {
            fullPage: true,
            // Mask timestamps
            mask: [page.locator('[data-testid*="timestamp"]'), page.locator('time')],
        });
    });

    test('shopping list with items', async ({ page }) => {
        // Check if there are items in the list
        const items = page.locator('[data-testid="shopping-item"], .shopping-item');
        const count = await items.count().catch(() => 0);

        if (count > 0) {
            await expect(page).toHaveScreenshot('shopping-list-with-items.png', {
                fullPage: true,
                mask: [page.locator('[data-testid*="timestamp"]')],
            });
        }
    });

    test('shopping list add item modal', async ({ page }) => {
        const addButton = page.locator('[data-testid="add-shopping-item"], button:has-text("Add Item")');
        if (await addButton.isVisible().catch(() => false)) {
            await addButton.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('shopping-list-add-modal.png', {
                fullPage: true,
            });
        }
    });

    test('shopping list with filters', async ({ page }) => {
        const filterButton = page.locator('[data-testid="filter-button"], button:has-text("Filter")');
        if (await filterButton.isVisible().catch(() => false)) {
            await filterButton.click();
            await page.waitForTimeout(300);

            await expect(page).toHaveScreenshot('shopping-list-filters.png', {
                fullPage: true,
            });
        }
    });

    test('shopping list item categories', async ({ page }) => {
        const categoryView = page.locator('[data-testid="category-view"], button:has-text("Categories")');
        if (await categoryView.isVisible().catch(() => false)) {
            await categoryView.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('shopping-list-categories.png', {
                fullPage: true,
            });
        }
    });

    test('shopping list checked items', async ({ page }) => {
        // Check first item if available
        const firstCheckbox = page.locator('[data-testid="shopping-item-checkbox"], input[type="checkbox"]').first();
        if (await firstCheckbox.isVisible().catch(() => false)) {
            await firstCheckbox.check();
            await page.waitForTimeout(300);

            await expect(page).toHaveScreenshot('shopping-list-checked-item.png', {
                fullPage: true,
                mask: [page.locator('[data-testid*="timestamp"]')],
            });
        }
    });
});

