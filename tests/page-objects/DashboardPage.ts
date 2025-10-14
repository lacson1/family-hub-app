import { Page, expect } from '@playwright/test';

export class DashboardPage {
    constructor(private page: Page) { }

    // Navigation buttons
    get tasksButton() {
        return this.page.getByRole('button', { name: /tasks/i }).first();
    }

    get calendarButton() {
        return this.page.getByRole('button', { name: /calendar/i }).first();
    }

    get familyTreeButton() {
        return this.page.getByRole('button', { name: /family/i }).first();
    }

    get shoppingButton() {
        return this.page.getByRole('button', { name: /shopping/i }).first();
    }

    get mealsButton() {
        return this.page.getByRole('button', { name: /meals/i }).first();
    }

    get moneyButton() {
        return this.page.getByRole('button', { name: /money|budget|transaction/i }).first();
    }

    get contactsButton() {
        return this.page.getByRole('button', { name: /contacts/i }).first();
    }

    get settingsButton() {
        return this.page.getByRole('button', { name: /settings/i }).first();
    }

    get logoutButton() {
        return this.page.getByRole('button', { name: /logout/i });
    }

    get notificationsButton() {
        return this.page.locator('[aria-label*="notification" i]');
    }

    get profileButton() {
        return this.page.locator('[aria-label*="profile" i]');
    }

    // Actions
    async goto() {
        await this.page.goto('/');
        await this.page.waitForLoadState('networkidle');
    }

    async navigateToTasks() {
        await this.tasksButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async navigateToCalendar() {
        await this.calendarButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async navigateToFamilyTree() {
        await this.familyTreeButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async navigateToShopping() {
        await this.shoppingButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async navigateToMeals() {
        await this.mealsButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async navigateToMoney() {
        await this.moneyButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async navigateToHome() {
        await this.page.goto('/');
        await this.page.waitForLoadState('networkidle');
    }

    async navigateToContacts() {
        await this.contactsButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async navigateToSettings() {
        await this.settingsButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async openNotifications() {
        await this.notificationsButton.click();
    }

    async logout() {
        await this.logoutButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    // Assertions
    async expectDashboardLoaded() {
        await expect(this.logoutButton).toBeVisible({ timeout: 10000 });
    }

    async expectOnTasksView() {
        await expect(this.page.getByText(/tasks/i).first()).toBeVisible();
    }

    async expectOnCalendarView() {
        await expect(this.page.getByText(/calendar|events/i).first()).toBeVisible();
    }

    async expectOnFamilyTreeView() {
        await expect(this.page.getByText(/family/i).first()).toBeVisible();
    }
}

