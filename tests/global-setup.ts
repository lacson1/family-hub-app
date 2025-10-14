import { resetDatabase, seedDatabase } from './utils/db-helpers';
import { createTestUser, DEFAULT_TEST_USER } from './utils/auth-helpers';

async function globalSetup() {
    console.log('\n🔧 Global Setup: Preparing test environment...\n');

    try {
        // Reset and seed the test database
        console.log('📦 Resetting test database...');
        await resetDatabase();

        console.log('🌱 Seeding test database...');
        await seedDatabase();

        // Create test user
        console.log('👤 Creating test user...');
        await createTestUser(DEFAULT_TEST_USER);

        console.log('✅ Global setup completed successfully!\n');
    } catch (error) {
        console.error('❌ Global setup failed:', error);
        throw error;
    }
}

export default globalSetup;

