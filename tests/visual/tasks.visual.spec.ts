import { test, expect } from '@playwright/test';
import { AuthPage } from '../page-objects/AuthPage';
import { TasksPage } from '../page-objects/TasksPage';

test.describe('Tasks Visual Tests', () => {
    let authPage: AuthPage;
    let tasksPage: TasksPage;

    test.beforeEach(async ({ page }) => {
        authPage = new AuthPage(page);
        tasksPage = new TasksPage(page);

        // Login first
        await authPage.goto();
        const testUser = {
            email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
            password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
        };
        await authPage.login(testUser.email, testUser.password);
        await authPage.expectLoggedIn();

        // Navigate to tasks
        await tasksPage.goto();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
    });

    test('tasks list default view', async ({ page }) => {
        await expect(page).toHaveScreenshot('tasks-list-default.png', {
            fullPage: true,
            // Mask due dates and timestamps
            mask: [page.locator('[data-testid*="due-date"]'), page.locator('time')],
        });
    });

    test('tasks list with priority filter', async ({ page }) => {
        const highPriorityFilter = page.locator('[data-testid="priority-high"], button:has-text("High")');
        if (await highPriorityFilter.isVisible().catch(() => false)) {
            await highPriorityFilter.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('tasks-list-high-priority.png', {
                fullPage: true,
                mask: [page.locator('[data-testid*="due-date"]')],
            });
        }
    });

    test('tasks add task modal', async ({ page }) => {
        const addButton = page.locator('[data-testid="add-task-button"], button:has-text("Add Task")');
        if (await addButton.isVisible().catch(() => false)) {
            await addButton.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('tasks-add-modal.png', {
                fullPage: true,
            });
        }
    });

    test('tasks completed view', async ({ page }) => {
        const completedButton = page.locator('[data-testid="completed-tasks"], button:has-text("Completed")');
        if (await completedButton.isVisible().catch(() => false)) {
            await completedButton.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('tasks-completed-view.png', {
                fullPage: true,
                mask: [page.locator('[data-testid*="timestamp"]')],
            });
        }
    });

    test('tasks with assignment details', async ({ page }) => {
        const firstTask = page.locator('[data-testid="task-item"]').first();
        if (await firstTask.isVisible().catch(() => false)) {
            await firstTask.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('tasks-details-view.png', {
                fullPage: true,
                mask: [page.locator('[data-testid*="date"]'), page.locator('time')],
            });
        }
    });

    test('tasks by assignee view', async ({ page }) => {
        const assigneeView = page.locator('[data-testid="view-by-assignee"], button:has-text("By Person")');
        if (await assigneeView.isVisible().catch(() => false)) {
            await assigneeView.click();
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('tasks-by-assignee.png', {
                fullPage: true,
                mask: [page.locator('[data-testid*="due-date"]')],
            });
        }
    });
});

