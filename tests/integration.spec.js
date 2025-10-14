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
import { AuthPage } from './page-objects/AuthPage';
import { DashboardPage } from './page-objects/DashboardPage';
import { TasksPage } from './page-objects/TasksPage';
import { EventsPage } from './page-objects/EventsPage';
import { ShoppingPage } from './page-objects/ShoppingPage';
import { FamilyTreePage } from './page-objects/FamilyTreePage';
import { faker } from '@faker-js/faker';
test.describe('End-to-End Integration Tests', function () {
    test('complete user journey: login → create task → create event → add shopping → logout', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var authPage, dashboardPage, tasksPage, taskTitle, tomorrow, dueDate, eventsPage, eventTitle, shoppingPage, itemName;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    authPage = new AuthPage(page);
                    return [4 /*yield*/, authPage.goto()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, authPage.login(process.env.TEST_USER_EMAIL || 'testuser@example.com', process.env.TEST_USER_PASSWORD || 'TestPassword123!')];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, authPage.expectLoggedIn()];
                case 3:
                    _c.sent();
                    dashboardPage = new DashboardPage(page);
                    tasksPage = new TasksPage(page);
                    return [4 /*yield*/, dashboardPage.navigateToTasks()];
                case 4:
                    _c.sent();
                    taskTitle = faker.lorem.words(3);
                    tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    dueDate = tomorrow.toISOString().split('T')[0];
                    return [4 /*yield*/, tasksPage.addTask({
                            title: taskTitle,
                            dueDate: dueDate,
                            priority: 'high',
                        })];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, tasksPage.expectTaskVisible(taskTitle)];
                case 6:
                    _c.sent();
                    eventsPage = new EventsPage(page);
                    return [4 /*yield*/, dashboardPage.navigateToCalendar()];
                case 7:
                    _c.sent();
                    eventTitle = faker.lorem.words(3);
                    return [4 /*yield*/, eventsPage.addEvent({
                            title: eventTitle,
                            date: dueDate,
                            time: '14:00',
                            type: 'family',
                        })];
                case 8:
                    _c.sent();
                    return [4 /*yield*/, eventsPage.expectEventVisible(eventTitle)];
                case 9:
                    _c.sent();
                    shoppingPage = new ShoppingPage(page);
                    return [4 /*yield*/, dashboardPage.navigateToShopping()];
                case 10:
                    _c.sent();
                    itemName = faker.commerce.productName();
                    return [4 /*yield*/, shoppingPage.addItem({
                            name: itemName,
                            quantity: '2',
                            category: 'Groceries',
                        })];
                case 11:
                    _c.sent();
                    return [4 /*yield*/, shoppingPage.expectItemVisible(itemName)];
                case 12:
                    _c.sent();
                    // 5. Logout
                    return [4 /*yield*/, dashboardPage.logout()];
                case 13:
                    // 5. Logout
                    _c.sent();
                    return [4 /*yield*/, expect(authPage.signInButton).toBeVisible()];
                case 14:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('family management workflow: add members and create relationships', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var authPage, dashboardPage, familyTreePage, parentName, childName;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    authPage = new AuthPage(page);
                    return [4 /*yield*/, authPage.goto()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, authPage.login(process.env.TEST_USER_EMAIL || 'testuser@example.com', process.env.TEST_USER_PASSWORD || 'TestPassword123!')];
                case 2:
                    _c.sent();
                    dashboardPage = new DashboardPage(page);
                    familyTreePage = new FamilyTreePage(page);
                    return [4 /*yield*/, dashboardPage.navigateToFamilyTree()];
                case 3:
                    _c.sent();
                    parentName = faker.person.fullName();
                    return [4 /*yield*/, familyTreePage.addMember({
                            name: parentName,
                            role: 'Parent',
                            phone: faker.phone.number(),
                            email: faker.internet.email(),
                        })];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, familyTreePage.expectMemberVisible(parentName)];
                case 5:
                    _c.sent();
                    childName = faker.person.fullName();
                    return [4 /*yield*/, familyTreePage.addMember({
                            name: childName,
                            role: 'Child',
                        })];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, familyTreePage.expectMemberVisible(childName)];
                case 7:
                    _c.sent();
                    // Create relationship
                    return [4 /*yield*/, familyTreePage.addRelationship(parentName, childName, 'parent')];
                case 8:
                    // Create relationship
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('multi-feature data consistency', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var authPage, dashboardPage, tasksPage, taskTitle, dueDate;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    authPage = new AuthPage(page);
                    return [4 /*yield*/, authPage.goto()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, authPage.login(process.env.TEST_USER_EMAIL || 'testuser@example.com', process.env.TEST_USER_PASSWORD || 'TestPassword123!')];
                case 2:
                    _c.sent();
                    dashboardPage = new DashboardPage(page);
                    tasksPage = new TasksPage(page);
                    return [4 /*yield*/, dashboardPage.navigateToTasks()];
                case 3:
                    _c.sent();
                    taskTitle = faker.lorem.words(3);
                    dueDate = new Date().toISOString().split('T')[0];
                    return [4 /*yield*/, tasksPage.addTask({
                            title: taskTitle,
                            dueDate: dueDate,
                        })];
                case 4:
                    _c.sent();
                    // Navigate away and back
                    return [4 /*yield*/, dashboardPage.navigateToCalendar()];
                case 5:
                    // Navigate away and back
                    _c.sent();
                    return [4 /*yield*/, dashboardPage.navigateToTasks()];
                case 6:
                    _c.sent();
                    // Verify task still exists
                    return [4 /*yield*/, tasksPage.expectTaskVisible(taskTitle)];
                case 7:
                    // Verify task still exists
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('navigation flow through all major features', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var authPage, dashboardPage;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    authPage = new AuthPage(page);
                    return [4 /*yield*/, authPage.goto()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, authPage.login(process.env.TEST_USER_EMAIL || 'testuser@example.com', process.env.TEST_USER_PASSWORD || 'TestPassword123!')];
                case 2:
                    _c.sent();
                    dashboardPage = new DashboardPage(page);
                    // Navigate through all features
                    return [4 /*yield*/, dashboardPage.navigateToTasks()];
                case 3:
                    // Navigate through all features
                    _c.sent();
                    return [4 /*yield*/, dashboardPage.expectOnTasksView()];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, dashboardPage.navigateToCalendar()];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, dashboardPage.expectOnCalendarView()];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, dashboardPage.navigateToFamilyTree()];
                case 7:
                    _c.sent();
                    return [4 /*yield*/, dashboardPage.expectOnFamilyTreeView()];
                case 8:
                    _c.sent();
                    return [4 /*yield*/, dashboardPage.navigateToShopping()];
                case 9:
                    _c.sent();
                    return [4 /*yield*/, expect(page.getByText(/shopping/i).first()).toBeVisible()];
                case 10:
                    _c.sent();
                    return [4 /*yield*/, dashboardPage.navigateToMeals()];
                case 11:
                    _c.sent();
                    return [4 /*yield*/, expect(page.getByText(/meal/i).first()).toBeVisible()];
                case 12:
                    _c.sent();
                    return [4 /*yield*/, dashboardPage.navigateToMoney()];
                case 13:
                    _c.sent();
                    return [4 /*yield*/, expect(page.getByText(/money|transaction|budget/i).first()).toBeVisible()];
                case 14:
                    _c.sent();
                    return [4 /*yield*/, dashboardPage.navigateToContacts()];
                case 15:
                    _c.sent();
                    return [4 /*yield*/, expect(page.getByText(/contact/i).first()).toBeVisible()];
                case 16:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
