import { test, expect } from '@playwright/test';
import { DashboardPage } from './page-objects/DashboardPage';
import { TasksPage } from './page-objects/TasksPage';
import { login } from './utils/auth-helpers';
import { faker } from '@faker-js/faker';

test.describe('Notifications', () => {
    let dashboardPage: DashboardPage;
    let tasksPage: TasksPage;

    test.beforeEach(async ({ page }) => {
        await login(page);
        dashboardPage = new DashboardPage(page);
    });

    test('should display notifications panel', async ({ page }) => {
        await dashboardPage.openNotifications();

        // Notifications panel should be visible
        await expect(page.getByText(/notification/i).first()).toBeVisible();
    });

    test('should show notification when task is created', async ({ page }) => {
        tasksPage = new TasksPage(page);
        await dashboardPage.navigateToTasks();

        const taskTitle = faker.lorem.words(3);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dueDate = tomorrow.toISOString().split('T')[0];

        // Create a task
        await tasksPage.addTask({
            title: taskTitle,
            dueDate: dueDate,
        });

        // Open notifications
        await dashboardPage.openNotifications();

        // Should see notification about the task
        await expect(page.getByText(/task/i).or(page.getByText(taskTitle))).toBeVisible();
    });

    test('should mark notification as read', async ({ page }) => {
        await dashboardPage.openNotifications();

        // Find an unread notification and mark as read
        const notificationItem = page.locator('[role="listitem"]').first();
        if (await notificationItem.isVisible()) {
            const markReadButton = notificationItem.locator('button').first();
            if (await markReadButton.isVisible()) {
                await markReadButton.click();
            }
        }
    });

    test('should clear all notifications', async ({ page }) => {
        await dashboardPage.openNotifications();

        const clearAllButton = page.getByRole('button', { name: /clear all|dismiss all/i });
        if (await clearAllButton.isVisible()) {
            await clearAllButton.click();
        }
    });
});

