var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api';
/**
 * Make an API request
 */
export function apiRequest(endpoint_1) {
    return __awaiter(this, arguments, void 0, function (endpoint, options) {
        var _a, method, data, _b, headers, url, fetchOptions, response;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = options.method, method = _a === void 0 ? 'GET' : _a, data = options.data, _b = options.headers, headers = _b === void 0 ? {} : _b;
                    url = "".concat(API_BASE_URL).concat(endpoint);
                    fetchOptions = {
                        method: method,
                        headers: __assign({ 'Content-Type': 'application/json' }, headers),
                    };
                    if (data && method !== 'GET') {
                        fetchOptions.body = JSON.stringify(data);
                    }
                    return [4 /*yield*/, fetch(url, fetchOptions)];
                case 1:
                    response = _c.sent();
                    if (!response.ok) {
                        throw new Error("API request failed: ".concat(response.status, " ").concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _c.sent()];
            }
        });
    });
}
/**
 * Create test data via API
 */
export function createTask(taskData) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest('/tasks', {
                    method: 'POST',
                    data: taskData,
                })];
        });
    });
}
export function createEvent(eventData) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest('/events', {
                    method: 'POST',
                    data: eventData,
                })];
        });
    });
}
export function createFamilyMember(memberData) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest('/family-members', {
                    method: 'POST',
                    data: memberData,
                })];
        });
    });
}
export function createShoppingItem(itemData) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest('/shopping-items', {
                    method: 'POST',
                    data: itemData,
                })];
        });
    });
}
export function createMeal(mealData) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest('/meals', {
                    method: 'POST',
                    data: mealData,
                })];
        });
    });
}
export function createTransaction(transactionData) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest('/transactions', {
                    method: 'POST',
                    data: transactionData,
                })];
        });
    });
}
export function createBudget(budgetData) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest('/budgets', {
                    method: 'POST',
                    data: budgetData,
                })];
        });
    });
}
export function createContact(contactData) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest('/contacts', {
                    method: 'POST',
                    data: contactData,
                })];
        });
    });
}
/**
 * Delete test data via API
 */
export function deleteTask(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest("/tasks/".concat(id), { method: 'DELETE' })];
        });
    });
}
export function deleteEvent(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest("/events/".concat(id), { method: 'DELETE' })];
        });
    });
}
export function deleteFamilyMember(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest("/family-members/".concat(id), { method: 'DELETE' })];
        });
    });
}
export function deleteShoppingItem(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest("/shopping-items/".concat(id), { method: 'DELETE' })];
        });
    });
}
export function deleteMeal(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest("/meals/".concat(id), { method: 'DELETE' })];
        });
    });
}
export function deleteTransaction(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest("/transactions/".concat(id), { method: 'DELETE' })];
        });
    });
}
export function deleteBudget(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest("/budgets/".concat(id), { method: 'DELETE' })];
        });
    });
}
export function deleteContact(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest("/contacts/".concat(id), { method: 'DELETE' })];
        });
    });
}
/**
 * Get test data via API
 */
export function getTasks() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest('/tasks')];
        });
    });
}
export function getEvents() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest('/events')];
        });
    });
}
export function getFamilyMembers() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest('/family-members')];
        });
    });
}
export function getShoppingItems() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest('/shopping-items')];
        });
    });
}
export function getMeals() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest('/meals')];
        });
    });
}
export function getTransactions() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest('/transactions')];
        });
    });
}
export function getBudgets() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest('/budgets')];
        });
    });
}
export function getContacts() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiRequest('/contacts')];
        });
    });
}
