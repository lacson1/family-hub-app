/**
 * Reset the test database by truncating all tables
 */
export declare function resetDatabase(): Promise<void>;
/**
 * Seed the database with test data
 */
export declare function seedDatabase(): Promise<void>;
/**
 * Execute a raw SQL query
 */
export declare function executeQuery(query: string, params?: unknown[]): Promise<import("pg").QueryResult<any>>;
/**
 * Close the database connection pool
 */
export declare function closeDatabase(): Promise<void>;
