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
import { MoneyPage } from '../page-objects/MoneyPage';
test.describe('Money Management Visual Tests', function () {
    var authPage;
    var moneyPage;
    test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var testUser;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    authPage = new AuthPage(page);
                    moneyPage = new MoneyPage(page);
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
                    // Navigate to money/transactions
                    return [4 /*yield*/, moneyPage.goto()];
                case 4:
                    // Navigate to money/transactions
                    _c.sent();
                    return [4 /*yield*/, page.waitForLoadState('networkidle')];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(1000)];
                case 6:
                    _c.sent(); // Wait for charts to render
                    return [2 /*return*/];
            }
        });
    }); });
    test('money overview dashboard', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, expect(page).toHaveScreenshot('money-overview.png', {
                        fullPage: true,
                        // Mask dates and dynamic amounts
                        mask: [
                            page.locator('[data-testid*="date"]'),
                            page.locator('time'),
                            page.locator('[data-testid*="balance"]'),
                        ],
                    })];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('money transactions list', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var transactionsTab;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    transactionsTab = page.locator('[data-testid="transactions-tab"], button:has-text("Transactions")');
                    return [4 /*yield*/, transactionsTab.isVisible().catch(function () { return false; })];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, transactionsTab.click()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(500)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('money-transactions-list.png', {
                            fullPage: true,
                            mask: [page.locator('[data-testid*="date"]'), page.locator('[data-testid*="amount"]')],
                        })];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('money budget view', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var budgetTab;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    budgetTab = page.locator('[data-testid="budget-tab"], button:has-text("Budget")');
                    return [4 /*yield*/, budgetTab.isVisible().catch(function () { return false; })];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, budgetTab.click()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(500)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('money-budget-view.png', {
                            fullPage: true,
                            mask: [page.locator('[data-testid*="amount"]')],
                        })];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('money add transaction modal', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var addButton;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    addButton = page.locator('[data-testid="add-transaction"], button:has-text("Add Transaction")');
                    return [4 /*yield*/, addButton.isVisible().catch(function () { return false; })];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, addButton.click()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(500)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('money-add-transaction-modal.png', {
                            fullPage: true,
                        })];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('money charts and analytics', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var chartsView;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    chartsView = page.locator('[data-testid="charts-view"], button:has-text("Charts"), button:has-text("Analytics")');
                    return [4 /*yield*/, chartsView.isVisible().catch(function () { return false; })];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, chartsView.click()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(1000)];
                case 3:
                    _c.sent(); // Wait for chart rendering
                    return [4 /*yield*/, expect(page).toHaveScreenshot('money-charts.png', {
                            fullPage: true,
                            mask: [
                                page.locator('[data-testid*="date"]'),
                                page.locator('[data-testid*="amount"]'),
                                page.locator('text'),
                            ],
                        })];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('money category breakdown', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var categoryView;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    categoryView = page.locator('[data-testid="category-view"], button:has-text("Categories")');
                    return [4 /*yield*/, categoryView.isVisible().catch(function () { return false; })];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, categoryView.click()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(500)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('money-categories.png', {
                            fullPage: true,
                            mask: [page.locator('[data-testid*="amount"]')],
                        })];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('money add budget modal', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var budgetTab, addBudgetButton;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    budgetTab = page.locator('[data-testid="budget-tab"], button:has-text("Budget")');
                    return [4 /*yield*/, budgetTab.isVisible().catch(function () { return false; })];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 4];
                    return [4 /*yield*/, budgetTab.click()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(300)];
                case 3:
                    _c.sent();
                    _c.label = 4;
                case 4:
                    addBudgetButton = page.locator('[data-testid="add-budget"], button:has-text("Add Budget")');
                    return [4 /*yield*/, addBudgetButton.isVisible().catch(function () { return false; })];
                case 5:
                    if (!_c.sent()) return [3 /*break*/, 9];
                    return [4 /*yield*/, addBudgetButton.click()];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(500)];
                case 7:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('money-add-budget-modal.png', {
                            fullPage: true,
                        })];
                case 8:
                    _c.sent();
                    _c.label = 9;
                case 9: return [2 /*return*/];
            }
        });
    }); });
});
