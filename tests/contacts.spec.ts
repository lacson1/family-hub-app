import { test, expect } from '@playwright/test';
import { DashboardPage } from './page-objects/DashboardPage';
import { ContactsPage } from './page-objects/ContactsPage';
import { login } from './utils/auth-helpers';
import { faker } from '@faker-js/faker';

test.describe('Contacts Management', () => {
    let contactsPage: ContactsPage;
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
        await login(page);
        dashboardPage = new DashboardPage(page);
        contactsPage = new ContactsPage(page);
        await dashboardPage.navigateToContacts();
    });

    test('should display contacts page', async () => {
        await expect(contactsPage.addContactButton).toBeVisible();
    });

    test('should add a new contact', async () => {
        const contactName = faker.person.fullName();

        await contactsPage.addContact({
            name: contactName,
            category: 'Family',
            phone: faker.phone.number(),
            email: faker.internet.email(),
            address: faker.location.streetAddress(),
        });

        await contactsPage.expectContactVisible(contactName);
    });

    test('should edit a contact', async () => {
        const originalName = faker.person.fullName();
        const updatedName = faker.person.fullName();

        // Add a contact
        await contactsPage.addContact({
            name: originalName,
            category: 'Friends',
            phone: faker.phone.number(),
        });

        // Edit the contact
        await contactsPage.editContact(originalName, {
            name: updatedName,
            phone: faker.phone.number(),
            email: faker.internet.email(),
        });

        await contactsPage.expectContactVisible(updatedName);
        await contactsPage.expectContactNotVisible(originalName);
    });

    test('should delete a contact', async () => {
        const contactName = faker.person.fullName();

        // Add a contact
        await contactsPage.addContact({
            name: contactName,
            category: 'Work',
            phone: faker.phone.number(),
        });

        await contactsPage.expectContactVisible(contactName);

        // Delete the contact
        await contactsPage.deleteContact(contactName);

        await contactsPage.expectContactNotVisible(contactName);
    });

    test('should mark contact as favorite', async () => {
        const contactName = faker.person.fullName();

        // Add a contact
        await contactsPage.addContact({
            name: contactName,
            category: 'Family',
            phone: faker.phone.number(),
        });

        // Mark as favorite
        await contactsPage.markAsFavorite(contactName);

        await contactsPage.expectContactVisible(contactName);
    });

    test('should add contacts in different categories', async () => {
        const categories = ['Family', 'Friends', 'Medical', 'Services', 'Emergency'];

        for (const category of categories) {
            const contactName = `${category} - ${faker.person.firstName()}`;
            await contactsPage.addContact({
                name: contactName,
                category: category,
                phone: faker.phone.number(),
            });

            await contactsPage.expectContactVisible(contactName);
        }
    });
});

