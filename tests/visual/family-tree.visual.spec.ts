import { test, expect } from '@playwright/test';
import { AuthPage } from '../page-objects/AuthPage';
import { FamilyTreePage } from '../page-objects/FamilyTreePage';

test.describe('Family Tree Visual Tests', () => {
    let authPage: AuthPage;
    let familyTreePage: FamilyTreePage;

    test.beforeEach(async ({ page }) => {
        authPage = new AuthPage(page);
        familyTreePage = new FamilyTreePage(page);

        // Login first
        await authPage.goto();
        const testUser = {
            email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
            password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
        };
        await authPage.login(testUser.email, testUser.password);
        await authPage.expectLoggedIn();

        // Navigate to family tree
        await familyTreePage.goto();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500); // Wait for tree visualization to render
    });

    test('family tree default view', async ({ page }) => {
        await expect(page).toHaveScreenshot('family-tree-default.png', {
            fullPage: true,
        });
    });

    test('family tree with member details panel', async ({ page }) => {
        // Click on a family member if any exists
        const firstMember = page.locator('[data-testid="family-member-card"], .family-member').first();
        if (await firstMember.isVisible().catch(() => false)) {
            await firstMember.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('family-tree-member-details.png', {
                fullPage: true,
            });
        }
    });

    test('family tree add member modal', async ({ page }) => {
        const addButton = page.locator('[data-testid="add-member-button"], button:has-text("Add Member")');
        if (await addButton.isVisible().catch(() => false)) {
            await addButton.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('family-tree-add-member-modal.png', {
                fullPage: true,
            });
        }
    });

    test('family tree expanded view', async ({ page }) => {
        // Look for expand/collapse buttons
        const expandButton = page.locator('[data-testid="expand-tree"], button:has-text("Expand")');
        if (await expandButton.isVisible().catch(() => false)) {
            await expandButton.click();
            await page.waitForTimeout(1000); // Wait for expansion animation

            await expect(page).toHaveScreenshot('family-tree-expanded.png', {
                fullPage: true,
            });
        }
    });

    test('family tree relationship view', async ({ page }) => {
        const relationshipButton = page.locator('[data-testid="relationships-view"], button:has-text("Relationships")');
        if (await relationshipButton.isVisible().catch(() => false)) {
            await relationshipButton.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('family-tree-relationships.png', {
                fullPage: true,
            });
        }
    });
});

