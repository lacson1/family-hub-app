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
import { TasksPage } from './page-objects/TasksPage';
import { login } from './utils/auth-helpers';
import { faker } from '@faker-js/faker';
test.describe('Notifications', function () {
    var dashboardPage;
    var tasksPage;
    test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, login(page)];
                case 1:
                    _c.sent();
                    dashboardPage = new DashboardPage(page);
                    return [2 /*return*/];
            }
        });
    }); });
    test('should display notifications panel', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, dashboardPage.openNotifications()];
                case 1:
                    _c.sent();
                    // Notifications panel should be visible
                    return [4 /*yield*/, expect(page.getByText(/notification/i).first()).toBeVisible()];
                case 2:
                    // Notifications panel should be visible
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should show notification when task is created', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var taskTitle, tomorrow, dueDate;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    tasksPage = new TasksPage(page);
                    return [4 /*yield*/, dashboardPage.navigateToTasks()];
                case 1:
                    _c.sent();
                    taskTitle = faker.lorem.words(3);
                    tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    dueDate = tomorrow.toISOString().split('T')[0];
                    // Create a task
                    return [4 /*yield*/, tasksPage.addTask({
                            title: taskTitle,
                            dueDate: dueDate,
                        })];
                case 2:
                    // Create a task
                    _c.sent();
                    // Open notifications
                    return [4 /*yield*/, dashboardPage.openNotifications()];
                case 3:
                    // Open notifications
                    _c.sent();
                    // Should see notification about the task
                    return [4 /*yield*/, expect(page.getByText(/task/i).or(page.getByText(taskTitle))).toBeVisible()];
                case 4:
                    // Should see notification about the task
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should mark notification as read', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var notificationItem, markReadButton;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, dashboardPage.openNotifications()];
                case 1:
                    _c.sent();
                    notificationItem = page.locator('[role="listitem"]').first();
                    return [4 /*yield*/, notificationItem.isVisible()];
                case 2:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    markReadButton = notificationItem.locator('button').first();
                    return [4 /*yield*/, markReadButton.isVisible()];
                case 3:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, markReadButton.click()];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('should clear all notifications', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var clearAllButton;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, dashboardPage.openNotifications()];
                case 1:
                    _c.sent();
                    clearAllButton = page.getByRole('button', { name: /clear all|dismiss all/i });
                    return [4 /*yield*/, clearAllButton.isVisible()];
                case 2:
                    if (!_c.sent()) return [3 /*break*/, 4];
                    return [4 /*yield*/, clearAllButton.click()];
                case 3:
                    _c.sent();
                    _c.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); });
});
