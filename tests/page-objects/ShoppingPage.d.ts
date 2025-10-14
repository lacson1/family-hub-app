import { Page } from '@playwright/test';
export declare class ShoppingPage {
    private page;
    constructor(page: Page);
    get addItemButton(): import("playwright-core").Locator;
    get itemNameInput(): import("playwright-core").Locator;
    get itemQuantityInput(): import("playwright-core").Locator;
    get itemCategorySelect(): import("playwright-core").Locator;
    get itemNotesInput(): import("playwright-core").Locator;
    get saveItemButton(): import("playwright-core").Locator;
    getItem(name: string): import("playwright-core").Locator;
    getItemCheckbox(name: string): import("playwright-core").Locator;
    getEditButton(name: string): import("playwright-core").Locator;
    getDeleteButton(name: string): import("playwright-core").Locator;
    addItem(item: {
        name: string;
        quantity: string;
        category?: string;
        notes?: string;
    }): Promise<void>;
    markAsPurchased(name: string): Promise<void>;
    editItem(oldName: string, newData: {
        name?: string;
        quantity?: string;
        category?: string;
    }): Promise<void>;
    deleteItem(name: string): Promise<void>;
    expectItemVisible(name: string): Promise<void>;
    expectItemNotVisible(name: string): Promise<void>;
    expectItemPurchased(name: string): Promise<void>;
}
