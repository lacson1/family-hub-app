import { test, expect } from '@playwright/test';
import { DashboardPage } from './page-objects/DashboardPage';
import { MealsPage } from './page-objects/MealsPage';
import { login } from './utils/auth-helpers';
import { faker } from '@faker-js/faker';

test.describe('Meal Planning', () => {
    let mealsPage: MealsPage;
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
        await login(page);
        dashboardPage = new DashboardPage(page);
        mealsPage = new MealsPage(page);
        await dashboardPage.navigateToMeals();
    });

    test('should display meals page', async () => {
        await expect(mealsPage.addMealButton).toBeVisible();
    });

    test('should add a new meal', async () => {
        const mealName = faker.lorem.words(2);
        const today = new Date().toISOString().split('T')[0];

        await mealsPage.addMeal({
            name: mealName,
            type: 'dinner',
            date: today,
            notes: faker.lorem.sentence(),
            servings: '4',
        });

        await mealsPage.expectMealVisible(mealName);
    });

    test('should edit a meal', async () => {
        const originalName = faker.lorem.words(2);
        const updatedName = faker.lorem.words(2);
        const today = new Date().toISOString().split('T')[0];

        // Add a meal
        await mealsPage.addMeal({
            name: originalName,
            type: 'lunch',
            date: today,
        });

        // Edit the meal
        await mealsPage.editMeal(originalName, {
            name: updatedName,
            type: 'dinner',
            notes: 'Updated notes',
        });

        await mealsPage.expectMealVisible(updatedName);
        await mealsPage.expectMealNotVisible(originalName);
    });

    test('should delete a meal', async () => {
        const mealName = faker.lorem.words(2);
        const today = new Date().toISOString().split('T')[0];

        // Add a meal
        await mealsPage.addMeal({
            name: mealName,
            type: 'breakfast',
            date: today,
        });

        await mealsPage.expectMealVisible(mealName);

        // Delete the meal
        await mealsPage.deleteMeal(mealName);

        await mealsPage.expectMealNotVisible(mealName);
    });

    test('should create meals of different types', async () => {
        const today = new Date().toISOString().split('T')[0];
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

        for (const type of mealTypes) {
            const mealName = `${type} - ${faker.lorem.words(2)}`;
            await mealsPage.addMeal({
                name: mealName,
                type: type,
                date: today,
            });

            await mealsPage.expectMealVisible(mealName);
        }
    });

    test('should mark meal as favorite', async () => {
        const mealName = faker.lorem.words(2);
        const today = new Date().toISOString().split('T')[0];

        // Add a meal
        await mealsPage.addMeal({
            name: mealName,
            type: 'dinner',
            date: today,
        });

        // Mark as favorite
        await mealsPage.markAsFavorite(mealName);

        await mealsPage.expectMealVisible(mealName);
    });
});

