import { test, expect } from '@playwright/test';
import { AuthPage } from '../page-objects/AuthPage';
import { ContactsPage } from '../page-objects/ContactsPage';

test.describe('Contacts Visual Tests', () => {
    let authPage: AuthPage;
    let contactsPage: ContactsPage;

    test.beforeEach(async ({ page }) => {
        authPage = new AuthPage(page);
        contactsPage = new ContactsPage(page);

        // Login first
        await authPage.goto();
        const testUser = {
            email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
            password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
        };
        await authPage.login(testUser.email, testUser.password);
        await authPage.expectLoggedIn();

        // Navigate to contacts
        await contactsPage.goto();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
    });

    test('contacts list default view', async ({ page }) => {
        await expect(page).toHaveScreenshot('contacts-list-default.png', {
            fullPage: true,
        });
    });

    test('contacts grid view', async ({ page }) => {
        const gridViewButton = page.locator('[data-testid="grid-view"], button:has-text("Grid")');
        if (await gridViewButton.isVisible().catch(() => false)) {
            await gridViewButton.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('contacts-grid-view.png', {
                fullPage: true,
            });
        }
    });

    test('contacts add contact modal', async ({ page }) => {
        const addButton = page.locator('[data-testid="add-contact-button"], button:has-text("Add Contact")');
        if (await addButton.isVisible().catch(() => false)) {
            await addButton.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('contacts-add-modal.png', {
                fullPage: true,
            });
        }
    });

    test('contacts details view', async ({ page }) => {
        const firstContact = page.locator('[data-testid="contact-item"]').first();
        if (await firstContact.isVisible().catch(() => false)) {
            await firstContact.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('contacts-details-view.png', {
                fullPage: true,
            });
        }
    });

    test('contacts search functionality', async ({ page }) => {
        const searchInput = page.locator('[data-testid="contact-search"], input[placeholder*="Search"]');
        if (await searchInput.isVisible().catch(() => false)) {
            await searchInput.fill('test');
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('contacts-search-results.png', {
                fullPage: true,
            });
        }
    });

    test('contacts filter by category', async ({ page }) => {
        const filterButton = page.locator('[data-testid="filter-contacts"], button:has-text("Filter")');
        if (await filterButton.isVisible().catch(() => false)) {
            await filterButton.click();
            await page.waitForTimeout(300);

            await expect(page).toHaveScreenshot('contacts-filter-menu.png', {
                fullPage: true,
            });
        }
    });
});

