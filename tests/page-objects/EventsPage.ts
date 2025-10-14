import { Page, expect } from '@playwright/test';

export class EventsPage {
    constructor(private page: Page) { }

    // Locators
    get addEventButton() {
        return this.page.getByRole('button', { name: /add event|new event|\+/i });
    }

    get eventTitleInput() {
        return this.page.getByPlaceholder(/title/i);
    }

    get eventDateInput() {
        return this.page.locator('input[type="date"]').first();
    }

    get eventTimeInput() {
        return this.page.locator('input[type="time"]').first();
    }

    get eventTypeSelect() {
        return this.page.locator('select[name*="type" i]').first();
    }

    get eventDescriptionInput() {
        return this.page.getByPlaceholder(/description/i);
    }

    get saveEventButton() {
        return this.page.getByRole('button', { name: /save|create|add/i });
    }

    getEvent(title: string) {
        return this.page.getByText(title);
    }

    getEditButton(title: string) {
        return this.page.locator(`button[aria-label*="edit" i]:near(:text("${title}"))`).first();
    }

    getDeleteButton(title: string) {
        return this.page.locator(`button[aria-label*="delete" i]:near(:text("${title}"))`).first();
    }

    // Actions
    async goto() {
        await this.page.goto('/');
        await this.page.waitForLoadState('networkidle');
        // Navigate to calendar/events from dashboard
        await this.page.getByRole('button', { name: /calendar/i }).first().click();
        await this.page.waitForLoadState('networkidle');
    }

    async addEvent(event: { title: string; date: string; time: string; type?: string; description?: string }) {
        await this.addEventButton.click();
        await this.eventTitleInput.fill(event.title);
        await this.eventDateInput.fill(event.date);
        await this.eventTimeInput.fill(event.time);

        if (event.type) {
            await this.eventTypeSelect.selectOption({ label: event.type });
        }

        if (event.description) {
            await this.eventDescriptionInput.fill(event.description);
        }

        await this.saveEventButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async editEvent(oldTitle: string, newData: { title?: string; date?: string; time?: string }) {
        await this.getEditButton(oldTitle).click();

        if (newData.title) {
            await this.eventTitleInput.clear();
            await this.eventTitleInput.fill(newData.title);
        }

        if (newData.date) {
            await this.eventDateInput.fill(newData.date);
        }

        if (newData.time) {
            await this.eventTimeInput.fill(newData.time);
        }

        await this.saveEventButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async deleteEvent(title: string) {
        await this.getDeleteButton(title).click();
        const confirmButton = this.page.getByRole('button', { name: /confirm|yes|delete/i });
        if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
            await confirmButton.click();
        }
        await this.page.waitForLoadState('networkidle');
    }

    // Assertions
    async expectEventVisible(title: string) {
        await expect(this.getEvent(title)).toBeVisible();
    }

    async expectEventNotVisible(title: string) {
        await expect(this.getEvent(title)).not.toBeVisible();
    }
}

