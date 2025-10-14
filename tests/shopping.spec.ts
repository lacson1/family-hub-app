import { test, expect } from '@playwright/test';
import { DashboardPage } from './page-objects/DashboardPage';
import { ShoppingPage } from './page-objects/ShoppingPage';
import { login } from './utils/auth-helpers';
import { faker } from '@faker-js/faker';

test.describe('Shopping List Management', () => {
    let shoppingPage: ShoppingPage;
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
        await login(page);
        dashboardPage = new DashboardPage(page);
        shoppingPage = new ShoppingPage(page);
        await dashboardPage.navigateToShopping();
    });

    test('should display shopping list page', async () => {
        await expect(shoppingPage.addItemButton).toBeVisible();
    });

    test('should add a new shopping item', async () => {
        const itemName = faker.commerce.productName();

        await shoppingPage.addItem({
            name: itemName,
            quantity: '2',
            category: 'Groceries',
            notes: faker.lorem.sentence(),
        });

        await shoppingPage.expectItemVisible(itemName);
    });

    test('should mark item as purchased', async () => {
        const itemName = faker.commerce.productName();

        // Add an item
        await shoppingPage.addItem({
            name: itemName,
            quantity: '1',
            category: 'Household',
        });

        // Mark as purchased
        await shoppingPage.markAsPurchased(itemName);

        await shoppingPage.expectItemPurchased(itemName);
    });

    test('should edit shopping item', async () => {
        const originalName = faker.commerce.productName();
        const updatedName = faker.commerce.productName();

        // Add an item
        await shoppingPage.addItem({
            name: originalName,
            quantity: '1',
            category: 'Personal',
        });

        // Edit the item
        await shoppingPage.editItem(originalName, {
            name: updatedName,
            quantity: '3',
            category: 'Groceries',
        });

        await shoppingPage.expectItemVisible(updatedName);
        await shoppingPage.expectItemNotVisible(originalName);
    });

    test('should delete shopping item', async () => {
        const itemName = faker.commerce.productName();

        // Add an item
        await shoppingPage.addItem({
            name: itemName,
            quantity: '2',
            category: 'Other',
        });

        await shoppingPage.expectItemVisible(itemName);

        // Delete the item
        await shoppingPage.deleteItem(itemName);

        await shoppingPage.expectItemNotVisible(itemName);
    });

    test('should add items in different categories', async () => {
        const categories = ['Groceries', 'Household', 'Personal', 'Other'];

        for (const category of categories) {
            const itemName = `${category} - ${faker.commerce.product()}`;
            await shoppingPage.addItem({
                name: itemName,
                quantity: '1',
                category: category,
            });

            await shoppingPage.expectItemVisible(itemName);
        }
    });
});

