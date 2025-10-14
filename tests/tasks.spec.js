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
test.describe('Tasks Management', function () {
    var tasksPage;
    var dashboardPage;
    test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, login(page)];
                case 1:
                    _c.sent();
                    dashboardPage = new DashboardPage(page);
                    tasksPage = new TasksPage(page);
                    return [4 /*yield*/, dashboardPage.navigateToTasks()];
                case 2:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should display tasks page', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, dashboardPage.expectOnTasksView()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, expect(tasksPage.addTaskButton).toBeVisible()];
                case 2:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should create a new task', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var taskTitle, tomorrow, dueDate;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    taskTitle = faker.lorem.words(3);
                    tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    dueDate = tomorrow.toISOString().split('T')[0];
                    return [4 /*yield*/, tasksPage.addTask({
                            title: taskTitle,
                            dueDate: dueDate,
                            priority: 'high',
                        })];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, tasksPage.expectTaskVisible(taskTitle)];
                case 2:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should edit an existing task', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var originalTitle, updatedTitle, tomorrow, dueDate;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    originalTitle = faker.lorem.words(3);
                    updatedTitle = faker.lorem.words(3);
                    tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    dueDate = tomorrow.toISOString().split('T')[0];
                    // Create a task first
                    return [4 /*yield*/, tasksPage.addTask({
                            title: originalTitle,
                            dueDate: dueDate,
                        })];
                case 1:
                    // Create a task first
                    _c.sent();
                    // Edit the task
                    return [4 /*yield*/, tasksPage.editTask(originalTitle, {
                            title: updatedTitle,
                            priority: 'high',
                        })];
                case 2:
                    // Edit the task
                    _c.sent();
                    return [4 /*yield*/, tasksPage.expectTaskVisible(updatedTitle)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, tasksPage.expectTaskNotVisible(originalTitle)];
                case 4:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should mark task as complete', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var taskTitle, tomorrow, dueDate;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    taskTitle = faker.lorem.words(3);
                    tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    dueDate = tomorrow.toISOString().split('T')[0];
                    // Create a task
                    return [4 /*yield*/, tasksPage.addTask({
                            title: taskTitle,
                            dueDate: dueDate,
                        })];
                case 1:
                    // Create a task
                    _c.sent();
                    // Mark as complete
                    return [4 /*yield*/, tasksPage.completeTask(taskTitle)];
                case 2:
                    // Mark as complete
                    _c.sent();
                    return [4 /*yield*/, tasksPage.expectTaskCompleted(taskTitle)];
                case 3:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should delete a task', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var taskTitle, tomorrow, dueDate;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    taskTitle = faker.lorem.words(3);
                    tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    dueDate = tomorrow.toISOString().split('T')[0];
                    // Create a task
                    return [4 /*yield*/, tasksPage.addTask({
                            title: taskTitle,
                            dueDate: dueDate,
                        })];
                case 1:
                    // Create a task
                    _c.sent();
                    return [4 /*yield*/, tasksPage.expectTaskVisible(taskTitle)];
                case 2:
                    _c.sent();
                    // Delete the task
                    return [4 /*yield*/, tasksPage.deleteTask(taskTitle)];
                case 3:
                    // Delete the task
                    _c.sent();
                    return [4 /*yield*/, tasksPage.expectTaskNotVisible(taskTitle)];
                case 4:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should create task with all fields', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var taskTitle, tomorrow, dueDate;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    taskTitle = faker.lorem.words(4);
                    tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 7);
                    dueDate = tomorrow.toISOString().split('T')[0];
                    return [4 /*yield*/, tasksPage.addTask({
                            title: taskTitle,
                            assignee: 'John Doe',
                            dueDate: dueDate,
                            priority: 'medium',
                        })];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, tasksPage.expectTaskVisible(taskTitle)];
                case 2:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
