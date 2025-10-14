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
var ContactsPage = /** @class */ (function () {
    function ContactsPage(page) {
        this.page = page;
    }
    Object.defineProperty(ContactsPage.prototype, "addContactButton", {
        // Locators
        get: function () {
            return this.page.getByRole('button', { name: /add contact|new contact|\+/i });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContactsPage.prototype, "contactNameInput", {
        get: function () {
            return this.page.getByPlaceholder(/name/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContactsPage.prototype, "contactCategorySelect", {
        get: function () {
            return this.page.locator('select[name*="category" i]').first();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContactsPage.prototype, "contactPhoneInput", {
        get: function () {
            return this.page.getByPlaceholder(/phone/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContactsPage.prototype, "contactEmailInput", {
        get: function () {
            return this.page.getByPlaceholder(/email/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContactsPage.prototype, "contactAddressInput", {
        get: function () {
            return this.page.getByPlaceholder(/address/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContactsPage.prototype, "contactNotesInput", {
        get: function () {
            return this.page.getByPlaceholder(/notes/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContactsPage.prototype, "saveContactButton", {
        get: function () {
            return this.page.getByRole('button', { name: /save|create|add/i });
        },
        enumerable: false,
        configurable: true
    });
    ContactsPage.prototype.getContact = function (name) {
        return this.page.getByText(name);
    };
    ContactsPage.prototype.getEditButton = function (name) {
        return this.page.locator("button[aria-label*=\"edit\" i]:near(:text(\"".concat(name, "\"))")).first();
    };
    ContactsPage.prototype.getDeleteButton = function (name) {
        return this.page.locator("button[aria-label*=\"delete\" i]:near(:text(\"".concat(name, "\"))")).first();
    };
    ContactsPage.prototype.getFavoriteButton = function (name) {
        return this.page.locator("button[aria-label*=\"favorite\" i]:near(:text(\"".concat(name, "\"))")).first();
    };
    // Actions
    ContactsPage.prototype.addContact = function (contact) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.addContactButton.click()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.contactNameInput.fill(contact.name)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.contactCategorySelect.selectOption({ label: contact.category })];
                    case 3:
                        _a.sent();
                        if (!contact.phone) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.contactPhoneInput.fill(contact.phone)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        if (!contact.email) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.contactEmailInput.fill(contact.email)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        if (!contact.address) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.contactAddressInput.fill(contact.address)];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [4 /*yield*/, this.saveContactButton.click()];
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
    ContactsPage.prototype.editContact = function (oldName, newData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getEditButton(oldName).click()];
                    case 1:
                        _a.sent();
                        if (!newData.name) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.contactNameInput.clear()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.contactNameInput.fill(newData.name)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!newData.phone) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.contactPhoneInput.clear()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.contactPhoneInput.fill(newData.phone)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        if (!newData.email) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.contactEmailInput.clear()];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, this.contactEmailInput.fill(newData.email)];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10: return [4 /*yield*/, this.saveContactButton.click()];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, this.page.waitForLoadState('networkidle')];
                    case 12:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ContactsPage.prototype.deleteContact = function (name) {
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
    ContactsPage.prototype.markAsFavorite = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getFavoriteButton(name).click()];
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
    // Assertions
    ContactsPage.prototype.expectContactVisible = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(this.getContact(name)).toBeVisible()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ContactsPage.prototype.expectContactNotVisible = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(this.getContact(name)).not.toBeVisible()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ContactsPage;
}());
export { ContactsPage };
