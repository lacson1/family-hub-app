import { test, expect } from '@playwright/test';
import { AuthPage } from '../page-objects/AuthPage';
import { MealsPage } from '../page-objects/MealsPage';

test.describe('Meals Visual Tests', () => {
    let authPage: AuthPage;
    let mealsPage: MealsPage;

    test.beforeEach(async ({ page }) => {
        authPage = new AuthPage(page);
        mealsPage = new MealsPage(page);

        // Login first
        await authPage.goto();
        const testUser = {
            email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
            password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
        };
        await authPage.login(testUser.email, testUser.password);
        await authPage.expectLoggedIn();

        // Navigate to meals
        await mealsPage.goto();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
    });

    test('meals planner default view', async ({ page }) => {
        await expect(page).toHaveScreenshot('meals-planner-default.png', {
            fullPage: true,
            // Mask dates
            mask: [page.locator('[data-testid*="date"]'), page.locator('time')],
        });
    });

    test('meals weekly view', async ({ page }) => {
        const weeklyView = page.locator('[data-testid="weekly-view"], button:has-text("Week")');
        if (await weeklyView.isVisible().catch(() => false)) {
            await weeklyView.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('meals-weekly-view.png', {
                fullPage: true,
                mask: [page.locator('[data-testid*="date"]')],
            });
        }
    });

    test('meals add meal modal', async ({ page }) => {
        const addButton = page.locator('[data-testid="add-meal-button"], button:has-text("Add Meal")');
        if (await addButton.isVisible().catch(() => false)) {
            await addButton.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('meals-add-modal.png', {
                fullPage: true,
            });
        }
    });

    test('meals recipe details', async ({ page }) => {
        const firstMeal = page.locator('[data-testid="meal-item"], .meal-card').first();
        if (await firstMeal.isVisible().catch(() => false)) {
            await firstMeal.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('meals-recipe-details.png', {
                fullPage: true,
                mask: [page.locator('[data-testid*="date"]')],
            });
        }
    });

    test('meals search and filter', async ({ page }) => {
        const searchInput = page.locator('[data-testid="meal-search"], input[placeholder*="Search"]');
        if (await searchInput.isVisible().catch(() => false)) {
            await searchInput.fill('chicken');
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('meals-search-results.png', {
                fullPage: true,
                mask: [page.locator('[data-testid*="date"]')],
            });
        }
    });

    test('meals categories view', async ({ page }) => {
        const categoriesButton = page.locator('[data-testid="categories-view"], button:has-text("Categories")');
        if (await categoriesButton.isVisible().catch(() => false)) {
            await categoriesButton.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('meals-categories.png', {
                fullPage: true,
            });
        }
    });

    test('meals shopping list generation', async ({ page }) => {
        const generateListButton = page.locator('[data-testid="generate-shopping-list"], button:has-text("Generate")');
        if (await generateListButton.isVisible().catch(() => false)) {
            await generateListButton.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('meals-generate-shopping-list.png', {
                fullPage: true,
            });
        }
    });
});

