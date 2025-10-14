import { Page } from '@playwright/test';
export interface TestUser {
    email: string;
    password: string;
    name: string;
}
export declare const DEFAULT_TEST_USER: TestUser;
/**
 * Login via UI
 */
export declare function login(page: Page, user?: TestUser): Promise<void>;
/**
 * Register a new user via UI
 */
export declare function register(page: Page, user: TestUser): Promise<void>;
/**
 * Logout via UI
 */
export declare function logout(page: Page): Promise<void>;
/**
 * Check if user is logged in
 */
export declare function isLoggedIn(page: Page): Promise<boolean>;
/**
 * Login via API and save auth state
 */
export declare function loginViaAPI(user?: TestUser): Promise<unknown>;
/**
 * Create test user via API
 */
export declare function createTestUser(user?: TestUser): Promise<unknown>;
