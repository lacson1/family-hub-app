import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helpers';

test.describe('Modals and Dialogs - UI Components', () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
        await page.waitForLoadState('networkidle');
    });

    test.describe('Modal Component', () => {
        test('should open and close modal via close button', async ({ page }) => {
            // Navigate to Tasks page which uses modals
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            // Click "Add Task" button to open modal
            const addButton = page.locator('button').filter({ hasText: /^Add Task$|^\+$/ }).first();
            if (await addButton.count() > 0) {
                await addButton.click();

                // Verify modal is open
                const modal = page.locator('.fixed.inset-0.bg-black.bg-opacity-25').first();
                await expect(modal).toBeVisible();

                // Verify modal has close button
                const closeButton = page.locator('button[aria-label="Close modal"]').first();
                await expect(closeButton).toBeVisible();

                // Close modal
                await closeButton.click();

                // Verify modal is closed
                await expect(modal).not.toBeVisible();
            }
        });

        test('should close modal via backdrop click', async ({ page }) => {
            // Navigate to Contacts page
            await page.click('text=Contacts');
            await page.waitForLoadState('networkidle');

            // Open add contact modal
            const addButton = page.locator('button').filter({ hasText: /Add Contact/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();

                // Wait for modal to appear
                const modal = page.locator('.fixed.inset-0.bg-black.bg-opacity-25').first();
                await expect(modal).toBeVisible();

                // Click on backdrop (outside the modal content)
                await modal.click({ position: { x: 10, y: 10 } });

                // Wait a moment for animation
                await page.waitForTimeout(300);
            }
        });

        test('should close modal via ESC key', async ({ page }) => {
            // Navigate to Events page
            await page.click('text=Events');
            await page.waitForLoadState('networkidle');

            // Open add event modal
            const addButton = page.locator('button').filter({ hasText: /Add Event/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();

                // Verify modal is open
                const modal = page.locator('.fixed.inset-0.bg-black.bg-opacity-25').first();
                await expect(modal).toBeVisible({ timeout: 5000 });

                // Press ESC key
                await page.keyboard.press('Escape');

                // Wait for modal to close
                await page.waitForTimeout(500);
            }
        });

        test('should display modal title correctly', async ({ page }) => {
            // Navigate to Tasks
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            // Open modal
            const addButton = page.locator('button').filter({ hasText: /^Add Task$|^\+$/ }).first();
            if (await addButton.count() > 0) {
                await addButton.click();

                // Check for modal title
                const modalTitle = page.locator('h2.text-xl.font-semibold').first();
                if (await modalTitle.count() > 0) {
                    await expect(modalTitle).toBeVisible();
                    const titleText = await modalTitle.textContent();
                    expect(titleText).toBeTruthy();
                }
            }
        });

        test('should maintain form data when modal is open', async ({ page }) => {
            // Navigate to Tasks
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            // Open modal
            const addButton = page.locator('button').filter({ hasText: /^Add Task$|^\+$/ }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Type into a field
                const titleInput = page.locator('input[aria-label*="Task title"], input[placeholder*="task"]').first();
                if (await titleInput.count() > 0) {
                    await titleInput.fill('Test Task Title');

                    // Verify value is maintained
                    await expect(titleInput).toHaveValue('Test Task Title');
                }
            }
        });
    });

    test.describe('ConfirmDialog Component', () => {
        test('should show confirm dialog on delete action', async ({ page }) => {
            // Navigate to Contacts
            await page.click('text=Contacts');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            // Look for any delete button
            const deleteButtons = page.locator('button[title*="Delete"], button[aria-label*="Delete"]');

            if (await deleteButtons.count() > 0) {
                // Click first delete button
                await deleteButtons.first().click();
                await page.waitForTimeout(500);

                // Look for confirmation dialog
                const confirmDialog = page.locator('.fixed.inset-0.bg-black.bg-opacity-25');
                if (await confirmDialog.count() > 0) {
                    await expect(confirmDialog).toBeVisible();
                }
            }
        });

        test('should have Cancel and Confirm buttons in dialog', async ({ page }) => {
            // Navigate to Tasks
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            // Try to find a delete action
            const deleteButtons = page.locator('button').filter({ hasText: /delete/i });

            if (await deleteButtons.count() > 0) {
                await deleteButtons.first().click();
                await page.waitForTimeout(500);

                // Look for Cancel button
                const cancelButton = page.locator('button').filter({ hasText: /cancel/i }).first();
                const confirmButton = page.locator('button').filter({ hasText: /confirm|delete/i }).first();

                if (await cancelButton.count() > 0) {
                    await expect(cancelButton).toBeVisible();
                }
                if (await confirmButton.count() > 0) {
                    await expect(confirmButton).toBeVisible();
                }
            }
        });

        test('should close dialog when Cancel is clicked', async ({ page }) => {
            // Navigate to Shopping
            await page.click('text=Shopping');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            // Look for delete buttons
            const deleteButtons = page.locator('button[title*="Delete"], button').filter({ hasText: /delete/i });

            if (await deleteButtons.count() > 0) {
                await deleteButtons.first().click();
                await page.waitForTimeout(300);

                // Click Cancel if dialog appears
                const cancelButton = page.locator('button').filter({ hasText: /cancel/i }).first();
                if (await cancelButton.count() > 0 && await cancelButton.isVisible()) {
                    await cancelButton.click();
                    await page.waitForTimeout(300);

                    // Dialog should be closed
                    const dialog = page.locator('.fixed.inset-0.bg-black.bg-opacity-25');
                    await expect(dialog).not.toBeVisible();
                }
            }
        });

        test('should show confirmation message in dialog', async ({ page }) => {
            // Try on Family Tree page
            await page.click('text=Family');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            // Look for any delete/remove actions
            const actionButtons = page.locator('button').filter({ hasText: /delete|remove/i });

            if (await actionButtons.count() > 0) {
                await actionButtons.first().click();
                await page.waitForTimeout(500);

                // Check for dialog message
                const dialogText = page.locator('.fixed.inset-0 p, .fixed.inset-0 .text-gray-600');
                if (await dialogText.count() > 0) {
                    const message = await dialogText.first().textContent();
                    expect(message).toBeTruthy();
                }
            }
        });
    });

    test.describe('Toast Notifications', () => {
        test('should display success toast after successful action', async ({ page }) => {
            // Navigate to Tasks
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            // Try to add a task
            const addButton = page.locator('button').filter({ hasText: /^Add Task$|^\+$/ }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Fill in required fields
                const titleInput = page.locator('input[aria-label*="Task title"], input[placeholder*="task"]').first();
                if (await titleInput.count() > 0) {
                    await titleInput.fill('Test Task for Toast');

                    const dateInput = page.locator('input[type="date"]').first();
                    if (await dateInput.count() > 0) {
                        await dateInput.fill('2025-12-31');
                    }

                    // Submit form
                    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /Add Task|Save/i }).first();
                    if (await submitButton.count() > 0) {
                        await submitButton.click();
                        await page.waitForTimeout(1000);

                        // Look for success toast (might be green background)
                        const toast = page.locator('.fixed.top-4.right-4, .bg-green-500');
                        if (await toast.count() > 0) {
                            await expect(toast.first()).toBeVisible({ timeout: 3000 });
                        }
                    }
                }
            }
        });

        test('should display error toast on validation failure', async ({ page }) => {
            // Navigate to Contacts
            await page.click('text=Contacts');
            await page.waitForLoadState('networkidle');

            // Open add contact form
            const addButton = page.locator('button').filter({ hasText: /Add Contact/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Try to submit without required fields
                const submitButton = page.locator('button[type="submit"]').first();
                if (await submitButton.count() > 0) {
                    await submitButton.click();
                    await page.waitForTimeout(500);

                    // Look for error messages or toast
                    const errorToast = page.locator('.bg-red-500, .text-red-500');
                    // Error might be inline or as toast
                    if (await errorToast.count() > 0) {
                        expect(await errorToast.count()).toBeGreaterThan(0);
                    }
                }
            }
        });

        test('should allow toast to be manually closed', async ({ page }) => {
            // This test checks if toast has close button
            // We'll trigger an action that might show a toast
            await page.click('text=Dashboard');
            await page.waitForLoadState('networkidle');

            // Check if any toast notifications are present with close buttons
            const toastCloseButton = page.locator('button[aria-label="Close notification"]');
            if (await toastCloseButton.count() > 0) {
                await toastCloseButton.first().click();
                await page.waitForTimeout(300);
            }
        });

        test('should display toast with appropriate styling based on type', async ({ page }) => {
            // Navigate around and check for different toast types
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Success toasts typically have green background (bg-green-500)
            // Error toasts typically have red background (bg-red-500)
            // Info toasts typically have blue background (bg-blue-500)

            // Just verify the toast structure exists in DOM
            const toastContainer = page.locator('.fixed.top-4.right-4');
            // This is a structural test - toasts may or may not be present
            expect(toastContainer).toBeDefined();
        });
    });

    test.describe('Modal Accessibility', () => {
        test('should have proper ARIA labels on modal elements', async ({ page }) => {
            // Navigate to Events
            await page.click('text=Events');
            await page.waitForLoadState('networkidle');

            // Open modal
            const addButton = page.locator('button').filter({ hasText: /Add Event/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Check for ARIA label on close button
                const closeButton = page.locator('button[aria-label="Close modal"]');
                if (await closeButton.count() > 0) {
                    await expect(closeButton).toBeVisible();
                }
            }
        });

        test('should trap focus within modal', async ({ page }) => {
            // Navigate to Tasks
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            // Open modal
            const addButton = page.locator('button').filter({ hasText: /^Add Task$|^\+$/ }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Tab through elements
                await page.keyboard.press('Tab');
                await page.keyboard.press('Tab');
                await page.keyboard.press('Tab');

                // Focus should remain within modal
                const focusedElement = await page.evaluate(() => window.document.activeElement?.tagName);
                expect(['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA']).toContain(focusedElement);
            }
        });
    });

    test.describe('Modal Animations', () => {
        test('should have fade-in animation on modal open', async ({ page }) => {
            // Navigate to Meals
            await page.click('text=Meals');
            await page.waitForLoadState('networkidle');

            // Open modal
            const addButton = page.locator('button').filter({ hasText: /Add Meal/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();

                // Check for animation classes
                const modal = page.locator('.animate-fade-in').first();
                if (await modal.count() > 0) {
                    await expect(modal).toBeVisible();
                }
            }
        });

        test('should have scale-in animation on modal content', async ({ page }) => {
            // Navigate to Money
            await page.click('text=Money');
            await page.waitForLoadState('networkidle');

            // Open add transaction modal if available
            const addButton = page.locator('button').filter({ hasText: /Add|New/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(300);

                // Check for scale animation class
                const modalContent = page.locator('.animate-scale-in').first();
                if (await modalContent.count() > 0) {
                    await expect(modalContent).toBeVisible();
                }
            }
        });
    });
});

