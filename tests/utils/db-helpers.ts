import { Pool } from 'pg';

const testPool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres_test@localhost:5434/familyhub_test',
});

/**
 * Reset the test database by truncating all tables
 */
export async function resetDatabase() {
    const client = await testPool.connect();
    try {
        await client.query('BEGIN');

        // Disable foreign key checks temporarily
        await client.query('SET session_replication_role = replica;');

        // Truncate all tables
        const tables = [
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

        for (const table of tables) {
            await client.query(`TRUNCATE TABLE ${table} CASCADE;`);
        }

        // Re-enable foreign key checks
        await client.query('SET session_replication_role = DEFAULT;');

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error resetting database:', error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Seed the database with test data
 */
export async function seedDatabase() {
    const client = await testPool.connect();
    try {
        // Seed family members
        await client.query(`
      INSERT INTO family_members (id, name, role, color, generation) VALUES
      ('11111111-1111-1111-1111-111111111111', 'John Doe', 'Parent', '#3b82f6', 0),
      ('22222222-2222-2222-2222-222222222222', 'Jane Doe', 'Parent', '#ec4899', 0),
      ('33333333-3333-3333-3333-333333333333', 'Little Johnny', 'Child', '#10b981', 1)
      ON CONFLICT DO NOTHING;
    `);

        // Seed some test users if auth table exists
        await client.query(`
      INSERT INTO users (id, email, password_hash, name) VALUES
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'testuser@example.com', '$2a$10$dummyhash', 'Test User')
      ON CONFLICT DO NOTHING;
    `).catch(() => {
            // Ignore if users table doesn't exist
        });

    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Execute a raw SQL query
 */
export async function executeQuery(query: string, params?: unknown[]) {
    const client = await testPool.connect();
    try {
        const result = await client.query(query, params);
        return result;
    } finally {
        client.release();
    }
}

/**
 * Close the database connection pool
 */
export async function closeDatabase() {
    await testPool.end();
}

