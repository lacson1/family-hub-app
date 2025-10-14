import { Page, expect } from '@playwright/test';

export class TasksPage {
    constructor(private page: Page) { }

    // Locators
    get addTaskButton() {
        return this.page.getByRole('button', { name: /add task|new task|\+/i });
    }

    get taskTitleInput() {
        return this.page.getByPlaceholder(/title/i);
    }

    get taskAssigneeSelect() {
        return this.page.locator('select[name*="assign" i], select[name*="member" i]').first();
    }

    get taskDueDateInput() {
        return this.page.locator('input[type="date"]').first();
    }

    get taskPrioritySelect() {
        return this.page.locator('select[name*="priority" i]').first();
    }

    get saveTaskButton() {
        return this.page.getByRole('button', { name: /save|create|add/i });
    }

    get cancelButton() {
        return this.page.getByRole('button', { name: /cancel/i });
    }

    getTask(title: string) {
        return this.page.getByText(title);
    }

    getTaskCheckbox(title: string) {
        return this.page.locator(`[aria-label*="${title}" i] input[type="checkbox"]`);
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
        // Navigate to tasks from dashboard
        await this.page.getByRole('button', { name: /tasks/i }).first().click();
        await this.page.waitForLoadState('networkidle');
    }

    async addTask(task: { title: string; assignee?: string; dueDate?: string; priority?: string }) {
        await this.addTaskButton.click();
        await this.taskTitleInput.fill(task.title);

        if (task.assignee) {
            await this.taskAssigneeSelect.selectOption({ label: task.assignee });
        }

        if (task.dueDate) {
            await this.taskDueDateInput.fill(task.dueDate);
        }

        if (task.priority) {
            await this.taskPrioritySelect.selectOption({ label: task.priority });
        }

        await this.saveTaskButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async editTask(oldTitle: string, newData: { title?: string; priority?: string }) {
        await this.getEditButton(oldTitle).click();

        if (newData.title) {
            await this.taskTitleInput.clear();
            await this.taskTitleInput.fill(newData.title);
        }

        if (newData.priority) {
            await this.taskPrioritySelect.selectOption({ label: newData.priority });
        }

        await this.saveTaskButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async completeTask(title: string) {
        const checkbox = this.getTaskCheckbox(title);
        await checkbox.check();
        await this.page.waitForLoadState('networkidle');
    }

    async deleteTask(title: string) {
        await this.getDeleteButton(title).click();
        // Confirm deletion if modal appears
        const confirmButton = this.page.getByRole('button', { name: /confirm|yes|delete/i });
        if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
            await confirmButton.click();
        }
        await this.page.waitForLoadState('networkidle');
    }

    // Assertions
    async expectTaskVisible(title: string) {
        await expect(this.getTask(title)).toBeVisible();
    }

    async expectTaskNotVisible(title: string) {
        await expect(this.getTask(title)).not.toBeVisible();
    }

    async expectTaskCompleted(title: string) {
        const checkbox = this.getTaskCheckbox(title);
        await expect(checkbox).toBeChecked();
    }
}

