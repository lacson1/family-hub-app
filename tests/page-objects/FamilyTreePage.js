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
var FamilyTreePage = /** @class */ (function () {
    function FamilyTreePage(page) {
        this.page = page;
    }
    Object.defineProperty(FamilyTreePage.prototype, "addMemberButton", {
        // Locators
        get: function () {
            return this.page.getByRole('button', { name: /add member|new member|\+/i });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FamilyTreePage.prototype, "memberNameInput", {
        get: function () {
            return this.page.getByPlaceholder(/name/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FamilyTreePage.prototype, "memberRoleInput", {
        get: function () {
            return this.page.getByPlaceholder(/role/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FamilyTreePage.prototype, "memberColorInput", {
        get: function () {
            return this.page.locator('input[type="color"]').first();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FamilyTreePage.prototype, "memberPhoneInput", {
        get: function () {
            return this.page.getByPlaceholder(/phone/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FamilyTreePage.prototype, "memberEmailInput", {
        get: function () {
            return this.page.getByPlaceholder(/email/i);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FamilyTreePage.prototype, "memberBirthDateInput", {
        get: function () {
            return this.page.locator('input[type="date"]').first();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FamilyTreePage.prototype, "saveMemberButton", {
        get: function () {
            return this.page.getByRole('button', { name: /save|create|add/i });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FamilyTreePage.prototype, "addRelationshipButton", {
        get: function () {
            return this.page.getByRole('button', { name: /add relationship/i });
        },
        enumerable: false,
        configurable: true
    });
    FamilyTreePage.prototype.getMember = function (name) {
        return this.page.getByText(name);
    };
    FamilyTreePage.prototype.getEditButton = function (name) {
        return this.page.locator("button[aria-label*=\"edit\" i]:near(:text(\"".concat(name, "\"))")).first();
    };
    FamilyTreePage.prototype.getDeleteButton = function (name) {
        return this.page.locator("button[aria-label*=\"delete\" i]:near(:text(\"".concat(name, "\"))")).first();
    };
    // Actions
    FamilyTreePage.prototype.addMember = function (member) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.addMemberButton.click()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.memberNameInput.fill(member.name)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.memberRoleInput.fill(member.role)];
                    case 3:
                        _a.sent();
                        if (!member.phone) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.memberPhoneInput.fill(member.phone)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        if (!member.email) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.memberEmailInput.fill(member.email)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [4 /*yield*/, this.saveMemberButton.click()];
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
    FamilyTreePage.prototype.editMember = function (oldName, newData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getEditButton(oldName).click()];
                    case 1:
                        _a.sent();
                        if (!newData.name) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.memberNameInput.clear()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.memberNameInput.fill(newData.name)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!newData.role) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.memberRoleInput.clear()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.memberRoleInput.fill(newData.role)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        if (!newData.phone) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.memberPhoneInput.fill(newData.phone)];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [4 /*yield*/, this.saveMemberButton.click()];
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
    FamilyTreePage.prototype.deleteMember = function (name) {
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
    FamilyTreePage.prototype.addRelationship = function (person1, person2, type) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.addRelationshipButton.click()];
                    case 1:
                        _a.sent();
                        // Fill relationship form - exact selectors depend on UI implementation
                        return [4 /*yield*/, this.page.locator('select').first().selectOption({ label: person1 })];
                    case 2:
                        // Fill relationship form - exact selectors depend on UI implementation
                        _a.sent();
                        return [4 /*yield*/, this.page.locator('select').nth(1).selectOption({ label: person2 })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.page.locator('select').nth(2).selectOption({ label: type })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.saveMemberButton.click()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.page.waitForLoadState('networkidle')];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Assertions
    FamilyTreePage.prototype.expectMemberVisible = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(this.getMember(name)).toBeVisible()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FamilyTreePage.prototype.expectMemberNotVisible = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(this.getMember(name)).not.toBeVisible()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return FamilyTreePage;
}());
export { FamilyTreePage };
