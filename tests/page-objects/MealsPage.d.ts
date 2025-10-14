import { Page } from '@playwright/test';
export declare class MealsPage {
    private page;
    constructor(page: Page);
    get addMealButton(): import("playwright-core").Locator;
    get mealNameInput(): import("playwright-core").Locator;
    get mealTypeSelect(): import("playwright-core").Locator;
    get mealDateInput(): import("playwright-core").Locator;
    get mealNotesInput(): import("playwright-core").Locator;
    get mealPrepTimeInput(): import("playwright-core").Locator;
    get mealCookTimeInput(): import("playwright-core").Locator;
    get mealServingsInput(): import("playwright-core").Locator;
    get saveMealButton(): import("playwright-core").Locator;
    get favoriteButton(): import("playwright-core").Locator;
    getMeal(name: string): import("playwright-core").Locator;
    getEditButton(name: string): import("playwright-core").Locator;
    getDeleteButton(name: string): import("playwright-core").Locator;
    addMeal(meal: {
        name: string;
        type: string;
        date: string;
        notes?: string;
        servings?: string;
    }): Promise<void>;
    editMeal(oldName: string, newData: {
        name?: string;
        type?: string;
        notes?: string;
    }): Promise<void>;
    deleteMeal(name: string): Promise<void>;
    markAsFavorite(name: string): Promise<void>;
    expectMealVisible(name: string): Promise<void>;
    expectMealNotVisible(name: string): Promise<void>;
}
