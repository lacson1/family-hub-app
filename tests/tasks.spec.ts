import { test, expect } from '@playwright/test';
import { AuthPage } from './page-objects/AuthPage';
import { DashboardPage } from './page-objects/DashboardPage';
import { TasksPage } from './page-objects/TasksPage';
import { login } from './utils/auth-helpers';
import { faker } from '@faker-js/faker';

test.describe('Tasks Management', () => {
    let tasksPage: TasksPage;
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
        await login(page);
        dashboardPage = new DashboardPage(page);
        tasksPage = new TasksPage(page);
        await dashboardPage.navigateToTasks();
    });

    test('should display tasks page', async ({ page }) => {
        await dashboardPage.expectOnTasksView();
        await expect(tasksPage.addTaskButton).toBeVisible();
    });

    test('should create a new task', async ({ page }) => {
        const taskTitle = faker.lorem.words(3);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dueDate = tomorrow.toISOString().split('T')[0];

        await tasksPage.addTask({
            title: taskTitle,
            dueDate: dueDate,
            priority: 'high',
        });

        await tasksPage.expectTaskVisible(taskTitle);
    });

    test('should edit an existing task', async ({ page }) => {
        const originalTitle = faker.lorem.words(3);
        const updatedTitle = faker.lorem.words(3);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dueDate = tomorrow.toISOString().split('T')[0];

        // Create a task first
        await tasksPage.addTask({
            title: originalTitle,
            dueDate: dueDate,
        });

        // Edit the task
        await tasksPage.editTask(originalTitle, {
            title: updatedTitle,
            priority: 'high',
        });

        await tasksPage.expectTaskVisible(updatedTitle);
        await tasksPage.expectTaskNotVisible(originalTitle);
    });

    test('should mark task as complete', async ({ page }) => {
        const taskTitle = faker.lorem.words(3);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dueDate = tomorrow.toISOString().split('T')[0];

        // Create a task
        await tasksPage.addTask({
            title: taskTitle,
            dueDate: dueDate,
        });

        // Mark as complete
        await tasksPage.completeTask(taskTitle);

        await tasksPage.expectTaskCompleted(taskTitle);
    });

    test('should delete a task', async ({ page }) => {
        const taskTitle = faker.lorem.words(3);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dueDate = tomorrow.toISOString().split('T')[0];

        // Create a task
        await tasksPage.addTask({
            title: taskTitle,
            dueDate: dueDate,
        });

        await tasksPage.expectTaskVisible(taskTitle);

        // Delete the task
        await tasksPage.deleteTask(taskTitle);

        await tasksPage.expectTaskNotVisible(taskTitle);
    });

    test('should create task with all fields', async ({ page }) => {
        const taskTitle = faker.lorem.words(4);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 7);
        const dueDate = tomorrow.toISOString().split('T')[0];

        await tasksPage.addTask({
            title: taskTitle,
            assignee: 'John Doe',
            dueDate: dueDate,
            priority: 'medium',
        });

        await tasksPage.expectTaskVisible(taskTitle);
    });
});

