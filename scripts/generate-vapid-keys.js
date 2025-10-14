#!/usr/bin/env node

/**
 * Generate VAPID keys for Web Push notifications
 * Run this script once to generate your keys, then add them to your .env file
 */

// This script requires running from backend directory or having web-push installed
async function generateKeys() {
    try {
        // Try to import from backend node_modules
        const { default: webpush } = await
        import ('../backend/node_modules/web-push/index.js');

        console.log('\n🔑 Generating VAPID Keys for Push Notifications...\n');

        const vapidKeys = webpush.generateVAPIDKeys();

        console.log('✅ Keys generated successfully!\n');
        console.log('Add these to your backend/.env file:\n');
        console.log('----------------------------------------');
        console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
        console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
        console.log(`VAPID_SUBJECT=mailto:admin@familyhub.com`);
        console.log('----------------------------------------\n');

        console.log('💡 Tips:');
        console.log('  - Keep the private key secret!');
        console.log('  - Update VAPID_SUBJECT with your actual email');
        console.log('  - Restart your backend server after adding keys\n');
    } catch (error) {
        console.error('Error: web-push not found. Please install it in the backend:');
        console.error('  cd backend && npm install web-push\n');
        process.exit(1);
    }
}

generateKeys();