import { Page, expect } from '@playwright/test';

export class ContactsPage {
    constructor(private page: Page) { }

    // Locators
    get addContactButton() {
        return this.page.getByRole('button', { name: /add contact|new contact|\+/i });
    }

    get contactNameInput() {
        return this.page.getByPlaceholder(/name/i);
    }

    get contactCategorySelect() {
        return this.page.locator('select[name*="category" i]').first();
    }

    get contactPhoneInput() {
        return this.page.getByPlaceholder(/phone/i);
    }

    get contactEmailInput() {
        return this.page.getByPlaceholder(/email/i);
    }

    get contactAddressInput() {
        return this.page.getByPlaceholder(/address/i);
    }

    get contactNotesInput() {
        return this.page.getByPlaceholder(/notes/i);
    }

    get saveContactButton() {
        return this.page.getByRole('button', { name: /save|create|add/i });
    }

    getContact(name: string) {
        return this.page.getByText(name);
    }

    getEditButton(name: string) {
        return this.page.locator(`button[aria-label*="edit" i]:near(:text("${name}"))`).first();
    }

    getDeleteButton(name: string) {
        return this.page.locator(`button[aria-label*="delete" i]:near(:text("${name}"))`).first();
    }

    getFavoriteButton(name: string) {
        return this.page.locator(`button[aria-label*="favorite" i]:near(:text("${name}"))`).first();
    }

    // Actions
    async goto() {
        await this.page.goto('/');
        await this.page.waitForLoadState('networkidle');
        // Navigate to contacts from dashboard
        await this.page.getByRole('button', { name: /contacts/i }).first().click();
        await this.page.waitForLoadState('networkidle');
    }

    async addContact(contact: { name: string; category: string; phone?: string; email?: string; address?: string }) {
        await this.addContactButton.click();
        await this.contactNameInput.fill(contact.name);
        await this.contactCategorySelect.selectOption({ label: contact.category });

        if (contact.phone) {
            await this.contactPhoneInput.fill(contact.phone);
        }

        if (contact.email) {
            await this.contactEmailInput.fill(contact.email);
        }

        if (contact.address) {
            await this.contactAddressInput.fill(contact.address);
        }

        await this.saveContactButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async editContact(oldName: string, newData: { name?: string; phone?: string; email?: string }) {
        await this.getEditButton(oldName).click();

        if (newData.name) {
            await this.contactNameInput.clear();
            await this.contactNameInput.fill(newData.name);
        }

        if (newData.phone) {
            await this.contactPhoneInput.clear();
            await this.contactPhoneInput.fill(newData.phone);
        }

        if (newData.email) {
            await this.contactEmailInput.clear();
            await this.contactEmailInput.fill(newData.email);
        }

        await this.saveContactButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async deleteContact(name: string) {
        await this.getDeleteButton(name).click();
        const confirmButton = this.page.getByRole('button', { name: /confirm|yes|delete/i });
        if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
            await confirmButton.click();
        }
        await this.page.waitForLoadState('networkidle');
    }

    async markAsFavorite(name: string) {
        await this.getFavoriteButton(name).click();
        await this.page.waitForLoadState('networkidle');
    }

    // Assertions
    async expectContactVisible(name: string) {
        await expect(this.getContact(name)).toBeVisible();
    }

    async expectContactNotVisible(name: string) {
        await expect(this.getContact(name)).not.toBeVisible();
    }
}

