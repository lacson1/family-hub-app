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
import { ContactsPage } from '../page-objects/ContactsPage';
test.describe('Contacts Visual Tests', function () {
    var authPage;
    var contactsPage;
    test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var testUser;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    authPage = new AuthPage(page);
                    contactsPage = new ContactsPage(page);
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
                    // Navigate to contacts
                    return [4 /*yield*/, contactsPage.goto()];
                case 4:
                    // Navigate to contacts
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
    test('contacts list default view', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, expect(page).toHaveScreenshot('contacts-list-default.png', {
                        fullPage: true,
                    })];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('contacts grid view', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var gridViewButton;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    gridViewButton = page.locator('[data-testid="grid-view"], button:has-text("Grid")');
                    return [4 /*yield*/, gridViewButton.isVisible().catch(function () { return false; })];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, gridViewButton.click()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(500)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('contacts-grid-view.png', {
                            fullPage: true,
                        })];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('contacts add contact modal', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var addButton;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    addButton = page.locator('[data-testid="add-contact-button"], button:has-text("Add Contact")');
                    return [4 /*yield*/, addButton.isVisible().catch(function () { return false; })];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, addButton.click()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(500)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('contacts-add-modal.png', {
                            fullPage: true,
                        })];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('contacts details view', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var firstContact;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    firstContact = page.locator('[data-testid="contact-item"]').first();
                    return [4 /*yield*/, firstContact.isVisible().catch(function () { return false; })];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, firstContact.click()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(500)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('contacts-details-view.png', {
                            fullPage: true,
                        })];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('contacts search functionality', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var searchInput;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    searchInput = page.locator('[data-testid="contact-search"], input[placeholder*="Search"]');
                    return [4 /*yield*/, searchInput.isVisible().catch(function () { return false; })];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, searchInput.fill('test')];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(500)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('contacts-search-results.png', {
                            fullPage: true,
                        })];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('contacts filter by category', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var filterButton;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    filterButton = page.locator('[data-testid="filter-contacts"], button:has-text("Filter")');
                    return [4 /*yield*/, filterButton.isVisible().catch(function () { return false; })];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, filterButton.click()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(300)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('contacts-filter-menu.png', {
                            fullPage: true,
                        })];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
});
