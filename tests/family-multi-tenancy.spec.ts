import { test, expect } from '@playwright/test';

test.describe('Family Multi-tenancy', () => {
  test('should create family and verify data isolation', async ({ page, browser }) => {
    // Create two separate browser contexts to simulate different users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Navigate to the app
    await page1.goto('http://localhost:5173');
    await page2.goto('http://localhost:5173');

    // User 1: Sign up and create family
    // Switch to sign up mode first
    await page1.click('text=Don\'t have an account? Sign Up');
    
    await page1.fill('input[placeholder="Enter your full name"]', 'User One');
    await page1.fill('input[placeholder="Enter your email"]', 'user1@test.com');
    await page1.fill('input[placeholder="Create a password"]', 'password123');
    await page1.click('button:has-text("Create Account")');
    
    // Wait for the signup to complete - check if we're still on auth page or moved to app
    await page1.waitForLoadState('networkidle');
    
    // Check if we're still on the auth page (signup failed) or moved to the app
    const isStillOnAuthPage = await page1.locator('text=Don\'t have an account? Sign Up').isVisible().catch(() => false);
    
    if (isStillOnAuthPage) {
      // Signup might have failed, let's check for error messages
      const errorMessage = await page1.locator('.bg-red-50').textContent().catch(() => '');
      throw new Error(`Signup failed. Error: ${errorMessage}`);
    }
    
    // Wait for authentication to complete and family setup wizard to appear
    await expect(page1.locator('text=Create Your Family')).toBeVisible({ timeout: 10000 });
    
    // Create family
    await page1.fill('[data-testid="family-name"]', 'Smith Family');
    await page1.click('[data-testid="create-family-button"]');
    
    // Should see invite step
    await expect(page1.locator('text=Invite Family Members')).toBeVisible({ timeout: 10000 });
    
    // Skip invite for now
    await page1.click('[data-testid="skip-invite-button"]');
    
    // Should be in main app now
    await expect(page1.locator('[data-testid="family-switcher"]')).toBeVisible({ timeout: 10000 });
    
    // Create a task in family 1
    await page1.click('button:has-text("Add Task")');
    await page1.fill('input[placeholder="Enter task title..."]', 'Family 1 Task');
    await page1.click('button:has-text("Add Task")');
    
    // User 2: Sign up and create different family
    // Switch to sign up mode first
    await page2.click('text=Don\'t have an account? Sign Up');
    
    await page2.fill('input[placeholder="Enter your full name"]', 'User Two');
    await page2.fill('input[placeholder="Enter your email"]', 'user2@test.com');
    await page2.fill('input[placeholder="Create a password"]', 'password123');
    await page2.click('button:has-text("Create Account")');
    
    // Wait for authentication to complete and family setup wizard to appear
    await expect(page2.locator('text=Create Your Family')).toBeVisible({ timeout: 10000 });
    
    // Create second family
    await page2.fill('[data-testid="family-name"]', 'Johnson Family');
    await page2.click('[data-testid="create-family-button"]');
    
    // Should see invite step
    await expect(page2.locator('text=Invite Family Members')).toBeVisible({ timeout: 10000 });
    
    // Skip invite for now
    await page2.click('[data-testid="skip-invite-button"]');
    
    // Should be in main app now
    await expect(page2.locator('[data-testid="family-switcher"]')).toBeVisible({ timeout: 10000 });
    
    // Create a task in family 2
    await page2.click('button:has-text("Add Task")');
    await page2.fill('input[placeholder="Enter task title..."]', 'Family 2 Task');
    await page2.click('button:has-text("Add Task")');
    
    // Verify data isolation - User 1 should not see User 2's task
    await page1.goto('http://localhost:5173');
    await expect(page1.locator('text=Family 1 Task')).toBeVisible();
    await expect(page1.locator('text=Family 2 Task')).not.toBeVisible();
    
    // Verify data isolation - User 2 should not see User 1's task
    await page2.goto('http://localhost:5173');
    await expect(page2.locator('text=Family 2 Task')).toBeVisible();
    await expect(page2.locator('text=Family 1 Task')).not.toBeVisible();
    
    // Test family switching (if user belongs to multiple families)
    // This would require inviting user1 to user2's family first
    
    await context1.close();
    await context2.close();
  });

  test('should handle family invitation flow', async ({ page, browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // User 1: Create family and send invite
    await page1.goto('http://localhost:5173');
    
    // Switch to sign up mode first
    await page1.click('text=Don\'t have an account? Sign Up');
    
    await page1.fill('input[placeholder="Enter your full name"]', 'Inviter User');
    await page1.fill('input[placeholder="Enter your email"]', 'inviter@test.com');
    await page1.fill('input[placeholder="Create a password"]', 'password123');
    await page1.click('button:has-text("Create Account")');
    
    // Wait for authentication to complete and family setup wizard to appear
    await expect(page1.locator('text=Create Your Family')).toBeVisible({ timeout: 10000 });
    
    await page1.fill('[data-testid="family-name"]', 'Invite Test Family');
    await page1.click('[data-testid="create-family-button"]');
    
    // Should see invite step
    await expect(page1.locator('text=Invite Family Members')).toBeVisible({ timeout: 10000 });
    
    // Send invite
    await page1.fill('[data-testid="invite-email"]', 'invitee@test.com');
    await page1.click('[data-testid="send-invite-button"]');
    
    // Should see complete step with invite code
    await expect(page1.locator('text=All Set!')).toBeVisible({ timeout: 10000 });
    
    // Get invite code from response
    const inviteCode = await page1.textContent('[data-testid="invite-code"]');
    expect(inviteCode).toBeTruthy();
    
    // Finish setup
    await page1.click('button:has-text("Get Started")');
    
    // Should be in main app now
    await expect(page1.locator('[data-testid="family-switcher"]')).toBeVisible({ timeout: 10000 });
    
    // User 2: Accept invite
    await page2.goto('http://localhost:5173');
    
    // Switch to sign up mode first
    await page2.click('text=Don\'t have an account? Sign Up');
    
    await page2.fill('input[placeholder="Enter your full name"]', 'Invitee User');
    await page2.fill('input[placeholder="Enter your email"]', 'invitee@test.com');
    await page2.fill('input[placeholder="Create a password"]', 'password123');
    await page2.click('button:has-text("Create Account")');
    
    // Wait for authentication to complete - should see invite acceptance screen
    await expect(page2.locator('text=Accept Invite')).toBeVisible({ timeout: 10000 });
    await page2.fill('[data-testid="invite-code"]', inviteCode!);
    await page2.click('[data-testid="accept-invite-button"]');
    
    // Should be in the family now
    await expect(page2.locator('[data-testid="family-switcher"]')).toBeVisible();
    
    // Both users should see the same family data
    await page1.goto('http://localhost:5173');
    await page2.goto('http://localhost:5173');
    
    // Create task as user 1
    await page1.click('button:has-text("Add Task")');
    await page1.fill('input[placeholder="Enter task title..."]', 'Shared Task');
    await page1.click('button:has-text("Add Task")');
    
    // User 2 should see the shared task
    await page2.goto('http://localhost:5173');
    await expect(page2.locator('text=Shared Task')).toBeVisible();
    
    await context1.close();
    await context2.close();
  });
});
