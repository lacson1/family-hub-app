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
import { AuthPage } from './page-objects/AuthPage';
import { DashboardPage } from './page-objects/DashboardPage';
import { faker } from '@faker-js/faker';
test.describe('Authentication', function () {
    var authPage;
    var dashboardPage;
    test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    authPage = new AuthPage(page);
                    dashboardPage = new DashboardPage(page);
                    return [4 /*yield*/, authPage.goto()];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should display login page', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, expect(authPage.signInButton).toBeVisible()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, expect(authPage.emailInput).toBeVisible()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, expect(authPage.passwordInput).toBeVisible()];
                case 3:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should register new user successfully', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var newUser;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    newUser = {
                        name: faker.person.fullName(),
                        email: faker.internet.email(),
                        password: 'TestPassword123!',
                    };
                    return [4 /*yield*/, authPage.register(newUser.name, newUser.email, newUser.password)];
                case 1:
                    _c.sent();
                    // Should be redirected to dashboard after successful registration
                    return [4 /*yield*/, authPage.expectLoggedIn()];
                case 2:
                    // Should be redirected to dashboard after successful registration
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should login with valid credentials', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var testUser;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    testUser = {
                        email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
                        password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
                    };
                    return [4 /*yield*/, authPage.login(testUser.email, testUser.password)];
                case 1:
                    _c.sent();
                    // Should be redirected to dashboard
                    return [4 /*yield*/, authPage.expectLoggedIn()];
                case 2:
                    // Should be redirected to dashboard
                    _c.sent();
                    return [4 /*yield*/, dashboardPage.expectDashboardLoaded()];
                case 3:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should show error for invalid credentials', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, authPage.login('invalid@example.com', 'wrongpassword')];
                case 1:
                    _c.sent();
                    // Should show error message
                    return [4 /*yield*/, authPage.expectLoginError()];
                case 2:
                    // Should show error message
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should logout successfully', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var testUser;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    testUser = {
                        email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
                        password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
                    };
                    return [4 /*yield*/, authPage.login(testUser.email, testUser.password)];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, authPage.expectLoggedIn()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, dashboardPage.logout()];
                case 3:
                    _c.sent();
                    // Should be redirected to login page
                    return [4 /*yield*/, expect(authPage.signInButton).toBeVisible()];
                case 4:
                    // Should be redirected to login page
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should toggle between sign in and sign up forms', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, expect(authPage.signInButton).toBeVisible()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, authPage.switchToSignUp()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, expect(authPage.createAccountButton).toBeVisible()];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, authPage.switchToSignIn()];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, expect(authPage.signInButton).toBeVisible()];
                case 5:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should persist session after page reload', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var testUser;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    testUser = {
                        email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
                        password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
                    };
                    return [4 /*yield*/, authPage.login(testUser.email, testUser.password)];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, authPage.expectLoggedIn()];
                case 2:
                    _c.sent();
                    // Reload the page
                    return [4 /*yield*/, page.reload()];
                case 3:
                    // Reload the page
                    _c.sent();
                    // Should still be logged in
                    return [4 /*yield*/, authPage.expectLoggedIn()];
                case 4:
                    // Should still be logged in
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
