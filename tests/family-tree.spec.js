var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { test, expect } from '@playwright/test';
import { DashboardPage } from './page-objects/DashboardPage';
import { FamilyTreePage } from './page-objects/FamilyTreePage';
import { login } from './utils/auth-helpers';
import { faker } from '@faker-js/faker';
test.describe('Family Tree Management', function () {
    var familyTreePage;
    var dashboardPage;
    test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, login(page)];
                case 1:
                    _c.sent();
                    dashboardPage = new DashboardPage(page);
                    familyTreePage = new FamilyTreePage(page);
                    return [4 /*yield*/, dashboardPage.navigateToFamilyTree()];
                case 2:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should display family tree page', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dashboardPage.expectOnFamilyTreeView()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, expect(familyTreePage.addMemberButton).toBeVisible()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should add a new family member', function () { return __awaiter(void 0, void 0, void 0, function () {
        var memberName, memberRole;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    memberName = faker.person.fullName();
                    memberRole = faker.person.jobTitle();
                    return [4 /*yield*/, familyTreePage.addMember({
                            name: memberName,
                            role: memberRole,
                            phone: faker.phone.number(),
                            email: faker.internet.email(),
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, familyTreePage.expectMemberVisible(memberName)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should edit family member details', function () { return __awaiter(void 0, void 0, void 0, function () {
        var originalName, updatedName, originalRole;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    originalName = faker.person.fullName();
                    updatedName = faker.person.fullName();
                    originalRole = 'Parent';
                    // Add a member first
                    return [4 /*yield*/, familyTreePage.addMember({
                            name: originalName,
                            role: originalRole,
                        })];
                case 1:
                    // Add a member first
                    _a.sent();
                    // Edit the member
                    return [4 /*yield*/, familyTreePage.editMember(originalName, {
                            name: updatedName,
                            role: 'Grandparent',
                            phone: faker.phone.number(),
                        })];
                case 2:
                    // Edit the member
                    _a.sent();
                    return [4 /*yield*/, familyTreePage.expectMemberVisible(updatedName)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, familyTreePage.expectMemberNotVisible(originalName)];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should delete a family member', function () { return __awaiter(void 0, void 0, void 0, function () {
        var memberName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    memberName = faker.person.fullName();
                    // Add a member
                    return [4 /*yield*/, familyTreePage.addMember({
                            name: memberName,
                            role: 'Child',
                        })];
                case 1:
                    // Add a member
                    _a.sent();
                    return [4 /*yield*/, familyTreePage.expectMemberVisible(memberName)];
                case 2:
                    _a.sent();
                    // Delete the member
                    return [4 /*yield*/, familyTreePage.deleteMember(memberName)];
                case 3:
                    // Delete the member
                    _a.sent();
                    return [4 /*yield*/, familyTreePage.expectMemberNotVisible(memberName)];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should add member with complete details', function () { return __awaiter(void 0, void 0, void 0, function () {
        var memberName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    memberName = faker.person.fullName();
                    return [4 /*yield*/, familyTreePage.addMember({
                            name: memberName,
                            role: 'Parent',
                            phone: faker.phone.number(),
                            email: faker.internet.email(),
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, familyTreePage.expectMemberVisible(memberName)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should create relationship between members', function () { return __awaiter(void 0, void 0, void 0, function () {
        var parent, child;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parent = faker.person.fullName();
                    child = faker.person.fullName();
                    // Add two members
                    return [4 /*yield*/, familyTreePage.addMember({
                            name: parent,
                            role: 'Parent',
                        })];
                case 1:
                    // Add two members
                    _a.sent();
                    return [4 /*yield*/, familyTreePage.addMember({
                            name: child,
                            role: 'Child',
                        })];
                case 2:
                    _a.sent();
                    // Create relationship
                    return [4 /*yield*/, familyTreePage.addRelationship(parent, child, 'parent')];
                case 3:
                    // Create relationship
                    _a.sent();
                    // Verify both members are visible
                    return [4 /*yield*/, familyTreePage.expectMemberVisible(parent)];
                case 4:
                    // Verify both members are visible
                    _a.sent();
                    return [4 /*yield*/, familyTreePage.expectMemberVisible(child)];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
