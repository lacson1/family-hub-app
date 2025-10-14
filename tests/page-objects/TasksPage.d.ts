import { Page } from '@playwright/test';
export declare class TasksPage {
    private page;
    constructor(page: Page);
    get addTaskButton(): import("playwright-core").Locator;
    get taskTitleInput(): import("playwright-core").Locator;
    get taskAssigneeSelect(): import("playwright-core").Locator;
    get taskDueDateInput(): import("playwright-core").Locator;
    get taskPrioritySelect(): import("playwright-core").Locator;
    get saveTaskButton(): import("playwright-core").Locator;
    get cancelButton(): import("playwright-core").Locator;
    getTask(title: string): import("playwright-core").Locator;
    getTaskCheckbox(title: string): import("playwright-core").Locator;
    getEditButton(title: string): import("playwright-core").Locator;
    getDeleteButton(title: string): import("playwright-core").Locator;
    addTask(task: {
        title: string;
        assignee?: string;
        dueDate?: string;
        priority?: string;
    }): Promise<void>;
    editTask(oldTitle: string, newData: {
        title?: string;
        priority?: string;
    }): Promise<void>;
    completeTask(title: string): Promise<void>;
    deleteTask(title: string): Promise<void>;
    expectTaskVisible(title: string): Promise<void>;
    expectTaskNotVisible(title: string): Promise<void>;
    expectTaskCompleted(title: string): Promise<void>;
}
