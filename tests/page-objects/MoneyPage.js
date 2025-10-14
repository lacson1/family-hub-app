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
import { expect } from '@playwright/test';
var MoneyPage = /** @class */ (function () {
    function MoneyPage(page) {
        this.page = page;
    }
    Object.defineProperty(MoneyPage.prototype, "addTransactionButton", {
        // Locators
        get: function () {
            return this.page.getByRole('button', { name: /add transaction|new transaction|\+/i });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MoneyPage.prototype, "addBudgetButton", {
        get: function () {
            return this.page.getByRole('button', { name: /add budget|new budget/i });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MoneyPage.prototype, "transactionTypeSelect", {
        get: function () {
            return this.page.locator('select[name*="type" i]').first();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MoneyPage.prototype, "transactionCategoryInput", {
        get: function () {
            return this.page.getByPlaceholder(/category/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MoneyPage.prototype, "transactionAmountInput", {
        get: function () {
            return this.page.getByPlaceholder(/amount/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MoneyPage.prototype, "transactionDateInput", {
        get: function () {
            return this.page.locator('input[type="date"]').first();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MoneyPage.prototype, "transactionDescriptionInput", {
        get: function () {
            return this.page.getByPlaceholder(/description/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MoneyPage.prototype, "budgetCategoryInput", {
        get: function () {
            return this.page.getByPlaceholder(/category/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MoneyPage.prototype, "budgetAmountInput", {
        get: function () {
            return this.page.getByPlaceholder(/amount/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MoneyPage.prototype, "budgetPeriodSelect", {
        get: function () {
            return this.page.locator('select[name*="period" i]').first();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MoneyPage.prototype, "saveButton", {
        get: function () {
            return this.page.getByRole('button', { name: /save|create|add/i });
        },
        enumerable: false,
        configurable: true
    });
    MoneyPage.prototype.getTransaction = function (description) {
        return this.page.getByText(description);
    };
    MoneyPage.prototype.getBudget = function (category) {
        return this.page.getByText(category);
    };
    MoneyPage.prototype.getDeleteButton = function (text) {
        return this.page.locator("button[aria-label*=\"delete\" i]:near(:text(\"".concat(text, "\"))")).first();
    };
    // Actions
    MoneyPage.prototype.addTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.addTransactionButton.click()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.transactionTypeSelect.selectOption({ label: transaction.type })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.transactionCategoryInput.fill(transaction.category)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.transactionAmountInput.fill(transaction.amount)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.transactionDateInput.fill(transaction.date)];
                    case 5:
                        _a.sent();
                        if (!transaction.description) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.transactionDescriptionInput.fill(transaction.description)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [4 /*yield*/, this.saveButton.click()];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, this.page.waitForLoadState('networkidle')];
                    case 9:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MoneyPage.prototype.addBudget = function (budget) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.addBudgetButton.click()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.budgetCategoryInput.fill(budget.category)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.budgetAmountInput.fill(budget.amount)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.budgetPeriodSelect.selectOption({ label: budget.period })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.saveButton.click()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.page.waitForLoadState('networkidle')];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MoneyPage.prototype.deleteTransaction = function (description) {
        return __awaiter(this, void 0, void 0, function () {
            var confirmButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDeleteButton(description).click()];
                    case 1:
                        _a.sent();
                        confirmButton = this.page.getByRole('button', { name: /confirm|yes|delete/i });
                        return [4 /*yield*/, confirmButton.isVisible({ timeout: 1000 }).catch(function () { return false; })];
                    case 2:
                        if (!_a.sent()) return [3 /*break*/, 4];
                        return [4 /*yield*/, confirmButton.click()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, this.page.waitForLoadState('networkidle')];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Assertions
    MoneyPage.prototype.expectTransactionVisible = function (description) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(this.getTransaction(description)).toBeVisible()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MoneyPage.prototype.expectBudgetVisible = function (category) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(this.getBudget(category)).toBeVisible()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MoneyPage.prototype.expectChartsVisible = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(this.page.locator('canvas, svg').first()).toBeVisible()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return MoneyPage;
}());
export { MoneyPage };
