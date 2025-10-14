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
import { MoneyPage } from './page-objects/MoneyPage';
import { login } from './utils/auth-helpers';
import { faker } from '@faker-js/faker';
test.describe('Money Management', function () {
    var moneyPage;
    var dashboardPage;
    test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, login(page)];
                case 1:
                    _c.sent();
                    dashboardPage = new DashboardPage(page);
                    moneyPage = new MoneyPage(page);
                    return [4 /*yield*/, dashboardPage.navigateToMoney()];
                case 2:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should display money management page', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, expect(moneyPage.addTransactionButton).toBeVisible()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should add an income transaction', function () { return __awaiter(void 0, void 0, void 0, function () {
        var description, today;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    description = faker.lorem.words(3);
                    today = new Date().toISOString().split('T')[0];
                    return [4 /*yield*/, moneyPage.addTransaction({
                            type: 'income',
                            category: 'Salary',
                            amount: '5000',
                            date: today,
                            description: description,
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, moneyPage.expectTransactionVisible(description)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should add an expense transaction', function () { return __awaiter(void 0, void 0, void 0, function () {
        var description, today;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    description = faker.lorem.words(3);
                    today = new Date().toISOString().split('T')[0];
                    return [4 /*yield*/, moneyPage.addTransaction({
                            type: 'expense',
                            category: 'Groceries',
                            amount: '150',
                            date: today,
                            description: description,
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, moneyPage.expectTransactionVisible(description)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should create a budget', function () { return __awaiter(void 0, void 0, void 0, function () {
        var category;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    category = faker.lorem.word();
                    return [4 /*yield*/, moneyPage.addBudget({
                            category: category,
                            amount: '1000',
                            period: 'monthly',
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, moneyPage.expectBudgetVisible(category)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should delete a transaction', function () { return __awaiter(void 0, void 0, void 0, function () {
        var description, today;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    description = faker.lorem.words(3);
                    today = new Date().toISOString().split('T')[0];
                    // Add a transaction
                    return [4 /*yield*/, moneyPage.addTransaction({
                            type: 'expense',
                            category: 'Entertainment',
                            amount: '50',
                            date: today,
                            description: description,
                        })];
                case 1:
                    // Add a transaction
                    _a.sent();
                    return [4 /*yield*/, moneyPage.expectTransactionVisible(description)];
                case 2:
                    _a.sent();
                    // Delete the transaction
                    return [4 /*yield*/, moneyPage.deleteTransaction(description)];
                case 3:
                    // Delete the transaction
                    _a.sent();
                    // Transaction should no longer be visible
                    return [4 /*yield*/, expect(moneyPage.getTransaction(description)).not.toBeVisible()];
                case 4:
                    // Transaction should no longer be visible
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should display charts and analytics', function () { return __awaiter(void 0, void 0, void 0, function () {
        var today;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    today = new Date().toISOString().split('T')[0];
                    return [4 /*yield*/, moneyPage.addTransaction({
                            type: 'income',
                            category: 'Salary',
                            amount: '3000',
                            date: today,
                            description: 'Monthly salary',
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, moneyPage.addTransaction({
                            type: 'expense',
                            category: 'Rent',
                            amount: '1200',
                            date: today,
                            description: 'Monthly rent',
                        })];
                case 2:
                    _a.sent();
                    // Charts should be visible
                    return [4 /*yield*/, moneyPage.expectChartsVisible()];
                case 3:
                    // Charts should be visible
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
