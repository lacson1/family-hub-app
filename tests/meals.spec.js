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
import { MealsPage } from './page-objects/MealsPage';
import { login } from './utils/auth-helpers';
import { faker } from '@faker-js/faker';
test.describe('Meal Planning', function () {
    var mealsPage;
    var dashboardPage;
    test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, login(page)];
                case 1:
                    _c.sent();
                    dashboardPage = new DashboardPage(page);
                    mealsPage = new MealsPage(page);
                    return [4 /*yield*/, dashboardPage.navigateToMeals()];
                case 2:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should display meals page', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, expect(mealsPage.addMealButton).toBeVisible()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should add a new meal', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mealName, today;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mealName = faker.lorem.words(2);
                    today = new Date().toISOString().split('T')[0];
                    return [4 /*yield*/, mealsPage.addMeal({
                            name: mealName,
                            type: 'dinner',
                            date: today,
                            notes: faker.lorem.sentence(),
                            servings: '4',
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, mealsPage.expectMealVisible(mealName)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should edit a meal', function () { return __awaiter(void 0, void 0, void 0, function () {
        var originalName, updatedName, today;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    originalName = faker.lorem.words(2);
                    updatedName = faker.lorem.words(2);
                    today = new Date().toISOString().split('T')[0];
                    // Add a meal
                    return [4 /*yield*/, mealsPage.addMeal({
                            name: originalName,
                            type: 'lunch',
                            date: today,
                        })];
                case 1:
                    // Add a meal
                    _a.sent();
                    // Edit the meal
                    return [4 /*yield*/, mealsPage.editMeal(originalName, {
                            name: updatedName,
                            type: 'dinner',
                            notes: 'Updated notes',
                        })];
                case 2:
                    // Edit the meal
                    _a.sent();
                    return [4 /*yield*/, mealsPage.expectMealVisible(updatedName)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, mealsPage.expectMealNotVisible(originalName)];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should delete a meal', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mealName, today;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mealName = faker.lorem.words(2);
                    today = new Date().toISOString().split('T')[0];
                    // Add a meal
                    return [4 /*yield*/, mealsPage.addMeal({
                            name: mealName,
                            type: 'breakfast',
                            date: today,
                        })];
                case 1:
                    // Add a meal
                    _a.sent();
                    return [4 /*yield*/, mealsPage.expectMealVisible(mealName)];
                case 2:
                    _a.sent();
                    // Delete the meal
                    return [4 /*yield*/, mealsPage.deleteMeal(mealName)];
                case 3:
                    // Delete the meal
                    _a.sent();
                    return [4 /*yield*/, mealsPage.expectMealNotVisible(mealName)];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should create meals of different types', function () { return __awaiter(void 0, void 0, void 0, function () {
        var today, mealTypes, _i, mealTypes_1, type, mealName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    today = new Date().toISOString().split('T')[0];
                    mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
                    _i = 0, mealTypes_1 = mealTypes;
                    _a.label = 1;
                case 1:
                    if (!(_i < mealTypes_1.length)) return [3 /*break*/, 5];
                    type = mealTypes_1[_i];
                    mealName = "".concat(type, " - ").concat(faker.lorem.words(2));
                    return [4 /*yield*/, mealsPage.addMeal({
                            name: mealName,
                            type: type,
                            date: today,
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, mealsPage.expectMealVisible(mealName)];
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
    test('should mark meal as favorite', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mealName, today;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mealName = faker.lorem.words(2);
                    today = new Date().toISOString().split('T')[0];
                    // Add a meal
                    return [4 /*yield*/, mealsPage.addMeal({
                            name: mealName,
                            type: 'dinner',
                            date: today,
                        })];
                case 1:
                    // Add a meal
                    _a.sent();
                    // Mark as favorite
                    return [4 /*yield*/, mealsPage.markAsFavorite(mealName)];
                case 2:
                    // Mark as favorite
                    _a.sent();
                    return [4 /*yield*/, mealsPage.expectMealVisible(mealName)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
