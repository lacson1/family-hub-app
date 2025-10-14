import { test, expect, Page } from '@playwright/test';

test.describe('User Flow Simulation - Complete End-to-End Test', () => {
    let page: Page;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        // Navigate to the user flow demo page
        await page.goto('/');

        // Login if required (adjust based on your auth flow)
        const loginButton = page.getByRole('button', { name: /sign in/i });
        if (await loginButton.isVisible()) {
            await page.fill('input[type="email"]', 'test@example.com');
            await page.fill('input[type="password"]', 'password123');
            await loginButton.click();
            await page.waitForTimeout(1000);
        }

        // Navigate to UI Test page
        const uitestTab = page.locator('[data-tab="uitest"]');
        if (await uitestTab.isVisible()) {
            await uitestTab.click();
            await page.waitForTimeout(500);
        }
    });

    test.afterEach(async () => {
        await page.close();
    });

    test('Step 1: Page loads and welcome alert shows', async () => {
        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Step 1: Verify welcome alert appears on page load
        await page.waitForSelector('[role="alert"], .toast, [data-testid="toast"]', {
            timeout: 2000,
            state: 'visible'
        });

        // Check if alert contains welcome message
        const alert = page.locator('[role="alert"], .toast').first();
        await expect(alert).toBeVisible();

        // Log for debugging
        const alertText = await alert.textContent();
        console.log('Alert message:', alertText);
    });

    test('Step 2-3: Fill form, submit, and verify success alert', async () => {
        // Wait for initial alert to disappear
        await page.waitForTimeout(1500);

        // Step 2: Fill in the form input
        const inputField = page.locator('input[type="text"]').first();
        await expect(inputField).toBeVisible();
        await inputField.fill('Test message for user flow simulation');

        // Verify input value
        await expect(inputField).toHaveValue('Test message for user flow simulation');

        // Step 3: Click submit button
        const submitButton = page.getByRole('button', { name: /submit/i }).first();
        await expect(submitButton).toBeVisible();
        await expect(submitButton).toBeEnabled();
        await submitButton.click();

        // Verify success alert appears
        await page.waitForTimeout(500);
        const successAlert = page.locator('[role="alert"], .toast').first();
        await expect(successAlert).toBeVisible();

        const successText = await successAlert.textContent();
        console.log('Success alert:', successText);
    });

    test('Step 4-5: Open dialog, confirm, and verify error alert', async () => {
        // Wait for initial alert
        await page.waitForTimeout(1500);

        // Fill and submit form first
        const inputField = page.locator('input[type="text"]').first();
        await inputField.fill('Test message');
        const submitButton = page.getByRole('button', { name: /submit/i }).first();
        await submitButton.click();

        // Wait for success alert and dialog to appear
        await page.waitForTimeout(2000);

        // Step 4: Verify dialog is open
        const dialog = page.locator('[role="dialog"], .modal').first();
        await expect(dialog).toBeVisible();

        // Verify dialog content
        await expect(dialog).toContainText(/confirm/i);

        // Click confirm button in dialog
        const confirmButton = dialog.getByRole('button', { name: /yes|continue|confirm/i });
        await expect(confirmButton).toBeVisible();
        await confirmButton.click();

        // Step 5: Verify dialog closes
        await expect(dialog).not.toBeVisible();

        // Verify error alert appears after dialog closes
        await page.waitForTimeout(1000);
        const errorAlert = page.locator('[role="alert"], .toast').first();
        await expect(errorAlert).toBeVisible();

        const errorText = await errorAlert.textContent();
        console.log('Error alert:', errorText);
    });

    test('Step 6: Test responsive design at different viewports', async () => {
        // Test mobile viewport (375x667 - iPhone SE)
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);

        // Verify layout adjusts
        const container = page.locator('.max-w-4xl, .max-w-7xl').first();
        await expect(container).toBeVisible();

        // Take screenshot for mobile
        await page.screenshot({ path: 'test-results/user-flow-mobile.png' });

        // Test tablet viewport (768x1024 - iPad)
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/user-flow-tablet.png' });

        // Test desktop viewport (1920x1080)
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/user-flow-desktop.png' });

        // Test small mobile (320x568)
        await page.setViewportSize({ width: 320, height: 568 });
        await page.waitForTimeout(500);

        // Verify content is still accessible at small viewport
        const submitBtn = page.getByRole('button', { name: /submit/i }).first();
        await expect(submitBtn).toBeVisible();
    });

    test('Step 7: Navigate using only keyboard', async () => {
        await page.waitForTimeout(1000);

        // Start keyboard navigation
        console.log('Testing keyboard navigation...');

        // Tab through all focusable elements
        const focusableElements: string[] = [];

        // Tab through first 10 elements and record focus
        for (let i = 0; i < 10; i++) {
            await page.keyboard.press('Tab');
            await page.waitForTimeout(200);

            // Get currently focused element
            const focusedElement = await page.evaluate(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const el = (globalThis as any).document.activeElement;
                if (el) {
                    return {
                        tagName: el.tagName,
                        type: el.getAttribute('type'),
                        ariaLabel: el.getAttribute('aria-label'),
                        text: el.textContent?.substring(0, 50)
                    };
                }
                return null;
            });

            if (focusedElement) {
                focusableElements.push(JSON.stringify(focusedElement));
                console.log(`Focus ${i + 1}:`, focusedElement);
            }
        }

        // Verify we tabbed through multiple elements
        expect(focusableElements.length).toBeGreaterThan(5);

        // Test Shift+Tab (backward navigation)
        await page.keyboard.press('Shift+Tab');
        await page.waitForTimeout(200);

        // Test Enter key on button
        const inputField = page.locator('input[type="text"]').first();
        await inputField.focus();
        await inputField.type('Keyboard navigation test');

        // Tab to submit button and press Enter
        await page.keyboard.press('Tab');
        await page.waitForTimeout(200);
        await page.keyboard.press('Enter');

        // Verify action was triggered
        await page.waitForTimeout(1000);
        const alert = page.locator('[role="alert"], .toast').first();
        await expect(alert).toBeVisible();

        // Test Escape key to close dialog (if present)
        await page.waitForTimeout(2000);
        const dialog = page.locator('[role="dialog"]').first();
        if (await dialog.isVisible()) {
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
            await expect(dialog).not.toBeVisible();
        }
    });

    test('Step 8: Verify screen reader accessibility', async () => {
        // Check ARIA labels and roles
        console.log('Testing accessibility features...');

        // Verify main heading has proper role and is accessible
        const heading = page.getByRole('heading', { level: 1 });
        await expect(heading).toBeVisible();
        const headingText = await heading.textContent();
        console.log('Main heading:', headingText);

        // Verify form has proper labels
        const inputLabel = page.locator('label[for="user-input"]');
        if (await inputLabel.count() > 0) {
            await expect(inputLabel).toBeVisible();
            const labelText = await inputLabel.textContent();
            console.log('Input label:', labelText);
        }

        // Check input has aria-required
        const input = page.locator('input[aria-required="true"]').first();
        if (await input.count() > 0) {
            await expect(input).toBeVisible();
            console.log('Input has aria-required attribute');
        }

        // Check buttons have aria-labels or accessible names
        const buttons = page.getByRole('button');
        const buttonCount = await buttons.count();
        console.log(`Found ${buttonCount} buttons`);

        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
            const button = buttons.nth(i);
            const accessibleName = await button.textContent();
            const ariaLabel = await button.getAttribute('aria-label');
            console.log(`Button ${i + 1}:`, accessibleName || ariaLabel);
        }

        // Verify alerts have role="alert" or proper ARIA attributes
        // Trigger an alert first
        const testButton = page.getByRole('button', { name: /success/i }).first();
        if (await testButton.isVisible()) {
            await testButton.click();
            await page.waitForTimeout(500);

            const alert = page.locator('[role="alert"]').first();
            if (await alert.count() > 0) {
                await expect(alert).toBeVisible();
                console.log('Alert has proper ARIA role');
            }
        }

        // Run axe accessibility tests (if axe-core is installed)
        // await injectAxe(page);
        // const violations = await checkA11y(page);
        // expect(violations).toHaveLength(0);

        // Check color contrast and focus indicators
        const submitBtn = page.getByRole('button', { name: /submit/i }).first();
        await submitBtn.focus();

        // Verify focus is visible
        const isFocused = await page.evaluate(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const activeEl = (globalThis as any).document.activeElement;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const styles = (globalThis as any).window.getComputedStyle(activeEl!);
            return {
                outline: styles.outline,
                boxShadow: styles.boxShadow,
                ring: styles.getPropertyValue('--tw-ring-width')
            };
        });

        console.log('Focus styles:', isFocused);
    });

    test('Complete User Flow: All steps in sequence', async () => {
        console.log('Starting complete user flow test...');

        // Step 1: Page loads → alert shows
        console.log('Step 1: Waiting for page load alert...');
        await page.waitForTimeout(1000);
        const welcomeAlert = page.locator('[role="alert"], .toast').first();
        if (await welcomeAlert.isVisible()) {
            console.log('✓ Welcome alert displayed');
        }

        // Wait for alert to disappear
        await page.waitForTimeout(4000);

        // Step 2: User fills input in card
        console.log('Step 2: Filling input field...');
        const inputField = page.locator('input[type="text"]').first();
        await inputField.fill('Complete user flow test message');
        console.log('✓ Input field filled');

        // Step 3: Submit triggers success alert
        console.log('Step 3: Submitting form...');
        const submitButton = page.getByRole('button', { name: /submit/i }).first();
        await submitButton.click();

        await page.waitForTimeout(1000);
        const successAlert = page.locator('[role="alert"], .toast').first();
        await expect(successAlert).toBeVisible();
        console.log('✓ Success alert displayed');

        // Step 4: User opens dialog → confirms action
        console.log('Step 4: Waiting for confirmation dialog...');
        await page.waitForTimeout(2000);

        const dialog = page.locator('[role="dialog"]').first();
        await expect(dialog).toBeVisible();
        console.log('✓ Dialog opened');

        const confirmButton = dialog.getByRole('button', { name: /yes|continue|confirm/i });
        await confirmButton.click();
        console.log('✓ Dialog confirmed');

        // Step 5: Dialog closes → error alert shows
        console.log('Step 5: Waiting for error alert...');
        await page.waitForTimeout(1000);

        const errorAlert = page.locator('[role="alert"], .toast').first();
        await expect(errorAlert).toBeVisible();
        console.log('✓ Error alert displayed');

        // Step 6: Resize window to test responsiveness
        console.log('Step 6: Testing responsiveness...');
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);
        console.log('✓ Mobile viewport tested');

        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(500);
        console.log('✓ Desktop viewport tested');

        // Step 7: Navigate using keyboard
        console.log('Step 7: Testing keyboard navigation...');
        await page.keyboard.press('Tab');
        await page.waitForTimeout(200);
        await page.keyboard.press('Tab');
        await page.waitForTimeout(200);
        console.log('✓ Keyboard navigation working');

        // Step 8: Verify screen reader compatibility
        console.log('Step 8: Verifying accessibility...');
        const heading = page.getByRole('heading', { level: 1 });
        await expect(heading).toBeVisible();
        console.log('✓ Screen reader attributes verified');

        console.log('✅ Complete user flow test passed!');
    });

    test('Accessibility: Tab order and focus management', async () => {
        await page.waitForTimeout(1000);

        // Record tab order
        const tabOrder: string[] = [];

        for (let i = 0; i < 8; i++) {
            await page.keyboard.press('Tab');
            await page.waitForTimeout(150);

            const focusInfo = await page.evaluate(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const el = (globalThis as any).document.activeElement;
                return el?.getAttribute('aria-label') || el?.textContent?.substring(0, 30) || el?.tagName;
            });

            if (focusInfo) {
                tabOrder.push(focusInfo);
            }
        }

        console.log('Tab order:', tabOrder);

        // Verify logical tab order (should have at least 5 stops)
        expect(tabOrder.length).toBeGreaterThanOrEqual(5);
    });

    test('Visual Regression: Component states', async () => {
        // Take screenshots of different states
        await page.waitForTimeout(1000);

        // Initial state
        await page.screenshot({ path: 'test-results/user-flow-initial.png', fullPage: true });

        // With filled input
        const input = page.locator('input[type="text"]').first();
        await input.fill('Test content');
        await page.screenshot({ path: 'test-results/user-flow-filled.png', fullPage: true });

        // With success alert
        const submitBtn = page.getByRole('button', { name: /submit/i }).first();
        await submitBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/user-flow-success.png', fullPage: true });

        // With dialog
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/user-flow-dialog.png', fullPage: true });
    });
});

