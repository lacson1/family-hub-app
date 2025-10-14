import { test, expect } from '@playwright/test';
import { AuthPage } from './page-objects/AuthPage';
import { DashboardPage } from './page-objects/DashboardPage';
import { faker } from '@faker-js/faker';

test.describe('Authentication', () => {
    let authPage: AuthPage;
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
        authPage = new AuthPage(page);
        dashboardPage = new DashboardPage(page);
        await authPage.goto();
    });

    test('should display login page', async ({ page }) => {
        await expect(authPage.signInButton).toBeVisible();
        await expect(authPage.emailInput).toBeVisible();
        await expect(authPage.passwordInput).toBeVisible();
    });

    test('should register new user successfully', async ({ page }) => {
        const newUser = {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            password: 'TestPassword123!',
        };

        await authPage.register(newUser.name, newUser.email, newUser.password);

        // Should be redirected to dashboard after successful registration
        await authPage.expectLoggedIn();
    });

    test('should login with valid credentials', async ({ page }) => {
        const testUser = {
            email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
            password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
        };

        await authPage.login(testUser.email, testUser.password);

        // Should be redirected to dashboard
        await authPage.expectLoggedIn();
        await dashboardPage.expectDashboardLoaded();
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await authPage.login('invalid@example.com', 'wrongpassword');

        // Should show error message
        await authPage.expectLoginError();
    });

    test('should logout successfully', async ({ page }) => {
        const testUser = {
            email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
            password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
        };

        await authPage.login(testUser.email, testUser.password);
        await authPage.expectLoggedIn();

        await dashboardPage.logout();

        // Should be redirected to login page
        await expect(authPage.signInButton).toBeVisible();
    });

    test('should toggle between sign in and sign up forms', async ({ page }) => {
        await expect(authPage.signInButton).toBeVisible();

        await authPage.switchToSignUp();
        await expect(authPage.createAccountButton).toBeVisible();

        await authPage.switchToSignIn();
        await expect(authPage.signInButton).toBeVisible();
    });

    test('should persist session after page reload', async ({ page }) => {
        const testUser = {
            email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
            password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
        };

        await authPage.login(testUser.email, testUser.password);
        await authPage.expectLoggedIn();

        // Reload the page
        await page.reload();

        // Should still be logged in
        await authPage.expectLoggedIn();
    });
});

