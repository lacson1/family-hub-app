import { Page } from '@playwright/test';
export declare class EventsPage {
    private page;
    constructor(page: Page);
    get addEventButton(): import("playwright-core").Locator;
    get eventTitleInput(): import("playwright-core").Locator;
    get eventDateInput(): import("playwright-core").Locator;
    get eventTimeInput(): import("playwright-core").Locator;
    get eventTypeSelect(): import("playwright-core").Locator;
    get eventDescriptionInput(): import("playwright-core").Locator;
    get saveEventButton(): import("playwright-core").Locator;
    getEvent(title: string): import("playwright-core").Locator;
    getEditButton(title: string): import("playwright-core").Locator;
    getDeleteButton(title: string): import("playwright-core").Locator;
    addEvent(event: {
        title: string;
        date: string;
        time: string;
        type?: string;
        description?: string;
    }): Promise<void>;
    editEvent(oldTitle: string, newData: {
        title?: string;
        date?: string;
        time?: string;
    }): Promise<void>;
    deleteEvent(title: string): Promise<void>;
    expectEventVisible(title: string): Promise<void>;
    expectEventNotVisible(title: string): Promise<void>;
}
