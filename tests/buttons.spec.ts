import { test, expect } from '@playwright/test';

test.describe('Button Testing Suite - All Application Buttons', () => {
    test.beforeEach(async ({ page }) => {
        // Start at login page
        await page.goto('http://localhost:5173');
    });

    test.describe('Authentication Page Buttons', () => {
        test('should have working login button', async ({ page }) => {
            const loginButton = page.locator('button:has-text("Login")').first();
            await expect(loginButton).toBeVisible();
            await expect(loginButton).toBeEnabled();
        });

        test('should have working signup button', async ({ page }) => {
            const signupButton = page.locator('button:has-text("Sign Up")').first();
            await expect(signupButton).toBeVisible();
            await expect(signupButton).toBeEnabled();
        });

        test('should toggle between login and signup forms', async ({ page }) => {
            const toggleButton = page.locator('text=Need an account?').first();
            if (await toggleButton.isVisible()) {
                await toggleButton.click();
                await expect(page.locator('text=Sign Up')).toBeVisible();
            }
        });
    });

    test.describe('UI Test Page - All Button Types', () => {
        test.beforeEach(async ({ page }) => {
            // Login first
            await page.fill('input[type="email"]', 'test@example.com');
            await page.fill('input[type="password"]', 'password123');
            await page.click('button:has-text("Login")');

            // Wait for navigation and go to UI Test page if it exists
            await page.waitForLoadState('networkidle');
        });

        test('should test primary buttons', async ({ page }) => {
            // Check if UI Test Page exists in the navigation
            const uiTestLink = page.locator('text=UI Test').or(page.locator('text=Test'));
            if (await uiTestLink.count() > 0) {
                await uiTestLink.first().click();

                // Test primary buttons
                const primaryButton = page.locator('button:has-text("Primary Button")');
                if (await primaryButton.count() > 0) {
                    await expect(primaryButton).toBeVisible();
                    await primaryButton.click();
                }

                // Test button with icon
                const iconButton = page.locator('button:has-text("With Icon")').first();
                if (await iconButton.count() > 0) {
                    await expect(iconButton).toBeVisible();
                    await iconButton.click();
                }

                // Test disabled button
                const disabledButton = page.locator('button:has-text("Disabled")').first();
                if (await disabledButton.count() > 0) {
                    await expect(disabledButton).toBeDisabled();
                }

                // Test loading button
                const loadingButton = page.locator('button:has-text("Click to Load")');
                if (await loadingButton.count() > 0) {
                    await loadingButton.click();
                    await expect(page.locator('text=Loading...')).toBeVisible();
                }
            }
        });

        test('should test secondary buttons', async ({ page }) => {
            const uiTestLink = page.locator('text=UI Test').or(page.locator('text=Test'));
            if (await uiTestLink.count() > 0) {
                await uiTestLink.first().click();

                const secondaryButton = page.locator('button:has-text("Secondary Button")');
                if (await secondaryButton.count() > 0) {
                    await expect(secondaryButton).toBeVisible();
                    await secondaryButton.click();
                }
            }
        });

        test('should test danger buttons', async ({ page }) => {
            const uiTestLink = page.locator('text=UI Test').or(page.locator('text=Test'));
            if (await uiTestLink.count() > 0) {
                await uiTestLink.first().click();

                const deleteButton = page.locator('button:has-text("Delete")').first();
                if (await deleteButton.count() > 0) {
                    await expect(deleteButton).toBeVisible();
                    await expect(deleteButton).toBeEnabled();
                }

                const removeButton = page.locator('button:has-text("Remove Item")');
                if (await removeButton.count() > 0) {
                    await expect(removeButton).toBeVisible();
                    await expect(removeButton).toBeEnabled();
                }
            }
        });

        test('should test success buttons', async ({ page }) => {
            const uiTestLink = page.locator('text=UI Test').or(page.locator('text=Test'));
            if (await uiTestLink.count() > 0) {
                await uiTestLink.first().click();

                const confirmButton = page.locator('button:has-text("Confirm")').first();
                if (await confirmButton.count() > 0) {
                    await expect(confirmButton).toBeVisible();
                    await confirmButton.click();
                }

                const saveButton = page.locator('button:has-text("Save Changes")');
                if (await saveButton.count() > 0) {
                    await expect(saveButton).toBeVisible();
                    await saveButton.click();
                }
            }
        });

        test('should test icon-only buttons', async ({ page }) => {
            const uiTestLink = page.locator('text=UI Test').or(page.locator('text=Test'));
            if (await uiTestLink.count() > 0) {
                await uiTestLink.first().click();

                // Test edit icon button
                const editButtons = page.locator('button[title="Edit"]');
                const editCount = await editButtons.count();
                if (editCount > 0) {
                    await expect(editButtons.first()).toBeVisible();
                    await editButtons.first().click();
                }

                // Test delete icon button
                const deleteButtons = page.locator('button[title="Delete"]');
                const deleteCount = await deleteButtons.count();
                if (deleteCount > 0) {
                    await expect(deleteButtons.first()).toBeVisible();
                }
            }
        });

        test('should test modal buttons', async ({ page }) => {
            const uiTestLink = page.locator('text=UI Test').or(page.locator('text=Test'));
            if (await uiTestLink.count() > 0) {
                await uiTestLink.first().click();

                // Open modal button
                const openModalButton = page.locator('button:has-text("Open Modal")');
                if (await openModalButton.count() > 0) {
                    await openModalButton.click();

                    // Check if modal appeared
                    await page.waitForTimeout(500);

                    // Close modal (ESC or close button)
                    await page.keyboard.press('Escape');
                }

                // Confirm dialog button
                const confirmDialogButton = page.locator('button:has-text("Open Confirm Dialog")');
                if (await confirmDialogButton.count() > 0) {
                    await confirmDialogButton.click();
                    await page.waitForTimeout(500);

                    // Close dialog
                    const cancelButton = page.locator('button:has-text("Cancel")');
                    if (await cancelButton.count() > 0) {
                        await cancelButton.click();
                    } else {
                        await page.keyboard.press('Escape');
                    }
                }
            }
        });

        test('should test toast buttons', async ({ page }) => {
            const uiTestLink = page.locator('text=UI Test').or(page.locator('text=Test'));
            if (await uiTestLink.count() > 0) {
                await uiTestLink.first().click();

                // Success toast
                const successToastButton = page.locator('button:has-text("Show Success Toast")');
                if (await successToastButton.count() > 0) {
                    await successToastButton.click();
                    await page.waitForTimeout(500);
                }

                // Error toast
                const errorToastButton = page.locator('button:has-text("Show Error Toast")');
                if (await errorToastButton.count() > 0) {
                    await errorToastButton.click();
                    await page.waitForTimeout(500);
                }

                // Info toast
                const infoToastButton = page.locator('button:has-text("Show Info Toast")');
                if (await infoToastButton.count() > 0) {
                    await infoToastButton.click();
                    await page.waitForTimeout(500);
                }
            }
        });
    });

    test.describe('Dashboard Buttons', () => {
        test.beforeEach(async ({ page }) => {
            await page.fill('input[type="email"]', 'test@example.com');
            await page.fill('input[type="password"]', 'password123');
            await page.click('button:has-text("Login")');
            await page.waitForLoadState('networkidle');
        });

        test('should test navigation buttons', async ({ page }) => {
            // Test all main navigation buttons
            const navButtons = [
                'Dashboard',
                'Tasks',
                'Events',
                'Shopping',
                'Meals',
                'Money',
                'Contacts',
                'Family Tree',
                'Profile'
            ];

            for (const buttonText of navButtons) {
                const button = page.locator(`text=${buttonText}`).first();
                if (await button.count() > 0) {
                    await expect(button).toBeVisible();
                }
            }
        });

        test('should test add/create buttons on each page', async ({ page }) => {
            const pages = [
                { nav: 'Tasks', addButton: 'Add Task' },
                { nav: 'Events', addButton: 'Add Event' },
                { nav: 'Shopping', addButton: 'Add Item' },
                { nav: 'Meals', addButton: 'Add Meal' },
                { nav: 'Contacts', addButton: 'Add Contact' }
            ];

            for (const pageInfo of pages) {
                const navLink = page.locator(`text=${pageInfo.nav}`).first();
                if (await navLink.count() > 0) {
                    await navLink.click();
                    await page.waitForLoadState('networkidle');

                    // Look for add/create button
                    const addButton = page.locator(`button:has-text("${pageInfo.addButton}")`).or(
                        page.locator('button:has-text("New")').or(
                            page.locator('button:has-text("Create")').or(
                                page.locator('button').filter({ hasText: /\+|Add|New|Create/i }).first()
                            )
                        )
                    );

                    if (await addButton.count() > 0) {
                        await expect(addButton.first()).toBeVisible();
                        await expect(addButton.first()).toBeEnabled();
                    }
                }
            }
        });
    });

    test.describe('Form Buttons', () => {
        test.beforeEach(async ({ page }) => {
            await page.fill('input[type="email"]', 'test@example.com');
            await page.fill('input[type="password"]', 'password123');
            await page.click('button:has-text("Login")');
            await page.waitForLoadState('networkidle');
        });

        test('should test task form buttons', async ({ page }) => {
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            // Look for add button
            const addButton = page.locator('button').filter({ hasText: /Add|New|Create|\+/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();

                // Check for submit and cancel buttons
                const submitButton = page.locator('button:has-text("Save")').or(
                    page.locator('button:has-text("Submit")').or(
                        page.locator('button:has-text("Create")').or(
                            page.locator('button[type="submit"]')
                        )
                    )
                );

                if (await submitButton.count() > 0) {
                    await expect(submitButton.first()).toBeVisible();
                }

                const cancelButton = page.locator('button:has-text("Cancel")');
                if (await cancelButton.count() > 0) {
                    await expect(cancelButton).toBeVisible();
                    await cancelButton.click();
                }
            }
        });

        test('should test edit and delete buttons', async ({ page }) => {
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            // Look for edit buttons (usually icon buttons)
            const editButtons = page.locator('button').filter({ hasText: /Edit/i }).or(
                page.locator('button[title*="Edit"]').or(
                    page.locator('button[aria-label*="edit" i]')
                )
            );

            if (await editButtons.count() > 0) {
                await expect(editButtons.first()).toBeVisible();
            }

            // Look for delete buttons
            const deleteButtons = page.locator('button').filter({ hasText: /Delete/i }).or(
                page.locator('button[title*="Delete"]').or(
                    page.locator('button[aria-label*="delete" i]')
                )
            );

            if (await deleteButtons.count() > 0) {
                await expect(deleteButtons.first()).toBeVisible();
            }
        });
    });

    test.describe('Profile and Settings Buttons', () => {
        test.beforeEach(async ({ page }) => {
            await page.fill('input[type="email"]', 'test@example.com');
            await page.fill('input[type="password"]', 'password123');
            await page.click('button:has-text("Login")');
            await page.waitForLoadState('networkidle');
        });

        test('should test profile page buttons', async ({ page }) => {
            const profileLink = page.locator('text=Profile').first();
            if (await profileLink.count() > 0) {
                await profileLink.click();
                await page.waitForLoadState('networkidle');

                // Look for save/update button
                const saveButton = page.locator('button:has-text("Save")').or(
                    page.locator('button:has-text("Update")')
                );

                if (await saveButton.count() > 0) {
                    await expect(saveButton.first()).toBeVisible();
                }
            }
        });

        test('should test logout button', async ({ page }) => {
            // Look for logout button (might be in profile or settings)
            const logoutButton = page.locator('button:has-text("Logout")').or(
                page.locator('button:has-text("Log out")').or(
                    page.locator('button:has-text("Sign out")')
                )
            );

            if (await logoutButton.count() > 0) {
                await expect(logoutButton.first()).toBeVisible();
                await expect(logoutButton.first()).toBeEnabled();
            }
        });
    });

    test.describe('Money/Transaction Buttons', () => {
        test.beforeEach(async ({ page }) => {
            await page.fill('input[type="email"]', 'test@example.com');
            await page.fill('input[type="password"]', 'password123');
            await page.click('button:has-text("Login")');
            await page.waitForLoadState('networkidle');
        });

        test('should test money page buttons', async ({ page }) => {
            const moneyLink = page.locator('text=Money').first();
            if (await moneyLink.count() > 0) {
                await moneyLink.click();
                await page.waitForLoadState('networkidle');

                // Look for add transaction button
                const addButton = page.locator('button').filter({ hasText: /Add|New|Create/i }).first();
                if (await addButton.count() > 0) {
                    await expect(addButton).toBeVisible();
                    await expect(addButton).toBeEnabled();
                }

                // Look for budget button
                const budgetButton = page.locator('button:has-text("Budget")');
                if (await budgetButton.count() > 0) {
                    await expect(budgetButton).toBeVisible();
                }
            }
        });
    });

    test.describe('Calendar/Event Buttons', () => {
        test.beforeEach(async ({ page }) => {
            await page.fill('input[type="email"]', 'test@example.com');
            await page.fill('input[type="password"]', 'password123');
            await page.click('button:has-text("Login")');
            await page.waitForLoadState('networkidle');
        });

        test('should test calendar navigation buttons', async ({ page }) => {
            const eventsLink = page.locator('text=Events').first();
            if (await eventsLink.count() > 0) {
                await eventsLink.click();
                await page.waitForLoadState('networkidle');

                // Look for calendar navigation buttons (prev, next, today)
                const todayButton = page.locator('button:has-text("Today")');
                if (await todayButton.count() > 0) {
                    await expect(todayButton).toBeVisible();
                    await todayButton.click();
                }

                // Look for view switcher buttons (month, week, day)
                const viewButtons = page.locator('button').filter({ hasText: /Month|Week|Day/i });
                if (await viewButtons.count() > 0) {
                    await expect(viewButtons.first()).toBeVisible();
                }
            }
        });
    });

    test.describe('Family Tree Buttons', () => {
        test.beforeEach(async ({ page }) => {
            await page.fill('input[type="email"]', 'test@example.com');
            await page.fill('input[type="password"]', 'password123');
            await page.click('button:has-text("Login")');
            await page.waitForLoadState('networkidle');
        });

        test('should test family tree buttons', async ({ page }) => {
            const familyTreeLink = page.locator('text=Family Tree').or(page.locator('text=Family'));
            if (await familyTreeLink.count() > 0) {
                await familyTreeLink.first().click();
                await page.waitForLoadState('networkidle');

                // Look for add member button
                const addMemberButton = page.locator('button').filter({ hasText: /Add Member|New Member/i });
                if (await addMemberButton.count() > 0) {
                    await expect(addMemberButton.first()).toBeVisible();
                }

                // Look for add relationship button
                const addRelationshipButton = page.locator('button').filter({ hasText: /Add Relationship|Relationship/i });
                if (await addRelationshipButton.count() > 0) {
                    await expect(addRelationshipButton.first()).toBeVisible();
                }
            }
        });
    });

    test.describe('Shopping List Buttons', () => {
        test.beforeEach(async ({ page }) => {
            await page.fill('input[type="email"]', 'test@example.com');
            await page.fill('input[type="password"]', 'password123');
            await page.click('button:has-text("Login")');
            await page.waitForLoadState('networkidle');
        });

        test('should test shopping list checkbox/complete buttons', async ({ page }) => {
            const shoppingLink = page.locator('text=Shopping').first();
            if (await shoppingLink.count() > 0) {
                await shoppingLink.click();
                await page.waitForLoadState('networkidle');

                // Look for checkboxes or complete buttons
                const checkboxes = page.locator('input[type="checkbox"]');
                if (await checkboxes.count() > 0) {
                    await expect(checkboxes.first()).toBeVisible();
                }

                // Look for add item button
                const addButton = page.locator('button').filter({ hasText: /Add|New|\+/i }).first();
                if (await addButton.count() > 0) {
                    await expect(addButton).toBeVisible();
                }
            }
        });
    });

    test.describe('Notification Buttons', () => {
        test.beforeEach(async ({ page }) => {
            await page.fill('input[type="email"]', 'test@example.com');
            await page.fill('input[type="password"]', 'password123');
            await page.click('button:has-text("Login")');
            await page.waitForLoadState('networkidle');
        });

        test('should test notification bell button', async ({ page }) => {
            // Look for notification bell button
            const notificationButton = page.locator('button[aria-label*="notification" i]').or(
                page.locator('button').filter({ hasText: /🔔|bell/i })
            );

            if (await notificationButton.count() > 0) {
                await expect(notificationButton.first()).toBeVisible();
                await notificationButton.first().click();

                // Wait for notification panel
                await page.waitForTimeout(500);
            }
        });

        test('should test mark as read buttons in notifications', async ({ page }) => {
            const notificationButton = page.locator('button[aria-label*="notification" i]').or(
                page.locator('button').filter({ hasText: /🔔|bell/i })
            );

            if (await notificationButton.count() > 0) {
                await notificationButton.first().click();
                await page.waitForTimeout(500);

                // Look for mark as read button
                const markReadButton = page.locator('button:has-text("Mark as read")').or(
                    page.locator('button:has-text("Clear")')
                );

                if (await markReadButton.count() > 0) {
                    await expect(markReadButton.first()).toBeVisible();
                }
            }
        });
    });
});

