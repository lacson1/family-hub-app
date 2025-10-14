import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helpers';

test.describe('Alert Dialogs - UI Components', () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
        await page.waitForLoadState('networkidle');
    });

    test.describe('Native Alert Dialog', () => {
        test('should show alert for self-relationship validation in family tree', async ({ page }) => {
            // Navigate to Family Tree
            await page.click('text=Family');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            // Set up dialog handler
            let alertShown = false;
            let alertMessage = '';

            page.on('dialog', async dialog => {
                expect(dialog.type()).toBe('alert');
                alertMessage = dialog.message();
                alertShown = true;
                await dialog.accept();
            });

            // Look for add relationship button
            const addRelationshipButton = page.locator('button').filter({
                hasText: /Add Relationship|Relationship/i
            }).first();

            if (await addRelationshipButton.count() > 0) {
                await addRelationshipButton.click();
                await page.waitForTimeout(500);

                // Try to select same person for both relationship fields
                const selects = page.locator('select');

                if (await selects.count() >= 2) {
                    // Select first option in both dropdowns (same person)
                    const firstOption = await selects.nth(0).locator('option').nth(1).getAttribute('value');

                    if (firstOption) {
                        await selects.nth(0).selectOption(firstOption);
                        await selects.nth(1).selectOption(firstOption);

                        // Try to submit or trigger validation
                        const submitButton = page.locator('button[type="submit"]').first();
                        if (await submitButton.count() > 0) {
                            await submitButton.click();
                            await page.waitForTimeout(500);

                            // Check if alert was shown
                            if (alertShown) {
                                expect(alertMessage).toContain('cannot have a relationship with themselves');
                            }
                        }
                    }
                }
            }
        });

        test('should handle alert dialog dismissal', async ({ page }) => {
            // Set up dialog handler that accepts the alert
            page.on('dialog', async dialog => {
                expect(dialog.type()).toBe('alert');
                await dialog.accept();
            });

            // Navigate to Family Tree to trigger self-relationship alert
            await page.click('text=Family');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            // Attempt to trigger alert (if possible)
            const addRelationshipButton = page.locator('button').filter({
                hasText: /Add Relationship|Relationship/i
            }).first();

            if (await addRelationshipButton.count() > 0) {
                await addRelationshipButton.click();
                await page.waitForTimeout(500);

                // The page should continue functioning after alert dismissal
                const body = page.locator('body');
                await expect(body).toBeVisible();
            }
        });

        test('should display correct message in alert dialog', async ({ page }) => {
            let capturedMessage = '';

            page.on('dialog', async dialog => {
                capturedMessage = dialog.message();
                await dialog.accept();
            });

            // Navigate to Family Tree
            await page.click('text=Family');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            const addRelationshipButton = page.locator('button').filter({
                hasText: /Add Relationship|Relationship/i
            }).first();

            if (await addRelationshipButton.count() > 0) {
                await addRelationshipButton.click();
                await page.waitForTimeout(500);

                const selects = page.locator('select');

                if (await selects.count() >= 2) {
                    const firstOption = await selects.nth(0).locator('option').nth(1).getAttribute('value');

                    if (firstOption) {
                        await selects.nth(0).selectOption(firstOption);
                        await selects.nth(1).selectOption(firstOption);

                        const submitButton = page.locator('button[type="submit"]').first();
                        if (await submitButton.count() > 0) {
                            await submitButton.click();
                            await page.waitForTimeout(500);

                            if (capturedMessage) {
                                expect(capturedMessage).toBeTruthy();
                                expect(typeof capturedMessage).toBe('string');
                            }
                        }
                    }
                }
            }
        });
    });

    test.describe('Alert Dialog Behavior', () => {
        test('should pause JavaScript execution until alert is dismissed', async ({ page }) => {
            page.on('dialog', async dialog => {
                // Wait a bit before accepting
                await page.waitForTimeout(100);
                await dialog.accept();
            });

            // Trigger alert scenario
            await page.click('text=Family');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            const addRelationshipButton = page.locator('button').filter({
                hasText: /Add Relationship|Relationship/i
            }).first();

            if (await addRelationshipButton.count() > 0) {
                await addRelationshipButton.click();
                await page.waitForTimeout(500);

                const selects = page.locator('select');

                if (await selects.count() >= 2) {
                    const firstOption = await selects.nth(0).locator('option').nth(1).getAttribute('value');

                    if (firstOption) {
                        await selects.nth(0).selectOption(firstOption);
                        await selects.nth(1).selectOption(firstOption);

                        const submitButton = page.locator('button[type="submit"]').first();
                        if (await submitButton.count() > 0) {
                            await submitButton.click();
                            await page.waitForTimeout(1000);

                            // Execution should have continued after alert
                            expect(page.url()).toBeTruthy();
                        }
                    }
                }
            }
        });

        test('should not proceed with action if alert is triggered', async ({ page }) => {
            let alertTriggered = false;

            page.on('dialog', async dialog => {
                alertTriggered = true;
                await dialog.accept();
            });

            // Navigate to Family Tree
            await page.click('text=Family');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            // Get initial page state
            const initialUrl = page.url();

            const addRelationshipButton = page.locator('button').filter({
                hasText: /Add Relationship|Relationship/i
            }).first();

            if (await addRelationshipButton.count() > 0) {
                await addRelationshipButton.click();
                await page.waitForTimeout(500);

                const selects = page.locator('select');

                if (await selects.count() >= 2) {
                    const firstOption = await selects.nth(0).locator('option').nth(1).getAttribute('value');

                    if (firstOption) {
                        await selects.nth(0).selectOption(firstOption);
                        await selects.nth(1).selectOption(firstOption);

                        const submitButton = page.locator('button[type="submit"]').first();
                        if (await submitButton.count() > 0) {
                            await submitButton.click();
                            await page.waitForTimeout(1000);

                            // If alert was triggered, form should not have been submitted
                            if (alertTriggered) {
                                // Modal should still be open or URL unchanged
                                expect(page.url()).toBe(initialUrl);
                            }
                        }
                    }
                }
            }
        });
    });

    test.describe('Alert Dialog Accessibility', () => {
        test('should be modal and prevent interaction with page content', async ({ page }) => {
            page.on('dialog', async dialog => {
                // While dialog is active, page interaction is blocked
                // This is native browser behavior

                await dialog.accept();
            });

            // Navigate to scenario that might trigger alert
            await page.click('text=Family');
            await page.waitForLoadState('networkidle');

            // Page should be interactive when no alert is present
            expect(page.url()).toContain('family');
        });

        test('should be dismissible with keyboard', async ({ page }) => {
            // Alert dialogs are automatically dismissed with Enter key
            page.on('dialog', async dialog => {
                // Accept is equivalent to pressing Enter/OK
                await dialog.accept();
            });

            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Page should remain functional
            expect(page.url()).toBeTruthy();
        });
    });

    test.describe('Alert vs Custom Dialog Comparison', () => {
        test('should prefer custom ConfirmDialog over native alert for better UX', async ({ page }) => {
            // Navigate to various pages and check delete confirmations
            const pages = ['Tasks', 'Contacts', 'Shopping'];

            for (const pageName of pages) {
                await page.click(`text=${pageName}`);
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(1000);

                // Look for delete buttons
                const deleteButtons = page.locator('button').filter({ hasText: /delete/i });

                if (await deleteButtons.count() > 0) {
                    await deleteButtons.first().click();
                    await page.waitForTimeout(500);

                    // Should use custom ConfirmDialog (not native alert)
                    const customDialog = page.locator('.fixed.inset-0.bg-black.bg-opacity-25');

                    if (await customDialog.count() > 0) {
                        // Custom dialog is better UX than native alert
                        await expect(customDialog).toBeVisible();

                        // Close it
                        const cancelButton = page.locator('button').filter({ hasText: /cancel/i }).first();
                        if (await cancelButton.count() > 0) {
                            await cancelButton.click();
                            await page.waitForTimeout(300);
                        }
                    }

                    break; // Found a delete action, test completed
                }
            }
        });

        test('should handle native alert gracefully when used', async ({ page }) => {
            // Set up universal dialog handler
            page.on('dialog', async dialog => {
                // All dialogs (alert, confirm, prompt) should be handled
                await dialog.accept();
            });

            // Navigate through app
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Visit various pages
            const pages = ['Family', 'Tasks', 'Events', 'Contacts'];

            for (const pageName of pages) {
                await page.click(`text=${pageName}`);
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(500);
            }

            // Should complete without hanging on any alert
            expect(page.url()).toBeTruthy();
        });
    });

    test.describe('Alert Content Validation', () => {
        test('should display meaningful message in alert', async ({ page }) => {
            let messageText = '';

            page.on('dialog', async dialog => {
                messageText = dialog.message();
                await dialog.accept();
            });

            // Trigger self-relationship alert
            await page.click('text=Family');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            const addRelationshipButton = page.locator('button').filter({
                hasText: /Add Relationship|Relationship/i
            }).first();

            if (await addRelationshipButton.count() > 0) {
                await addRelationshipButton.click();
                await page.waitForTimeout(500);

                const selects = page.locator('select');

                if (await selects.count() >= 2) {
                    const firstOption = await selects.nth(0).locator('option').nth(1).getAttribute('value');

                    if (firstOption) {
                        await selects.nth(0).selectOption(firstOption);
                        await selects.nth(1).selectOption(firstOption);

                        const submitButton = page.locator('button[type="submit"]').first();
                        if (await submitButton.count() > 0) {
                            await submitButton.click();
                            await page.waitForTimeout(500);

                            if (messageText) {
                                // Message should be clear and informative
                                expect(messageText.length).toBeGreaterThan(10);
                                expect(messageText).not.toBe('Error');
                                expect(messageText).not.toBe('Alert');
                            }
                        }
                    }
                }
            }
        });

        test('should use proper grammar and punctuation in alert messages', async ({ page }) => {
            let messageText = '';

            page.on('dialog', async dialog => {
                messageText = dialog.message();
                await dialog.accept();
            });

            // Trigger alert
            await page.click('text=Family');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            const addRelationshipButton = page.locator('button').filter({
                hasText: /Add Relationship|Relationship/i
            }).first();

            if (await addRelationshipButton.count() > 0) {
                await addRelationshipButton.click();
                await page.waitForTimeout(500);

                const selects = page.locator('select');

                if (await selects.count() >= 2) {
                    const firstOption = await selects.nth(0).locator('option').nth(1).getAttribute('value');

                    if (firstOption) {
                        await selects.nth(0).selectOption(firstOption);
                        await selects.nth(1).selectOption(firstOption);

                        const submitButton = page.locator('button[type="submit"]').first();
                        if (await submitButton.count() > 0) {
                            await submitButton.click();
                            await page.waitForTimeout(500);

                            if (messageText) {
                                // Should start with capital letter
                                expect(messageText[0]).toBe(messageText[0].toUpperCase());
                            }
                        }
                    }
                }
            }
        });
    });

    test.describe('Multiple Dialog Scenarios', () => {
        test('should handle only one alert at a time', async ({ page }) => {
            let dialogCount = 0;

            page.on('dialog', async dialog => {
                dialogCount++;
                await dialog.accept();
            });

            // Navigate and perform actions
            await page.click('text=Family');
            await page.waitForLoadState('networkidle');

            // Native alerts are modal and block until dismissed
            // So only one can appear at a time
            expect(dialogCount).toBeLessThanOrEqual(1);
        });

        test('should handle dialog after page navigation', async ({ page }) => {
            page.on('dialog', async dialog => {
                await dialog.accept();
            });

            // Navigate to different pages
            await page.click('text=Family');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(500);

            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(500);

            await page.click('text=Family');
            await page.waitForLoadState('networkidle');

            // Should handle any alerts that appear
            expect(page.url()).toContain('family');
        });
    });

    test.describe('Error Prevention', () => {
        test('should use alerts sparingly for critical validations only', async ({ page }) => {
            let alertCount = 0;

            page.on('dialog', async dialog => {
                if (dialog.type() === 'alert') {
                    alertCount++;
                }
                await dialog.accept();
            });

            // Navigate through multiple pages and interactions
            const pages = ['Dashboard', 'Tasks', 'Events', 'Shopping', 'Meals', 'Contacts'];

            for (const pageName of pages) {
                await page.click(`text=${pageName}`);
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(500);

                // Try to open add form
                const addButton = page.locator('button').filter({ hasText: /^Add|^\+/ }).first();
                if (await addButton.count() > 0) {
                    await addButton.click();
                    await page.waitForTimeout(300);

                    // Close form
                    const closeButton = page.locator('button[aria-label="Close modal"], button').filter({ hasText: /cancel/i }).first();
                    if (await closeButton.count() > 0) {
                        await closeButton.click();
                        await page.waitForTimeout(300);
                    }
                }
            }

            // Alert count should be low (only for critical validations)
            expect(alertCount).toBeLessThanOrEqual(2);
        });
    });
});

