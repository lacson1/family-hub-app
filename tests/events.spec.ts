import { test, expect } from '@playwright/test';
import { DashboardPage } from './page-objects/DashboardPage';
import { EventsPage } from './page-objects/EventsPage';
import { login } from './utils/auth-helpers';
import { faker } from '@faker-js/faker';

test.describe('Events Management', () => {
    let eventsPage: EventsPage;
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
        await login(page);
        dashboardPage = new DashboardPage(page);
        eventsPage = new EventsPage(page);
        await dashboardPage.navigateToCalendar();
    });

    test('should display calendar/events page', async () => {
        await dashboardPage.expectOnCalendarView();
        await expect(eventsPage.addEventButton).toBeVisible();
    });

    test('should create a new event', async () => {
        const eventTitle = faker.lorem.words(3);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const eventDate = tomorrow.toISOString().split('T')[0];

        await eventsPage.addEvent({
            title: eventTitle,
            date: eventDate,
            time: '14:00',
            type: 'family',
            description: faker.lorem.sentence(),
        });

        await eventsPage.expectEventVisible(eventTitle);
    });

    test('should edit an existing event', async () => {
        const originalTitle = faker.lorem.words(3);
        const updatedTitle = faker.lorem.words(3);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const eventDate = tomorrow.toISOString().split('T')[0];

        // Create an event first
        await eventsPage.addEvent({
            title: originalTitle,
            date: eventDate,
            time: '10:00',
            type: 'personal',
        });

        // Edit the event
        await eventsPage.editEvent(originalTitle, {
            title: updatedTitle,
            time: '15:00',
        });

        await eventsPage.expectEventVisible(updatedTitle);
        await eventsPage.expectEventNotVisible(originalTitle);
    });

    test('should delete an event', async () => {
        const eventTitle = faker.lorem.words(3);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const eventDate = tomorrow.toISOString().split('T')[0];

        // Create an event
        await eventsPage.addEvent({
            title: eventTitle,
            date: eventDate,
            time: '09:00',
        });

        await eventsPage.expectEventVisible(eventTitle);

        // Delete the event
        await eventsPage.deleteEvent(eventTitle);

        await eventsPage.expectEventNotVisible(eventTitle);
    });

    test('should create events of different types', async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const eventDate = tomorrow.toISOString().split('T')[0];

        const eventTypes = ['family', 'personal', 'work'];

        for (const type of eventTypes) {
            const eventTitle = `${type} - ${faker.lorem.words(2)}`;
            await eventsPage.addEvent({
                title: eventTitle,
                date: eventDate,
                time: '12:00',
                type: type,
            });

            await eventsPage.expectEventVisible(eventTitle);
        }
    });
});

