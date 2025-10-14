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
import { DashboardPage } from '../page-objects/DashboardPage';
test.describe('Dashboard Visual Tests', function () {
    var authPage;
    var dashboardPage;
    test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var testUser;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    authPage = new AuthPage(page);
                    dashboardPage = new DashboardPage(page);
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
                    return [4 /*yield*/, page.waitForLoadState('networkidle')];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(1000)];
                case 5:
                    _c.sent(); // Wait for dashboard to fully render
                    return [2 /*return*/];
            }
        });
    }); });
    test('dashboard home view', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: 
                // Navigate to home/dashboard
                return [4 /*yield*/, dashboardPage.navigateToHome()];
                case 1:
                    // Navigate to home/dashboard
                    _c.sent();
                    return [4 /*yield*/, page.waitForLoadState('networkidle')];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(500)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('dashboard-home.png', {
                            fullPage: true,
                            // Mask dynamic content like dates
                            mask: [page.locator('[data-testid*="date"]'), page.locator('time')],
                        })];
                case 4:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('dashboard with notifications panel open', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var notifButton;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, dashboardPage.navigateToHome()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, page.waitForLoadState('networkidle')];
                case 2:
                    _c.sent();
                    notifButton = page.locator('[data-testid="notifications-button"]');
                    return [4 /*yield*/, notifButton.isVisible().catch(function () { return false; })];
                case 3:
                    if (!_c.sent()) return [3 /*break*/, 6];
                    return [4 /*yield*/, notifButton.click()];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(500)];
                case 5:
                    _c.sent();
                    _c.label = 6;
                case 6: return [4 /*yield*/, expect(page).toHaveScreenshot('dashboard-notifications-open.png', {
                        fullPage: true,
                        mask: [page.locator('[data-testid*="timestamp"]'), page.locator('time')],
                    })];
                case 7:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('dashboard sidebar navigation', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, dashboardPage.navigateToHome()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, page.waitForLoadState('networkidle')];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('dashboard-sidebar.png', {
                            fullPage: false,
                            clip: { x: 0, y: 0, width: 300, height: 800 },
                        })];
                case 3:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('dashboard with modal overlay', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var addButton;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, dashboardPage.navigateToHome()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, page.waitForLoadState('networkidle')];
                case 2:
                    _c.sent();
                    addButton = page.locator('button:has-text("Add"), button:has-text("+")').first();
                    return [4 /*yield*/, addButton.isVisible().catch(function () { return false; })];
                case 3:
                    if (!_c.sent()) return [3 /*break*/, 7];
                    return [4 /*yield*/, addButton.click()];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, page.waitForTimeout(500)];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, expect(page).toHaveScreenshot('dashboard-modal-open.png', {
                            fullPage: true,
                        })];
                case 6:
                    _c.sent();
                    _c.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    }); });
});
