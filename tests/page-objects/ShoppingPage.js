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
var ShoppingPage = /** @class */ (function () {
    function ShoppingPage(page) {
        this.page = page;
    }
    Object.defineProperty(ShoppingPage.prototype, "addItemButton", {
        // Locators
        get: function () {
            return this.page.getByRole('button', { name: /add item|new item|\+/i });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShoppingPage.prototype, "itemNameInput", {
        get: function () {
            return this.page.getByPlaceholder(/name|item/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShoppingPage.prototype, "itemQuantityInput", {
        get: function () {
            return this.page.getByPlaceholder(/quantity/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShoppingPage.prototype, "itemCategorySelect", {
        get: function () {
            return this.page.locator('select[name*="category" i]').first();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShoppingPage.prototype, "itemNotesInput", {
        get: function () {
            return this.page.getByPlaceholder(/notes/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShoppingPage.prototype, "saveItemButton", {
        get: function () {
            return this.page.getByRole('button', { name: /save|create|add/i });
        },
        enumerable: false,
        configurable: true
    });
    ShoppingPage.prototype.getItem = function (name) {
        return this.page.getByText(name);
    };
    ShoppingPage.prototype.getItemCheckbox = function (name) {
        return this.page.locator("[aria-label*=\"".concat(name, "\" i] input[type=\"checkbox\"]"));
    };
    ShoppingPage.prototype.getEditButton = function (name) {
        return this.page.locator("button[aria-label*=\"edit\" i]:near(:text(\"".concat(name, "\"))")).first();
    };
    ShoppingPage.prototype.getDeleteButton = function (name) {
        return this.page.locator("button[aria-label*=\"delete\" i]:near(:text(\"".concat(name, "\"))")).first();
    };
    // Actions
    ShoppingPage.prototype.addItem = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.addItemButton.click()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.itemNameInput.fill(item.name)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.itemQuantityInput.fill(item.quantity)];
                    case 3:
                        _a.sent();
                        if (!item.category) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.itemCategorySelect.selectOption({ label: item.category })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        if (!item.notes) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.itemNotesInput.fill(item.notes)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [4 /*yield*/, this.saveItemButton.click()];
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
    ShoppingPage.prototype.markAsPurchased = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var checkbox;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        checkbox = this.getItemCheckbox(name);
                        return [4 /*yield*/, checkbox.check()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.page.waitForLoadState('networkidle')];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ShoppingPage.prototype.editItem = function (oldName, newData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getEditButton(oldName).click()];
                    case 1:
                        _a.sent();
                        if (!newData.name) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.itemNameInput.clear()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.itemNameInput.fill(newData.name)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!newData.quantity) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.itemQuantityInput.clear()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.itemQuantityInput.fill(newData.quantity)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        if (!newData.category) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.itemCategorySelect.selectOption({ label: newData.category })];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [4 /*yield*/, this.saveItemButton.click()];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, this.page.waitForLoadState('networkidle')];
                    case 11:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ShoppingPage.prototype.deleteItem = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var confirmButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDeleteButton(name).click()];
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
    ShoppingPage.prototype.expectItemVisible = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(this.getItem(name)).toBeVisible()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ShoppingPage.prototype.expectItemNotVisible = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(this.getItem(name)).not.toBeVisible()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ShoppingPage.prototype.expectItemPurchased = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var checkbox;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        checkbox = this.getItemCheckbox(name);
                        return [4 /*yield*/, expect(checkbox).toBeChecked()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ShoppingPage;
}());
export { ShoppingPage };
