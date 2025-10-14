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
import { ShoppingPage } from './page-objects/ShoppingPage';
import { login } from './utils/auth-helpers';
import { faker } from '@faker-js/faker';
test.describe('Shopping List Management', function () {
    var shoppingPage;
    var dashboardPage;
    test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, login(page)];
                case 1:
                    _c.sent();
                    dashboardPage = new DashboardPage(page);
                    shoppingPage = new ShoppingPage(page);
                    return [4 /*yield*/, dashboardPage.navigateToShopping()];
                case 2:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should display shopping list page', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, expect(shoppingPage.addItemButton).toBeVisible()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should add a new shopping item', function () { return __awaiter(void 0, void 0, void 0, function () {
        var itemName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    itemName = faker.commerce.productName();
                    return [4 /*yield*/, shoppingPage.addItem({
                            name: itemName,
                            quantity: '2',
                            category: 'Groceries',
                            notes: faker.lorem.sentence(),
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, shoppingPage.expectItemVisible(itemName)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should mark item as purchased', function () { return __awaiter(void 0, void 0, void 0, function () {
        var itemName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    itemName = faker.commerce.productName();
                    // Add an item
                    return [4 /*yield*/, shoppingPage.addItem({
                            name: itemName,
                            quantity: '1',
                            category: 'Household',
                        })];
                case 1:
                    // Add an item
                    _a.sent();
                    // Mark as purchased
                    return [4 /*yield*/, shoppingPage.markAsPurchased(itemName)];
                case 2:
                    // Mark as purchased
                    _a.sent();
                    return [4 /*yield*/, shoppingPage.expectItemPurchased(itemName)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should edit shopping item', function () { return __awaiter(void 0, void 0, void 0, function () {
        var originalName, updatedName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    originalName = faker.commerce.productName();
                    updatedName = faker.commerce.productName();
                    // Add an item
                    return [4 /*yield*/, shoppingPage.addItem({
                            name: originalName,
                            quantity: '1',
                            category: 'Personal',
                        })];
                case 1:
                    // Add an item
                    _a.sent();
                    // Edit the item
                    return [4 /*yield*/, shoppingPage.editItem(originalName, {
                            name: updatedName,
                            quantity: '3',
                            category: 'Groceries',
                        })];
                case 2:
                    // Edit the item
                    _a.sent();
                    return [4 /*yield*/, shoppingPage.expectItemVisible(updatedName)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, shoppingPage.expectItemNotVisible(originalName)];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should delete shopping item', function () { return __awaiter(void 0, void 0, void 0, function () {
        var itemName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    itemName = faker.commerce.productName();
                    // Add an item
                    return [4 /*yield*/, shoppingPage.addItem({
                            name: itemName,
                            quantity: '2',
                            category: 'Other',
                        })];
                case 1:
                    // Add an item
                    _a.sent();
                    return [4 /*yield*/, shoppingPage.expectItemVisible(itemName)];
                case 2:
                    _a.sent();
                    // Delete the item
                    return [4 /*yield*/, shoppingPage.deleteItem(itemName)];
                case 3:
                    // Delete the item
                    _a.sent();
                    return [4 /*yield*/, shoppingPage.expectItemNotVisible(itemName)];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should add items in different categories', function () { return __awaiter(void 0, void 0, void 0, function () {
        var categories, _i, categories_1, category, itemName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    categories = ['Groceries', 'Household', 'Personal', 'Other'];
                    _i = 0, categories_1 = categories;
                    _a.label = 1;
                case 1:
                    if (!(_i < categories_1.length)) return [3 /*break*/, 5];
                    category = categories_1[_i];
                    itemName = "".concat(category, " - ").concat(faker.commerce.product());
                    return [4 /*yield*/, shoppingPage.addItem({
                            name: itemName,
                            quantity: '1',
                            category: category,
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, shoppingPage.expectItemVisible(itemName)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    }); });
});
