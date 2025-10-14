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
var AuthPage = /** @class */ (function () {
    function AuthPage(page) {
        this.page = page;
    }
    Object.defineProperty(AuthPage.prototype, "emailInput", {
        // Locators
        get: function () {
            return this.page.getByPlaceholder(/email/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AuthPage.prototype, "passwordInput", {
        get: function () {
            return this.page.getByPlaceholder(/password/i).first();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AuthPage.prototype, "confirmPasswordInput", {
        get: function () {
            return this.page.getByPlaceholder(/confirm password/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AuthPage.prototype, "nameInput", {
        get: function () {
            return this.page.getByPlaceholder(/name/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AuthPage.prototype, "signInButton", {
        get: function () {
            return this.page.getByRole('button', { name: /sign in/i });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AuthPage.prototype, "signUpButton", {
        get: function () {
            return this.page.getByRole('button', { name: /sign up/i });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AuthPage.prototype, "createAccountButton", {
        get: function () {
            return this.page.getByRole('button', { name: /create account/i });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AuthPage.prototype, "switchToSignUpLink", {
        get: function () {
            return this.page.getByText(/don't have an account/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AuthPage.prototype, "switchToSignInLink", {
        get: function () {
            return this.page.getByText(/already have an account/i);
        },
        enumerable: false,
        configurable: true
    });
    // Actions
    AuthPage.prototype.goto = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.page.goto('/')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AuthPage.prototype.login = function (email, password) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.emailInput.fill(email)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.passwordInput.fill(password)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.signInButton.click()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.page.waitForLoadState('networkidle')];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AuthPage.prototype.register = function (name, email, password) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.signUpButton.isVisible()];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.signUpButton.click()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.nameInput.fill(name)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.emailInput.fill(email)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.passwordInput.fill(password)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.confirmPasswordInput.fill(password)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, this.createAccountButton.click()];
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
    AuthPage.prototype.switchToSignUp = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.signUpButton.click()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AuthPage.prototype.switchToSignIn = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.switchToSignInLink.isVisible()];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.switchToSignInLink.click()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Assertions
    AuthPage.prototype.expectLoginError = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(this.page.getByText(/invalid|error|wrong/i)).toBeVisible()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AuthPage.prototype.expectLoggedIn = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(this.page.getByRole('button', { name: /logout/i })).toBeVisible({ timeout: 10000 })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return AuthPage;
}());
export { AuthPage };
