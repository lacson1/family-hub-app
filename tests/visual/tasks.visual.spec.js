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
import { AuthPage } from '../page-objects/AuthPage';
import { TasksPage } from '../page-objects/TasksPage';
test.describe('Tasks Visual Tests', function () {
    var authPage;
    var tasksPage;
    test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var testUser;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    authPage = new AuthPage(page);
                    tasksPage = new TasksPage(page);
                    // Login first
                    return [4 /*yield*/, authPage.goto()];
                case 1:
                    // Login first
                    _c.sent();
                    testUser = {
                        email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
                        password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
                    };
                    return [4 /*yield*/, authPage.login(testUser.email, testUser.password)];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, authPage.expectLoggedIn()];
                case 3:
                    _c.sent();
                    // Navigate to tasks
                    return [4 /*yield*/, tasksPage.goto()];
                case 4:
                    // Navigate to tasks
                    _c.sent();
                    return [4 /*yield*/, page.waitForLoadState('networkidle')];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(500)];
                case 6:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('tasks list default view', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, expect(page).toHaveScreenshot('tasks-list-default.png', {
                        fullPage: true,
                        // Mask due dates and timestamps
                        mask: [page.locator('[data-testid*="due-date"]'), page.locator('time')],
                    })];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('tasks list with priority filter', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var highPriorityFilter;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    highPriorityFilter = page.locator('[data-testid="priority-high"], button:has-text("High")');
                    return [4 /*yield*/, highPriorityFilter.isVisible().catch(function () { return false; })];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, highPriorityFilter.click()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(500)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('tasks-list-high-priority.png', {
                            fullPage: true,
                            mask: [page.locator('[data-testid*="due-date"]')],
                        })];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('tasks add task modal', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var addButton;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    addButton = page.locator('[data-testid="add-task-button"], button:has-text("Add Task")');
                    return [4 /*yield*/, addButton.isVisible().catch(function () { return false; })];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, addButton.click()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(500)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('tasks-add-modal.png', {
                            fullPage: true,
                        })];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('tasks completed view', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var completedButton;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    completedButton = page.locator('[data-testid="completed-tasks"], button:has-text("Completed")');
                    return [4 /*yield*/, completedButton.isVisible().catch(function () { return false; })];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, completedButton.click()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(500)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('tasks-completed-view.png', {
                            fullPage: true,
                            mask: [page.locator('[data-testid*="timestamp"]')],
                        })];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('tasks with assignment details', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var firstTask;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    firstTask = page.locator('[data-testid="task-item"]').first();
                    return [4 /*yield*/, firstTask.isVisible().catch(function () { return false; })];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, firstTask.click()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(500)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('tasks-details-view.png', {
                            fullPage: true,
                            mask: [page.locator('[data-testid*="date"]'), page.locator('time')],
                        })];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('tasks by assignee view', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var assigneeView;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    assigneeView = page.locator('[data-testid="view-by-assignee"], button:has-text("By Person")');
                    return [4 /*yield*/, assigneeView.isVisible().catch(function () { return false; })];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, assigneeView.click()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(500)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('tasks-by-assignee.png', {
                            fullPage: true,
                            mask: [page.locator('[data-testid*="due-date"]')],
                        })];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
});
