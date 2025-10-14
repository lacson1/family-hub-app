import { Page } from '@playwright/test';
export declare class AuthPage {
    private page;
    constructor(page: Page);
    get emailInput(): import("playwright-core").Locator;
    get passwordInput(): import("playwright-core").Locator;
    get confirmPasswordInput(): import("playwright-core").Locator;
    get nameInput(): import("playwright-core").Locator;
    get signInButton(): import("playwright-core").Locator;
    get signUpButton(): import("playwright-core").Locator;
    get createAccountButton(): import("playwright-core").Locator;
    get switchToSignUpLink(): import("playwright-core").Locator;
    get switchToSignInLink(): import("playwright-core").Locator;
    goto(): Promise<void>;
    login(email: string, password: string): Promise<void>;
    register(name: string, email: string, password: string): Promise<void>;
    switchToSignUp(): Promise<void>;
    switchToSignIn(): Promise<void>;
    expectLoginError(): Promise<void>;
    expectLoggedIn(): Promise<void>;
}
