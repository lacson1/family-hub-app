import { test, expect } from '@playwright/test';
import { DashboardPage } from './page-objects/DashboardPage';
import { FamilyTreePage } from './page-objects/FamilyTreePage';
import { login } from './utils/auth-helpers';
import { faker } from '@faker-js/faker';

test.describe('Family Tree Management', () => {
    let familyTreePage: FamilyTreePage;
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
        await login(page);
        dashboardPage = new DashboardPage(page);
        familyTreePage = new FamilyTreePage(page);
        await dashboardPage.navigateToFamilyTree();
    });

    test('should display family tree page', async () => {
        await dashboardPage.expectOnFamilyTreeView();
        await expect(familyTreePage.addMemberButton).toBeVisible();
    });

    test('should add a new family member', async () => {
        const memberName = faker.person.fullName();
        const memberRole = faker.person.jobTitle();

        await familyTreePage.addMember({
            name: memberName,
            role: memberRole,
            phone: faker.phone.number(),
            email: faker.internet.email(),
        });

        await familyTreePage.expectMemberVisible(memberName);
    });

    test('should edit family member details', async () => {
        const originalName = faker.person.fullName();
        const updatedName = faker.person.fullName();
        const originalRole = 'Parent';

        // Add a member first
        await familyTreePage.addMember({
            name: originalName,
            role: originalRole,
        });

        // Edit the member
        await familyTreePage.editMember(originalName, {
            name: updatedName,
            role: 'Grandparent',
            phone: faker.phone.number(),
        });

        await familyTreePage.expectMemberVisible(updatedName);
        await familyTreePage.expectMemberNotVisible(originalName);
    });

    test('should delete a family member', async () => {
        const memberName = faker.person.fullName();

        // Add a member
        await familyTreePage.addMember({
            name: memberName,
            role: 'Child',
        });

        await familyTreePage.expectMemberVisible(memberName);

        // Delete the member
        await familyTreePage.deleteMember(memberName);

        await familyTreePage.expectMemberNotVisible(memberName);
    });

    test('should add member with complete details', async () => {
        const memberName = faker.person.fullName();

        await familyTreePage.addMember({
            name: memberName,
            role: 'Parent',
            phone: faker.phone.number(),
            email: faker.internet.email(),
        });

        await familyTreePage.expectMemberVisible(memberName);
    });

    test('should create relationship between members', async () => {
        const parent = faker.person.fullName();
        const child = faker.person.fullName();

        // Add two members
        await familyTreePage.addMember({
            name: parent,
            role: 'Parent',
        });

        await familyTreePage.addMember({
            name: child,
            role: 'Child',
        });

        // Create relationship
        await familyTreePage.addRelationship(parent, child, 'parent');

        // Verify both members are visible
        await familyTreePage.expectMemberVisible(parent);
        await familyTreePage.expectMemberVisible(child);
    });
});

