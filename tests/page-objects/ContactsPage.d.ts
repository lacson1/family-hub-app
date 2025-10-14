import { Page } from '@playwright/test';
export declare class ContactsPage {
    private page;
    constructor(page: Page);
    get addContactButton(): import("playwright-core").Locator;
    get contactNameInput(): import("playwright-core").Locator;
    get contactCategorySelect(): import("playwright-core").Locator;
    get contactPhoneInput(): import("playwright-core").Locator;
    get contactEmailInput(): import("playwright-core").Locator;
    get contactAddressInput(): import("playwright-core").Locator;
    get contactNotesInput(): import("playwright-core").Locator;
    get saveContactButton(): import("playwright-core").Locator;
    getContact(name: string): import("playwright-core").Locator;
    getEditButton(name: string): import("playwright-core").Locator;
    getDeleteButton(name: string): import("playwright-core").Locator;
    getFavoriteButton(name: string): import("playwright-core").Locator;
    addContact(contact: {
        name: string;
        category: string;
        phone?: string;
        email?: string;
        address?: string;
    }): Promise<void>;
    editContact(oldName: string, newData: {
        name?: string;
        phone?: string;
        email?: string;
    }): Promise<void>;
    deleteContact(name: string): Promise<void>;
    markAsFavorite(name: string): Promise<void>;
    expectContactVisible(name: string): Promise<void>;
    expectContactNotVisible(name: string): Promise<void>;
}
