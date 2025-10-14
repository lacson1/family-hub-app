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
import { Pool } from 'pg';
var testPool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres_test@localhost:5434/familyhub_test',
});
/**
 * Reset the test database by truncating all tables
 */
export function resetDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var client, tables, _i, tables_1, table, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testPool.connect()];
                case 1:
                    client = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 11, 13, 14]);
                    return [4 /*yield*/, client.query('BEGIN')];
                case 3:
                    _a.sent();
                    // Disable foreign key checks temporarily
                    return [4 /*yield*/, client.query('SET session_replication_role = replica;')];
                case 4:
                    // Disable foreign key checks temporarily
                    _a.sent();
                    tables = [
                        'contact_links',
                        'contact_family_associations',
                        'contacts',
                        'notifications',
                        'meals',
                        'budgets',
                        'transactions',
                        'family_relationships',
                        'shopping_items',
                        'events',
                        'tasks',
                        'family_members',
                        'users'
                    ];
                    _i = 0, tables_1 = tables;
                    _a.label = 5;
                case 5:
                    if (!(_i < tables_1.length)) return [3 /*break*/, 8];
                    table = tables_1[_i];
                    return [4 /*yield*/, client.query("TRUNCATE TABLE ".concat(table, " CASCADE;"))];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8: 
                // Re-enable foreign key checks
                return [4 /*yield*/, client.query('SET session_replication_role = DEFAULT;')];
                case 9:
                    // Re-enable foreign key checks
                    _a.sent();
                    return [4 /*yield*/, client.query('COMMIT')];
                case 10:
                    _a.sent();
                    return [3 /*break*/, 14];
                case 11:
                    error_1 = _a.sent();
                    return [4 /*yield*/, client.query('ROLLBACK')];
                case 12:
                    _a.sent();
                    console.error('Error resetting database:', error_1);
                    throw error_1;
                case 13:
                    client.release();
                    return [7 /*endfinally*/];
                case 14: return [2 /*return*/];
            }
        });
    });
}
/**
 * Seed the database with test data
 */
export function seedDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var client, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testPool.connect()];
                case 1:
                    client = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, 6, 7]);
                    // Seed family members
                    return [4 /*yield*/, client.query("\n      INSERT INTO family_members (id, name, role, color, generation) VALUES\n      ('11111111-1111-1111-1111-111111111111', 'John Doe', 'Parent', '#3b82f6', 0),\n      ('22222222-2222-2222-2222-222222222222', 'Jane Doe', 'Parent', '#ec4899', 0),\n      ('33333333-3333-3333-3333-333333333333', 'Little Johnny', 'Child', '#10b981', 1)\n      ON CONFLICT DO NOTHING;\n    ")];
                case 3:
                    // Seed family members
                    _a.sent();
                    // Seed some test users if auth table exists
                    return [4 /*yield*/, client.query("\n      INSERT INTO users (id, email, password_hash, name) VALUES\n      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'testuser@example.com', '$2a$10$dummyhash', 'Test User')\n      ON CONFLICT DO NOTHING;\n    ").catch(function () {
                            // Ignore if users table doesn't exist
                        })];
                case 4:
                    // Seed some test users if auth table exists
                    _a.sent();
                    return [3 /*break*/, 7];
                case 5:
                    error_2 = _a.sent();
                    console.error('Error seeding database:', error_2);
                    throw error_2;
                case 6:
                    client.release();
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Execute a raw SQL query
 */
export function executeQuery(query, params) {
    return __awaiter(this, void 0, void 0, function () {
        var client, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testPool.connect()];
                case 1:
                    client = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 4, 5]);
                    return [4 /*yield*/, client.query(query, params)];
                case 3:
                    result = _a.sent();
                    return [2 /*return*/, result];
                case 4:
                    client.release();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Close the database connection pool
 */
export function closeDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testPool.end()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
