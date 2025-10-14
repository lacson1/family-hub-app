import { Page } from '@playwright/test';
import { apiRequest } from './api-helpers';

export interface TestUser {
    email: string;
    password: string;
    name: string;
}

export const DEFAULT_TEST_USER: TestUser = {
    email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
    password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
    name: process.env.TEST_USER_NAME || 'Test User',
};

/**
 * Login via UI
 */
export async function login(page: Page, user: TestUser = DEFAULT_TEST_USER) {
    await page.goto('/');

    // Check if already logged in
    const logoutButton = page.getByRole('button', { name: /logout/i });
    if (await logoutButton.isVisible().catch(() => false)) {
        return; // Already logged in
    }

    // Fill login form
    await page.getByPlaceholder(/email/i).fill(user.email);
    await page.getByPlaceholder(/password/i).fill(user.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for successful login (dashboard or main content)
    await page.waitForURL('**/*', { timeout: 5000 }).catch(() => { });
    await page.waitForLoadState('networkidle');
}

/**
 * Register a new user via UI
 */
export async function register(page: Page, user: TestUser) {
    await page.goto('/');

    // Click register/sign up link
    await page.getByRole('button', { name: /sign up/i }).click();

    // Fill registration form
    await page.getByPlaceholder(/name/i).fill(user.name);
    await page.getByPlaceholder(/email/i).fill(user.email);
    await page.getByPlaceholder(/password/i).first().fill(user.password);
    await page.getByPlaceholder(/confirm password/i).fill(user.password);

    // Submit
    await page.getByRole('button', { name: /create account/i }).click();

    // Wait for successful registration
    await page.waitForURL('**/*', { timeout: 5000 }).catch(() => { });
    await page.waitForLoadState('networkidle');
}

/**
 * Logout via UI
 */
export async function logout(page: Page) {
    const logoutButton = page.getByRole('button', { name: /logout/i });
    if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForLoadState('networkidle');
    }
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
    const logoutButton = page.getByRole('button', { name: /logout/i });
    return await logoutButton.isVisible().catch(() => false);
}

/**
 * Login via API and save auth state
 */
export async function loginViaAPI(user: TestUser = DEFAULT_TEST_USER) {
    const response = await apiRequest('/auth/login', {
        method: 'POST',
        data: {
            email: user.email,
            password: user.password,
        },
    });

    return response;
}

/**
 * Create test user via API
 */
export async function createTestUser(user: TestUser = DEFAULT_TEST_USER) {
    try {
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            data: {
                name: user.name,
                email: user.email,
                password: user.password,
            },
        });
        return response;
    } catch (error) {
        // User might already exist, ignore error
        console.log('User might already exist:', error);
    }
}

