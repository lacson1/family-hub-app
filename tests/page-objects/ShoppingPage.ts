import { Page, expect } from '@playwright/test';

export class ShoppingPage {
    constructor(private page: Page) { }

    // Locators
    get addItemButton() {
        return this.page.getByRole('button', { name: /add item|new item|\+/i });
    }

    get itemNameInput() {
        return this.page.getByPlaceholder(/name|item/i);
    }

    get itemQuantityInput() {
        return this.page.getByPlaceholder(/quantity/i);
    }

    get itemCategorySelect() {
        return this.page.locator('select[name*="category" i]').first();
    }

    get itemNotesInput() {
        return this.page.getByPlaceholder(/notes/i);
    }

    get saveItemButton() {
        return this.page.getByRole('button', { name: /save|create|add/i });
    }

    getItem(name: string) {
        return this.page.getByText(name);
    }

    getItemCheckbox(name: string) {
        return this.page.locator(`[aria-label*="${name}" i] input[type="checkbox"]`);
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
        // Navigate to shopping from dashboard
        await this.page.getByRole('button', { name: /shopping/i }).first().click();
        await this.page.waitForLoadState('networkidle');
    }

    async addItem(item: { name: string; quantity: string; category?: string; notes?: string }) {
        await this.addItemButton.click();
        await this.itemNameInput.fill(item.name);
        await this.itemQuantityInput.fill(item.quantity);

        if (item.category) {
            await this.itemCategorySelect.selectOption({ label: item.category });
        }

        if (item.notes) {
            await this.itemNotesInput.fill(item.notes);
        }

        await this.saveItemButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async markAsPurchased(name: string) {
        const checkbox = this.getItemCheckbox(name);
        await checkbox.check();
        await this.page.waitForLoadState('networkidle');
    }

    async editItem(oldName: string, newData: { name?: string; quantity?: string; category?: string }) {
        await this.getEditButton(oldName).click();

        if (newData.name) {
            await this.itemNameInput.clear();
            await this.itemNameInput.fill(newData.name);
        }

        if (newData.quantity) {
            await this.itemQuantityInput.clear();
            await this.itemQuantityInput.fill(newData.quantity);
        }

        if (newData.category) {
            await this.itemCategorySelect.selectOption({ label: newData.category });
        }

        await this.saveItemButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async deleteItem(name: string) {
        await this.getDeleteButton(name).click();
        const confirmButton = this.page.getByRole('button', { name: /confirm|yes|delete/i });
        if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
            await confirmButton.click();
        }
        await this.page.waitForLoadState('networkidle');
    }

    // Assertions
    async expectItemVisible(name: string) {
        await expect(this.getItem(name)).toBeVisible();
    }

    async expectItemNotVisible(name: string) {
        await expect(this.getItem(name)).not.toBeVisible();
    }

    async expectItemPurchased(name: string) {
        const checkbox = this.getItemCheckbox(name);
        await expect(checkbox).toBeChecked();
    }
}

