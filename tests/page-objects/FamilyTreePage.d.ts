import { Page } from '@playwright/test';
export declare class FamilyTreePage {
    private page;
    constructor(page: Page);
    get addMemberButton(): import("playwright-core").Locator;
    get memberNameInput(): import("playwright-core").Locator;
    get memberRoleInput(): import("playwright-core").Locator;
    get memberColorInput(): import("playwright-core").Locator;
    get memberPhoneInput(): import("playwright-core").Locator;
    get memberEmailInput(): import("playwright-core").Locator;
    get memberBirthDateInput(): import("playwright-core").Locator;
    get saveMemberButton(): import("playwright-core").Locator;
    get addRelationshipButton(): import("playwright-core").Locator;
    getMember(name: string): import("playwright-core").Locator;
    getEditButton(name: string): import("playwright-core").Locator;
    getDeleteButton(name: string): import("playwright-core").Locator;
    addMember(member: {
        name: string;
        role: string;
        phone?: string;
        email?: string;
    }): Promise<void>;
    editMember(oldName: string, newData: {
        name?: string;
        role?: string;
        phone?: string;
    }): Promise<void>;
    deleteMember(name: string): Promise<void>;
    addRelationship(person1: string, person2: string, type: string): Promise<void>;
    expectMemberVisible(name: string): Promise<void>;
    expectMemberNotVisible(name: string): Promise<void>;
}
