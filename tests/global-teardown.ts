import { closeDatabase } from './utils/db-helpers';

async function globalTeardown() {
    console.log('\n🧹 Global Teardown: Cleaning up test environment...\n');

    try {
        // Close database connections
        console.log('🔌 Closing database connections...');
        await closeDatabase();

        console.log('✅ Global teardown completed successfully!\n');
    } catch (error) {
        console.error('❌ Global teardown failed:', error);
        throw error;
    }
}

export default globalTeardown;

