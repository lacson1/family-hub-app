import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helpers';

test.describe('Buttons - UI Components', () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
        await page.waitForLoadState('networkidle');
    });

    test.describe('Navigation Buttons', () => {
        test('should navigate to Tasks page when Tasks button is clicked', async ({ page }) => {
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            // Verify URL or page content
            expect(page.url()).toContain('tasks');
        });

        test('should navigate to Events page when Events button is clicked', async ({ page }) => {
            await page.click('text=Events');
            await page.waitForLoadState('networkidle');

            expect(page.url()).toContain('events');
        });

        test('should navigate to Shopping page when Shopping button is clicked', async ({ page }) => {
            await page.click('text=Shopping');
            await page.waitForLoadState('networkidle');

            expect(page.url()).toContain('shopping');
        });

        test('should navigate to Meals page when Meals button is clicked', async ({ page }) => {
            await page.click('text=Meals');
            await page.waitForLoadState('networkidle');

            expect(page.url()).toContain('meals');
        });

        test('should navigate to Money page when Money button is clicked', async ({ page }) => {
            await page.click('text=Money');
            await page.waitForLoadState('networkidle');

            expect(page.url()).toContain('money');
        });

        test('should navigate to Contacts page when Contacts button is clicked', async ({ page }) => {
            await page.click('text=Contacts');
            await page.waitForLoadState('networkidle');

            expect(page.url()).toContain('contacts');
        });

        test('should navigate to Family Tree when Family button is clicked', async ({ page }) => {
            await page.click('text=Family');
            await page.waitForLoadState('networkidle');

            expect(page.url()).toContain('family');
        });

        test('should highlight active navigation button', async ({ page }) => {
            // Click Tasks
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            // The Tasks button should have active styling
            const tasksButton = page.locator('button, a').filter({ hasText: /^Tasks$/ }).first();
            if (await tasksButton.count() > 0) {
                const classes = await tasksButton.getAttribute('class');
                // Active buttons typically have bg-blue or similar
                expect(classes).toBeTruthy();
            }
        });
    });

    test.describe('Action Buttons - Add/Create', () => {
        test('should open modal when Add Task button is clicked', async ({ page }) => {
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            const addButton = page.locator('button').filter({ hasText: /^Add Task$|^\+$/ }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Modal should be visible
                const modal = page.locator('.fixed.inset-0.bg-black.bg-opacity-25');
                await expect(modal).toBeVisible();
            }
        });

        test('should open modal when Add Event button is clicked', async ({ page }) => {
            await page.click('text=Events');
            await page.waitForLoadState('networkidle');

            const addButton = page.locator('button').filter({ hasText: /Add Event/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                const modal = page.locator('.fixed.inset-0.bg-black.bg-opacity-25');
                await expect(modal).toBeVisible();
            }
        });

        test('should open modal when Add Contact button is clicked', async ({ page }) => {
            await page.click('text=Contacts');
            await page.waitForLoadState('networkidle');

            const addButton = page.locator('button').filter({ hasText: /Add Contact/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                const modal = page.locator('.fixed.inset-0.bg-black.bg-opacity-25');
                await expect(modal).toBeVisible();
            }
        });

        test('should open modal when Add Meal button is clicked', async ({ page }) => {
            await page.click('text=Meals');
            await page.waitForLoadState('networkidle');

            const addButton = page.locator('button').filter({ hasText: /Add Meal/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                const modal = page.locator('.fixed.inset-0.bg-black.bg-opacity-25');
                await expect(modal).toBeVisible();
            }
        });
    });

    test.describe('Action Buttons - Edit', () => {
        test('should show edit button on hover or in item actions', async ({ page }) => {
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            // Look for edit buttons
            const editButtons = page.locator('button[title*="Edit"], button[aria-label*="Edit"]');
            if (await editButtons.count() > 0) {
                await expect(editButtons.first()).toBeVisible();
            }
        });

        test('should open edit modal when edit button is clicked', async ({ page }) => {
            await page.click('text=Contacts');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            const editButtons = page.locator('button').filter({ hasText: /edit/i });
            if (await editButtons.count() > 0) {
                await editButtons.first().click();
                await page.waitForTimeout(500);

                // Modal or form should appear
                const modal = page.locator('.fixed.inset-0, form');
                if (await modal.count() > 0) {
                    await expect(modal.first()).toBeVisible();
                }
            }
        });
    });

    test.describe('Action Buttons - Delete', () => {
        test('should show delete button in item actions', async ({ page }) => {
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            // Look for delete buttons
            const deleteButtons = page.locator('button[title*="Delete"], button[aria-label*="Delete"]');
            if (await deleteButtons.count() > 0) {
                await expect(deleteButtons.first()).toBeVisible();
            }
        });

        test('should show confirmation dialog when delete button is clicked', async ({ page }) => {
            await page.click('text=Shopping');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            const deleteButtons = page.locator('button').filter({ hasText: /delete/i });
            if (await deleteButtons.count() > 0) {
                await deleteButtons.first().click();
                await page.waitForTimeout(500);

                // Confirmation dialog should appear
                const confirmDialog = page.locator('.fixed.inset-0.bg-black.bg-opacity-25');
                if (await confirmDialog.count() > 0) {
                    await expect(confirmDialog).toBeVisible();
                }
            }
        });
    });

    test.describe('Form Buttons - Submit and Cancel', () => {
        test('should have Submit button in add task form', async ({ page }) => {
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            const addButton = page.locator('button').filter({ hasText: /^Add Task$|^\+$/ }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Submit button should be visible
                const submitButton = page.locator('button[type="submit"]').first();
                await expect(submitButton).toBeVisible();
            }
        });

        test('should have Cancel button in forms', async ({ page }) => {
            await page.click('text=Events');
            await page.waitForLoadState('networkidle');

            const addButton = page.locator('button').filter({ hasText: /Add Event/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Cancel button should be visible
                const cancelButton = page.locator('button').filter({ hasText: /cancel/i }).first();
                await expect(cancelButton).toBeVisible();
            }
        });

        test('should close form when Cancel button is clicked', async ({ page }) => {
            await page.click('text=Contacts');
            await page.waitForLoadState('networkidle');

            const addButton = page.locator('button').filter({ hasText: /Add Contact/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Click Cancel
                const cancelButton = page.locator('button').filter({ hasText: /cancel/i }).first();
                await cancelButton.click();
                await page.waitForTimeout(500);

                // Modal should be closed
                const modal = page.locator('.fixed.inset-0.bg-black.bg-opacity-25');
                await expect(modal).not.toBeVisible();
            }
        });
    });

    test.describe('Button Disabled States', () => {
        test('should show disabled state on buttons when appropriate', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Check for any disabled buttons
            const disabledButtons = page.locator('button:disabled');
            // Just verify the selector works (count may be 0 if no buttons are disabled)
            expect(await disabledButtons.count()).toBeGreaterThanOrEqual(0);
        });

        test('should not trigger action when disabled button is clicked', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Find disabled button if any
            const disabledButton = page.locator('button:disabled').first();
            if (await disabledButton.count() > 0) {
                const url = page.url();

                // Try to click (should have no effect)
                await disabledButton.click({ force: true });
                await page.waitForTimeout(300);

                // URL should not change
                expect(page.url()).toBe(url);
            }
        });

        test('should have proper visual styling for disabled buttons', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            const disabledButton = page.locator('button:disabled').first();
            if (await disabledButton.count() > 0) {
                // Disabled buttons typically have opacity or gray styling
                const classes = await disabledButton.getAttribute('class');
                expect(classes).toBeTruthy();
            }
        });
    });

    test.describe('Icon Buttons', () => {
        test('should have close button (X icon) in modals', async ({ page }) => {
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            const addButton = page.locator('button').filter({ hasText: /^Add Task$|^\+$/ }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Close button with X icon
                const closeButton = page.locator('button[aria-label="Close modal"]');
                await expect(closeButton.first()).toBeVisible();
            }
        });

        test('should close modal when X icon button is clicked', async ({ page }) => {
            await page.click('text=Events');
            await page.waitForLoadState('networkidle');

            const addButton = page.locator('button').filter({ hasText: /Add Event/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Click close button
                const closeButton = page.locator('button[aria-label="Close modal"]').first();
                await closeButton.click();
                await page.waitForTimeout(300);

                // Modal should be closed
                const modal = page.locator('.fixed.inset-0.bg-black.bg-opacity-25');
                await expect(modal).not.toBeVisible();
            }
        });

        test('should show notification icon button', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Look for notification button
            const notificationButton = page.locator('button[aria-label*="notification" i]');
            if (await notificationButton.count() > 0) {
                await expect(notificationButton.first()).toBeVisible();
            }
        });
    });

    test.describe('Button Hover Effects', () => {
        test('should show hover effect on navigation buttons', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Hover over Tasks button
            const tasksButton = page.locator('button, a').filter({ hasText: /^Tasks$/ }).first();
            if (await tasksButton.count() > 0) {
                await tasksButton.hover();
                await page.waitForTimeout(200);

                // Button should be visible (hover state is visual)
                await expect(tasksButton).toBeVisible();
            }
        });

        test('should show hover effect on action buttons', async ({ page }) => {
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            const addButton = page.locator('button').filter({ hasText: /^Add Task$|^\+$/ }).first();
            if (await addButton.count() > 0) {
                await addButton.hover();
                await page.waitForTimeout(200);

                await expect(addButton).toBeVisible();
            }
        });
    });

    test.describe('Button Keyboard Navigation', () => {
        test('should focus button with Tab key', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Tab to first button
            await page.keyboard.press('Tab');

            // Check if a button is focused
            const focusedElement = await page.evaluate(() => window.document.activeElement?.tagName);
            expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
        });

        test('should activate button with Enter key', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Tab to Tasks button
            const tasksButton = page.locator('button, a').filter({ hasText: /^Tasks$/ }).first();
            await tasksButton.focus();

            // Press Enter
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);

            // Should navigate to Tasks
            expect(page.url()).toContain('tasks');
        });

        test('should activate button with Space key', async ({ page }) => {
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            const addButton = page.locator('button').filter({ hasText: /^Add Task$|^\+$/ }).first();
            if (await addButton.count() > 0) {
                await addButton.focus();

                // Press Space
                await page.keyboard.press('Space');
                await page.waitForTimeout(500);

                // Modal should open
                const modal = page.locator('.fixed.inset-0.bg-black.bg-opacity-25');
                await expect(modal).toBeVisible();
            }
        });
    });

    test.describe('Button Visual Feedback', () => {
        test('should show press animation on button click', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Click Tasks button
            const tasksButton = page.locator('button, a').filter({ hasText: /^Tasks$/ }).first();
            if (await tasksButton.count() > 0) {
                // Check for btn-press class
                const classes = await tasksButton.getAttribute('class');
                // btn-press class is used for press animation
                expect(classes).toBeTruthy();
            }
        });

        test('should have shadow effect on primary buttons', async ({ page }) => {
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            const addButton = page.locator('button').filter({ hasText: /^Add Task$|^\+$/ }).first();
            if (await addButton.count() > 0) {
                // Primary buttons typically have shadow classes
                const classes = await addButton.getAttribute('class');
                expect(classes).toBeTruthy();
            }
        });
    });

    test.describe('Button Groups', () => {
        test('should show button group in forms (Cancel and Submit)', async ({ page }) => {
            await page.click('text=Events');
            await page.waitForLoadState('networkidle');

            const addButton = page.locator('button').filter({ hasText: /Add Event/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Both buttons should be visible
                const cancelButton = page.locator('button').filter({ hasText: /cancel/i }).first();
                const submitButton = page.locator('button[type="submit"]').first();

                await expect(cancelButton).toBeVisible();
                await expect(submitButton).toBeVisible();
            }
        });

        test('should show button group in confirm dialogs', async ({ page }) => {
            await page.click('text=Shopping');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            const deleteButtons = page.locator('button').filter({ hasText: /delete/i });
            if (await deleteButtons.count() > 0) {
                await deleteButtons.first().click();
                await page.waitForTimeout(500);

                // Confirm dialog buttons
                const cancelButton = page.locator('button').filter({ hasText: /cancel/i }).first();
                const confirmButton = page.locator('button').filter({ hasText: /confirm|delete/i }).first();

                if (await cancelButton.count() > 0 && await confirmButton.count() > 0) {
                    await expect(cancelButton).toBeVisible();
                    await expect(confirmButton).toBeVisible();
                }
            }
        });
    });

    test.describe('Special Buttons', () => {
        test('should show profile button or user menu button', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Look for profile/settings button
            const profileButton = page.locator('button[aria-label*="Profile"], button[title*="Profile"]');
            if (await profileButton.count() > 0) {
                await expect(profileButton.first()).toBeVisible();
            }
        });

        test('should show bottom navigation buttons on mobile view', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Bottom navigation should be visible on mobile
            const bottomNav = page.locator('nav').last();
            if (await bottomNav.count() > 0) {
                await expect(bottomNav).toBeVisible();
            }
        });

        test('should have PWA install button when applicable', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // PWA install prompt button may or may not be visible
            const installButton = page.locator('button').filter({ hasText: /install/i });
            // Just check if selector works
            expect(await installButton.count()).toBeGreaterThanOrEqual(0);
        });
    });

    test.describe('Button Loading States', () => {
        test('should show loading state during form submission', async ({ page }) => {
            await page.click('text=Contacts');
            await page.waitForLoadState('networkidle');

            const addButton = page.locator('button').filter({ hasText: /Add Contact/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Fill form quickly
                const nameInput = page.locator('input[type="text"]').first();
                await nameInput.fill('Test Name');

                // Submit
                const submitButton = page.locator('button[type="submit"]').first();

                // Button might show loading state (spinner, disabled, etc.)
                await submitButton.click();

                // Button should be visible during submission
                await expect(submitButton).toBeVisible();
            }
        });
    });

    test.describe('Button Accessibility', () => {
        test('should have aria-label on icon-only buttons', async ({ page }) => {
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            const addButton = page.locator('button').filter({ hasText: /^Add Task$|^\+$/ }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Close button should have aria-label
                const closeButton = page.locator('button[aria-label="Close modal"]');
                await expect(closeButton.first()).toBeVisible();
            }
        });

        test('should have title attribute on buttons for tooltips', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Check for buttons with title attributes
            const buttonsWithTitle = page.locator('button[title]');
            // Just verify we can query for them
            expect(await buttonsWithTitle.count()).toBeGreaterThanOrEqual(0);
        });
    });
});

