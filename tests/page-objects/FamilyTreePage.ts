import { Page, expect } from '@playwright/test';

export class FamilyTreePage {
    constructor(private page: Page) { }

    // Locators
    get addMemberButton() {
        return this.page.getByRole('button', { name: /add member|new member|\+/i });
    }

    get memberNameInput() {
        return this.page.getByPlaceholder(/name/i);
    }

    get memberRoleInput() {
        return this.page.getByPlaceholder(/role/i);
    }

    get memberColorInput() {
        return this.page.locator('input[type="color"]').first();
    }

    get memberPhoneInput() {
        return this.page.getByPlaceholder(/phone/i);
    }

    get memberEmailInput() {
        return this.page.getByPlaceholder(/email/i);
    }

    get memberBirthDateInput() {
        return this.page.locator('input[type="date"]').first();
    }

    get saveMemberButton() {
        return this.page.getByRole('button', { name: /save|create|add/i });
    }

    get addRelationshipButton() {
        return this.page.getByRole('button', { name: /add relationship/i });
    }

    getMember(name: string) {
        return this.page.getByText(name);
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
        // Navigate to family tree from dashboard
        await this.page.getByRole('button', { name: /family/i }).first().click();
        await this.page.waitForLoadState('networkidle');
    }

    async addMember(member: { name: string; role: string; phone?: string; email?: string }) {
        await this.addMemberButton.click();
        await this.memberNameInput.fill(member.name);
        await this.memberRoleInput.fill(member.role);

        if (member.phone) {
            await this.memberPhoneInput.fill(member.phone);
        }

        if (member.email) {
            await this.memberEmailInput.fill(member.email);
        }

        await this.saveMemberButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async editMember(oldName: string, newData: { name?: string; role?: string; phone?: string }) {
        await this.getEditButton(oldName).click();

        if (newData.name) {
            await this.memberNameInput.clear();
            await this.memberNameInput.fill(newData.name);
        }

        if (newData.role) {
            await this.memberRoleInput.clear();
            await this.memberRoleInput.fill(newData.role);
        }

        if (newData.phone) {
            await this.memberPhoneInput.fill(newData.phone);
        }

        await this.saveMemberButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async deleteMember(name: string) {
        await this.getDeleteButton(name).click();
        const confirmButton = this.page.getByRole('button', { name: /confirm|yes|delete/i });
        if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
            await confirmButton.click();
        }
        await this.page.waitForLoadState('networkidle');
    }

    async addRelationship(person1: string, person2: string, type: string) {
        await this.addRelationshipButton.click();
        // Fill relationship form - exact selectors depend on UI implementation
        await this.page.locator('select').first().selectOption({ label: person1 });
        await this.page.locator('select').nth(1).selectOption({ label: person2 });
        await this.page.locator('select').nth(2).selectOption({ label: type });
        await this.saveMemberButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    // Assertions
    async expectMemberVisible(name: string) {
        await expect(this.getMember(name)).toBeVisible();
    }

    async expectMemberNotVisible(name: string) {
        await expect(this.getMember(name)).not.toBeVisible();
    }
}

