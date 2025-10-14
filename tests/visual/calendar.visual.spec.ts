import { test, expect } from '@playwright/test';
import { AuthPage } from '../page-objects/AuthPage';
import { EventsPage } from '../page-objects/EventsPage';

test.describe('Calendar Visual Tests', () => {
    let authPage: AuthPage;
    let eventsPage: EventsPage;

    test.beforeEach(async ({ page }) => {
        authPage = new AuthPage(page);
        eventsPage = new EventsPage(page);

        // Login first
        await authPage.goto();
        const testUser = {
            email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
            password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
        };
        await authPage.login(testUser.email, testUser.password);
        await authPage.expectLoggedIn();

        // Navigate to calendar/events
        await eventsPage.goto();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Wait for calendar to render
    });

    test('calendar month view', async ({ page }) => {
        await expect(page).toHaveScreenshot('calendar-month-view.png', {
            fullPage: true,
            // Mask current date indicators and time-based elements
            mask: [
                page.locator('.fc-today, [data-testid*="today"]'),
                page.locator('[data-testid*="current-date"]'),
            ],
        });
    });

    test('calendar with events list', async ({ page }) => {
        // Switch to list view if available
        const listViewButton = page.locator('button:has-text("List"), [data-testid="list-view"]');
        if (await listViewButton.isVisible().catch(() => false)) {
            await listViewButton.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('calendar-list-view.png', {
                fullPage: true,
                mask: [page.locator('time'), page.locator('[data-testid*="date"]')],
            });
        }
    });

    test('calendar add event modal', async ({ page }) => {
        // Click add event button
        const addButton = page.locator('[data-testid="add-event-button"], button:has-text("Add Event")');
        if (await addButton.isVisible().catch(() => false)) {
            await addButton.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('calendar-add-event-modal.png', {
                fullPage: true,
            });
        }
    });

    test('calendar event details view', async ({ page }) => {
        // Click on an event if any exists
        const firstEvent = page.locator('.fc-event, [data-testid="event-item"]').first();
        if (await firstEvent.isVisible().catch(() => false)) {
            await firstEvent.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('calendar-event-details.png', {
                fullPage: true,
                mask: [page.locator('time'), page.locator('[data-testid*="timestamp"]')],
            });
        }
    });

    test('calendar week view', async ({ page }) => {
        const weekViewButton = page.locator('button:has-text("Week"), [data-testid="week-view"]');
        if (await weekViewButton.isVisible().catch(() => false)) {
            await weekViewButton.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('calendar-week-view.png', {
                fullPage: true,
                mask: [page.locator('.fc-today'), page.locator('[data-testid*="current"]')],
            });
        }
    });
});

