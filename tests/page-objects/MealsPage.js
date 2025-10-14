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
var MealsPage = /** @class */ (function () {
    function MealsPage(page) {
        this.page = page;
    }
    Object.defineProperty(MealsPage.prototype, "addMealButton", {
        // Locators
        get: function () {
            return this.page.getByRole('button', { name: /add meal|new meal|\+/i });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MealsPage.prototype, "mealNameInput", {
        get: function () {
            return this.page.getByPlaceholder(/name|meal/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MealsPage.prototype, "mealTypeSelect", {
        get: function () {
            return this.page.locator('select[name*="type" i]').first();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MealsPage.prototype, "mealDateInput", {
        get: function () {
            return this.page.locator('input[type="date"]').first();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MealsPage.prototype, "mealNotesInput", {
        get: function () {
            return this.page.getByPlaceholder(/notes/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MealsPage.prototype, "mealPrepTimeInput", {
        get: function () {
            return this.page.getByPlaceholder(/prep time/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MealsPage.prototype, "mealCookTimeInput", {
        get: function () {
            return this.page.getByPlaceholder(/cook time/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MealsPage.prototype, "mealServingsInput", {
        get: function () {
            return this.page.getByPlaceholder(/servings/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MealsPage.prototype, "saveMealButton", {
        get: function () {
            return this.page.getByRole('button', { name: /save|create|add/i });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MealsPage.prototype, "favoriteButton", {
        get: function () {
            return this.page.getByRole('button', { name: /favorite/i });
        },
        enumerable: false,
        configurable: true
    });
    MealsPage.prototype.getMeal = function (name) {
        return this.page.getByText(name);
    };
    MealsPage.prototype.getEditButton = function (name) {
        return this.page.locator("button[aria-label*=\"edit\" i]:near(:text(\"".concat(name, "\"))")).first();
    };
    MealsPage.prototype.getDeleteButton = function (name) {
        return this.page.locator("button[aria-label*=\"delete\" i]:near(:text(\"".concat(name, "\"))")).first();
    };
    // Actions
    MealsPage.prototype.addMeal = function (meal) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.addMealButton.click()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.mealNameInput.fill(meal.name)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.mealTypeSelect.selectOption({ label: meal.type })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.mealDateInput.fill(meal.date)];
                    case 4:
                        _a.sent();
                        if (!meal.notes) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.mealNotesInput.fill(meal.notes)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!meal.servings) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.mealServingsInput.fill(meal.servings)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [4 /*yield*/, this.saveMealButton.click()];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, this.page.waitForLoadState('networkidle')];
                    case 10:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MealsPage.prototype.editMeal = function (oldName, newData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getEditButton(oldName).click()];
                    case 1:
                        _a.sent();
                        if (!newData.name) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.mealNameInput.clear()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.mealNameInput.fill(newData.name)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!newData.type) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.mealTypeSelect.selectOption({ label: newData.type })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!newData.notes) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.mealNotesInput.fill(newData.notes)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [4 /*yield*/, this.saveMealButton.click()];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, this.page.waitForLoadState('networkidle')];
                    case 10:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MealsPage.prototype.deleteMeal = function (name) {
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
    MealsPage.prototype.markAsFavorite = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getMeal(name).click()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.favoriteButton.click()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.page.waitForLoadState('networkidle')];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Assertions
    MealsPage.prototype.expectMealVisible = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(this.getMeal(name)).toBeVisible()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MealsPage.prototype.expectMealNotVisible = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(this.getMeal(name)).not.toBeVisible()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return MealsPage;
}());
export { MealsPage };
