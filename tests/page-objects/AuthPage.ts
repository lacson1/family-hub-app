import { Page, expect } from '@playwright/test';

export class AuthPage {
    constructor(private page: Page) { }

    // Locators
    get emailInput() {
        return this.page.getByPlaceholder(/email/i);
    }

    get passwordInput() {
        return this.page.getByPlaceholder(/password/i).first();
    }

    get confirmPasswordInput() {
        return this.page.getByPlaceholder(/confirm password/i);
    }

    get nameInput() {
        return this.page.getByPlaceholder(/name/i);
    }

    get signInButton() {
        return this.page.getByRole('button', { name: /sign in/i });
    }

    get signUpButton() {
        return this.page.getByRole('button', { name: /sign up/i });
    }

    get createAccountButton() {
        return this.page.getByRole('button', { name: /create account/i });
    }

    get switchToSignUpLink() {
        return this.page.getByText(/don't have an account/i);
    }

    get switchToSignInLink() {
        return this.page.getByText(/already have an account/i);
    }

    // Actions
    async goto() {
        await this.page.goto('/');
    }

    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.signInButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async register(name: string, email: string, password: string) {
        // Switch to sign up form if needed
        if (await this.signUpButton.isVisible()) {
            await this.signUpButton.click();
        }

        await this.nameInput.fill(name);
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.confirmPasswordInput.fill(password);
        await this.createAccountButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async switchToSignUp() {
        await this.signUpButton.click();
    }

    async switchToSignIn() {
        if (await this.switchToSignInLink.isVisible()) {
            await this.switchToSignInLink.click();
        }
    }

    // Assertions
    async expectLoginError() {
        await expect(this.page.getByText(/invalid|error|wrong/i)).toBeVisible();
    }

    async expectLoggedIn() {
        await expect(this.page.getByRole('button', { name: /logout/i })).toBeVisible({ timeout: 10000 });
    }
}

