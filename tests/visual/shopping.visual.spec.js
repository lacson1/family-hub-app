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
import { ShoppingPage } from '../page-objects/ShoppingPage';
test.describe('Shopping List Visual Tests', function () {
    var authPage;
    var shoppingPage;
    test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var testUser;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    authPage = new AuthPage(page);
                    shoppingPage = new ShoppingPage(page);
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
                    // Navigate to shopping list
                    return [4 /*yield*/, shoppingPage.goto()];
                case 4:
                    // Navigate to shopping list
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
    test('shopping list default view', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, expect(page).toHaveScreenshot('shopping-list-default.png', {
                        fullPage: true,
                        // Mask timestamps
                        mask: [page.locator('[data-testid*="timestamp"]'), page.locator('time')],
                    })];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('shopping list with items', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var items, count;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    items = page.locator('[data-testid="shopping-item"], .shopping-item');
                    return [4 /*yield*/, items.count().catch(function () { return 0; })];
                case 1:
                    count = _c.sent();
                    if (!(count > 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, expect(page).toHaveScreenshot('shopping-list-with-items.png', {
                            fullPage: true,
                            mask: [page.locator('[data-testid*="timestamp"]')],
                        })];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); });
    test('shopping list add item modal', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var addButton;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    addButton = page.locator('[data-testid="add-shopping-item"], button:has-text("Add Item")');
                    return [4 /*yield*/, addButton.isVisible().catch(function () { return false; })];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, addButton.click()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(500)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('shopping-list-add-modal.png', {
                            fullPage: true,
                        })];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('shopping list with filters', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var filterButton;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    filterButton = page.locator('[data-testid="filter-button"], button:has-text("Filter")');
                    return [4 /*yield*/, filterButton.isVisible().catch(function () { return false; })];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, filterButton.click()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(300)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('shopping-list-filters.png', {
                            fullPage: true,
                        })];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('shopping list item categories', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
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
                    return [4 /*yield*/, expect(page).toHaveScreenshot('shopping-list-categories.png', {
                            fullPage: true,
                        })];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('shopping list checked items', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var firstCheckbox;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    firstCheckbox = page.locator('[data-testid="shopping-item-checkbox"], input[type="checkbox"]').first();
                    return [4 /*yield*/, firstCheckbox.isVisible().catch(function () { return false; })];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, firstCheckbox.check()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(300)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('shopping-list-checked-item.png', {
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
});
