import { test, expect } from '@playwright/test';
import { DashboardPage } from './page-objects/DashboardPage';
import { MoneyPage } from './page-objects/MoneyPage';
import { login } from './utils/auth-helpers';
import { faker } from '@faker-js/faker';

test.describe('Money Management', () => {
    let moneyPage: MoneyPage;
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
        await login(page);
        dashboardPage = new DashboardPage(page);
        moneyPage = new MoneyPage(page);
        await dashboardPage.navigateToMoney();
    });

    test('should display money management page', async () => {
        await expect(moneyPage.addTransactionButton).toBeVisible();
    });

    test('should add an income transaction', async () => {
        const description = faker.lorem.words(3);
        const today = new Date().toISOString().split('T')[0];

        await moneyPage.addTransaction({
            type: 'income',
            category: 'Salary',
            amount: '5000',
            date: today,
            description: description,
        });

        await moneyPage.expectTransactionVisible(description);
    });

    test('should add an expense transaction', async () => {
        const description = faker.lorem.words(3);
        const today = new Date().toISOString().split('T')[0];

        await moneyPage.addTransaction({
            type: 'expense',
            category: 'Groceries',
            amount: '150',
            date: today,
            description: description,
        });

        await moneyPage.expectTransactionVisible(description);
    });

    test('should create a budget', async () => {
        const category = faker.lorem.word();

        await moneyPage.addBudget({
            category: category,
            amount: '1000',
            period: 'monthly',
        });

        await moneyPage.expectBudgetVisible(category);
    });

    test('should delete a transaction', async () => {
        const description = faker.lorem.words(3);
        const today = new Date().toISOString().split('T')[0];

        // Add a transaction
        await moneyPage.addTransaction({
            type: 'expense',
            category: 'Entertainment',
            amount: '50',
            date: today,
            description: description,
        });

        await moneyPage.expectTransactionVisible(description);

        // Delete the transaction
        await moneyPage.deleteTransaction(description);

        // Transaction should no longer be visible
        await expect(moneyPage.getTransaction(description)).not.toBeVisible();
    });

    test('should display charts and analytics', async () => {
        // Add some transactions
        const today = new Date().toISOString().split('T')[0];

        await moneyPage.addTransaction({
            type: 'income',
            category: 'Salary',
            amount: '3000',
            date: today,
            description: 'Monthly salary',
        });

        await moneyPage.addTransaction({
            type: 'expense',
            category: 'Rent',
            amount: '1200',
            date: today,
            description: 'Monthly rent',
        });

        // Charts should be visible
        await moneyPage.expectChartsVisible();
    });
});

