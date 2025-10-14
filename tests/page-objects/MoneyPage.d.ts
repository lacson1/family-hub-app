import { Page } from '@playwright/test';
export declare class MoneyPage {
    private page;
    constructor(page: Page);
    get addTransactionButton(): import("playwright-core").Locator;
    get addBudgetButton(): import("playwright-core").Locator;
    get transactionTypeSelect(): import("playwright-core").Locator;
    get transactionCategoryInput(): import("playwright-core").Locator;
    get transactionAmountInput(): import("playwright-core").Locator;
    get transactionDateInput(): import("playwright-core").Locator;
    get transactionDescriptionInput(): import("playwright-core").Locator;
    get budgetCategoryInput(): import("playwright-core").Locator;
    get budgetAmountInput(): import("playwright-core").Locator;
    get budgetPeriodSelect(): import("playwright-core").Locator;
    get saveButton(): import("playwright-core").Locator;
    getTransaction(description: string): import("playwright-core").Locator;
    getBudget(category: string): import("playwright-core").Locator;
    getDeleteButton(text: string): import("playwright-core").Locator;
    addTransaction(transaction: {
        type: string;
        category: string;
        amount: string;
        date: string;
        description?: string;
    }): Promise<void>;
    addBudget(budget: {
        category: string;
        amount: string;
        period: string;
    }): Promise<void>;
    deleteTransaction(description: string): Promise<void>;
    expectTransactionVisible(description: string): Promise<void>;
    expectBudgetVisible(category: string): Promise<void>;
    expectChartsVisible(): Promise<void>;
}
