import { test, expect } from '@playwright/test';
import { AuthPage } from './page-objects/AuthPage';
import { DashboardPage } from './page-objects/DashboardPage';
import { TasksPage } from './page-objects/TasksPage';
import { EventsPage } from './page-objects/EventsPage';
import { ShoppingPage } from './page-objects/ShoppingPage';
import { FamilyTreePage } from './page-objects/FamilyTreePage';
import { faker } from '@faker-js/faker';

test.describe('End-to-End Integration Tests', () => {
    test('complete user journey: login → create task → create event → add shopping → logout', async ({ page }) => {
        // 1. Login
        const authPage = new AuthPage(page);
        await authPage.goto();
        await authPage.login(
            process.env.TEST_USER_EMAIL || 'testuser@example.com',
            process.env.TEST_USER_PASSWORD || 'TestPassword123!'
        );
        await authPage.expectLoggedIn();

        // 2. Create a task
        const dashboardPage = new DashboardPage(page);
        const tasksPage = new TasksPage(page);
        await dashboardPage.navigateToTasks();

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

        // 3. Create an event
        const eventsPage = new EventsPage(page);
        await dashboardPage.navigateToCalendar();

        const eventTitle = faker.lorem.words(3);
        await eventsPage.addEvent({
            title: eventTitle,
            date: dueDate,
            time: '14:00',
            type: 'family',
        });
        await eventsPage.expectEventVisible(eventTitle);

        // 4. Add shopping item
        const shoppingPage = new ShoppingPage(page);
        await dashboardPage.navigateToShopping();

        const itemName = faker.commerce.productName();
        await shoppingPage.addItem({
            name: itemName,
            quantity: '2',
            category: 'Groceries',
        });
        await shoppingPage.expectItemVisible(itemName);

        // 5. Logout
        await dashboardPage.logout();
        await expect(authPage.signInButton).toBeVisible();
    });

    test('family management workflow: add members and create relationships', async ({ page }) => {
        // Login
        const authPage = new AuthPage(page);
        await authPage.goto();
        await authPage.login(
            process.env.TEST_USER_EMAIL || 'testuser@example.com',
            process.env.TEST_USER_PASSWORD || 'TestPassword123!'
        );

        // Navigate to family tree
        const dashboardPage = new DashboardPage(page);
        const familyTreePage = new FamilyTreePage(page);
        await dashboardPage.navigateToFamilyTree();

        // Add parent
        const parentName = faker.person.fullName();
        await familyTreePage.addMember({
            name: parentName,
            role: 'Parent',
            phone: faker.phone.number(),
            email: faker.internet.email(),
        });
        await familyTreePage.expectMemberVisible(parentName);

        // Add child
        const childName = faker.person.fullName();
        await familyTreePage.addMember({
            name: childName,
            role: 'Child',
        });
        await familyTreePage.expectMemberVisible(childName);

        // Create relationship
        await familyTreePage.addRelationship(parentName, childName, 'parent');
    });

    test('multi-feature data consistency', async ({ page }) => {
        // Login
        const authPage = new AuthPage(page);
        await authPage.goto();
        await authPage.login(
            process.env.TEST_USER_EMAIL || 'testuser@example.com',
            process.env.TEST_USER_PASSWORD || 'TestPassword123!'
        );

        const dashboardPage = new DashboardPage(page);

        // Create task
        const tasksPage = new TasksPage(page);
        await dashboardPage.navigateToTasks();
        const taskTitle = faker.lorem.words(3);
        const dueDate = new Date().toISOString().split('T')[0];
        await tasksPage.addTask({
            title: taskTitle,
            dueDate: dueDate,
        });

        // Navigate away and back
        await dashboardPage.navigateToCalendar();
        await dashboardPage.navigateToTasks();

        // Verify task still exists
        await tasksPage.expectTaskVisible(taskTitle);
    });

    test('navigation flow through all major features', async ({ page }) => {
        // Login
        const authPage = new AuthPage(page);
        await authPage.goto();
        await authPage.login(
            process.env.TEST_USER_EMAIL || 'testuser@example.com',
            process.env.TEST_USER_PASSWORD || 'TestPassword123!'
        );

        const dashboardPage = new DashboardPage(page);

        // Navigate through all features
        await dashboardPage.navigateToTasks();
        await dashboardPage.expectOnTasksView();

        await dashboardPage.navigateToCalendar();
        await dashboardPage.expectOnCalendarView();

        await dashboardPage.navigateToFamilyTree();
        await dashboardPage.expectOnFamilyTreeView();

        await dashboardPage.navigateToShopping();
        await expect(page.getByText(/shopping/i).first()).toBeVisible();

        await dashboardPage.navigateToMeals();
        await expect(page.getByText(/meal/i).first()).toBeVisible();

        await dashboardPage.navigateToMoney();
        await expect(page.getByText(/money|transaction|budget/i).first()).toBeVisible();

        await dashboardPage.navigateToContacts();
        await expect(page.getByText(/contact/i).first()).toBeVisible();
    });
});

