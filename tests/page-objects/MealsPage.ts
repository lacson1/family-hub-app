import { Page, expect } from '@playwright/test';

export class MealsPage {
    constructor(private page: Page) { }

    // Locators
    get addMealButton() {
        return this.page.getByRole('button', { name: /add meal|new meal|\+/i });
    }

    get mealNameInput() {
        return this.page.getByPlaceholder(/name|meal/i);
    }

    get mealTypeSelect() {
        return this.page.locator('select[name*="type" i]').first();
    }

    get mealDateInput() {
        return this.page.locator('input[type="date"]').first();
    }

    get mealNotesInput() {
        return this.page.getByPlaceholder(/notes/i);
    }

    get mealPrepTimeInput() {
        return this.page.getByPlaceholder(/prep time/i);
    }

    get mealCookTimeInput() {
        return this.page.getByPlaceholder(/cook time/i);
    }

    get mealServingsInput() {
        return this.page.getByPlaceholder(/servings/i);
    }

    get saveMealButton() {
        return this.page.getByRole('button', { name: /save|create|add/i });
    }

    get favoriteButton() {
        return this.page.getByRole('button', { name: /favorite/i });
    }

    getMeal(name: string) {
        return this.page.getByText(name);
    }

    getEditButton(name: string) {
        return this.page.locator(`button[aria-label*="edit" i]:near(:text("${name}"))`).first();
    }

    getDeleteButton(name: string) {
        return this.page.locator(`button[aria-label*="delete" i]:near(:text("${name}"))`).first();
    }

    // Actions
    async goto() {
        await this.page.goto('/');
        await this.page.waitForLoadState('networkidle');
        // Navigate to meals from dashboard
        await this.page.getByRole('button', { name: /meals/i }).first().click();
        await this.page.waitForLoadState('networkidle');
    }

    async addMeal(meal: { name: string; type: string; date: string; notes?: string; servings?: string }) {
        await this.addMealButton.click();
        await this.mealNameInput.fill(meal.name);
        await this.mealTypeSelect.selectOption({ label: meal.type });
        await this.mealDateInput.fill(meal.date);

        if (meal.notes) {
            await this.mealNotesInput.fill(meal.notes);
        }

        if (meal.servings) {
            await this.mealServingsInput.fill(meal.servings);
        }

        await this.saveMealButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async editMeal(oldName: string, newData: { name?: string; type?: string; notes?: string }) {
        await this.getEditButton(oldName).click();

        if (newData.name) {
            await this.mealNameInput.clear();
            await this.mealNameInput.fill(newData.name);
        }

        if (newData.type) {
            await this.mealTypeSelect.selectOption({ label: newData.type });
        }

        if (newData.notes) {
            await this.mealNotesInput.fill(newData.notes);
        }

        await this.saveMealButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async deleteMeal(name: string) {
        await this.getDeleteButton(name).click();
        const confirmButton = this.page.getByRole('button', { name: /confirm|yes|delete/i });
        if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
            await confirmButton.click();
        }
        await this.page.waitForLoadState('networkidle');
    }

    async markAsFavorite(name: string) {
        await this.getMeal(name).click();
        await this.favoriteButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    // Assertions
    async expectMealVisible(name: string) {
        await expect(this.getMeal(name)).toBeVisible();
    }

    async expectMealNotVisible(name: string) {
        await expect(this.getMeal(name)).not.toBeVisible();
    }
}

