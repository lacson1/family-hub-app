import { Page, expect } from '@playwright/test';

export class MoneyPage {
    constructor(private page: Page) { }

    // Locators
    get addTransactionButton() {
        return this.page.getByRole('button', { name: /add transaction|new transaction|\+/i });
    }

    get addBudgetButton() {
        return this.page.getByRole('button', { name: /add budget|new budget/i });
    }

    get transactionTypeSelect() {
        return this.page.locator('select[name*="type" i]').first();
    }

    get transactionCategoryInput() {
        return this.page.getByPlaceholder(/category/i);
    }

    get transactionAmountInput() {
        return this.page.getByPlaceholder(/amount/i);
    }

    get transactionDateInput() {
        return this.page.locator('input[type="date"]').first();
    }

    get transactionDescriptionInput() {
        return this.page.getByPlaceholder(/description/i);
    }

    get budgetCategoryInput() {
        return this.page.getByPlaceholder(/category/i);
    }

    get budgetAmountInput() {
        return this.page.getByPlaceholder(/amount/i);
    }

    get budgetPeriodSelect() {
        return this.page.locator('select[name*="period" i]').first();
    }

    get saveButton() {
        return this.page.getByRole('button', { name: /save|create|add/i });
    }

    getTransaction(description: string) {
        return this.page.getByText(description);
    }

    getBudget(category: string) {
        return this.page.getByText(category);
    }

    getDeleteButton(text: string) {
        return this.page.locator(`button[aria-label*="delete" i]:near(:text("${text}"))`).first();
    }

    // Actions
    async goto() {
        await this.page.goto('/');
        await this.page.waitForLoadState('networkidle');
        // Navigate to money from dashboard
        await this.page.getByRole('button', { name: /money|budget|transaction/i }).first().click();
        await this.page.waitForLoadState('networkidle');
    }

    async addTransaction(transaction: { type: string; category: string; amount: string; date: string; description?: string }) {
        await this.addTransactionButton.click();
        await this.transactionTypeSelect.selectOption({ label: transaction.type });
        await this.transactionCategoryInput.fill(transaction.category);
        await this.transactionAmountInput.fill(transaction.amount);
        await this.transactionDateInput.fill(transaction.date);

        if (transaction.description) {
            await this.transactionDescriptionInput.fill(transaction.description);
        }

        await this.saveButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async addBudget(budget: { category: string; amount: string; period: string }) {
        await this.addBudgetButton.click();
        await this.budgetCategoryInput.fill(budget.category);
        await this.budgetAmountInput.fill(budget.amount);
        await this.budgetPeriodSelect.selectOption({ label: budget.period });
        await this.saveButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async deleteTransaction(description: string) {
        await this.getDeleteButton(description).click();
        const confirmButton = this.page.getByRole('button', { name: /confirm|yes|delete/i });
        if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
            await confirmButton.click();
        }
        await this.page.waitForLoadState('networkidle');
    }

    // Assertions
    async expectTransactionVisible(description: string) {
        await expect(this.getTransaction(description)).toBeVisible();
    }

    async expectBudgetVisible(category: string) {
        await expect(this.getBudget(category)).toBeVisible();
    }

    async expectChartsVisible() {
        await expect(this.page.locator('canvas, svg').first()).toBeVisible();
    }
}

