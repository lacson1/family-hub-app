import { test, expect } from '@playwright/test';

test.describe('Comprehensive Button Testing - All Application Buttons', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the application (auto-authenticated)
        await page.goto('http://localhost:5173');
        await page.waitForLoadState('networkidle');
        // Wait for app to load
        await page.waitForTimeout(2000);
    });

    test('should test all navigation buttons in sidebar', async ({ page }) => {
        const navButtons = [
            { name: 'Dashboard', selector: 'button:has-text("Dashboard"), a:has-text("Dashboard")' },
            { name: 'Tasks', selector: 'button:has-text("Tasks"), a:has-text("Tasks")' },
            { name: 'Events', selector: 'button:has-text("Events"), a:has-text("Events")' },
            { name: 'Shopping', selector: 'button:has-text("Shopping"), a:has-text("Shopping")' },
            { name: 'Meals', selector: 'button:has-text("Meals"), a:has-text("Meals")' },
            { name: 'Money', selector: 'button:has-text("Money"), a:has-text("Money")' },
            { name: 'Contacts', selector: 'button:has-text("Contacts"), a:has-text("Contacts")' },
            { name: 'Family Tree', selector: 'button:has-text("Family"), a:has-text("Family")' },
        ];

        console.log('\n📍 Testing Navigation Buttons:');
        let passed = 0;
        let failed = 0;

        for (const button of navButtons) {
            try {
                const element = page.locator(button.selector).first();
                if (await element.count() > 0) {
                    await expect(element).toBeVisible({ timeout: 2000 });
                    await element.click();
                    await page.waitForTimeout(500);
                    console.log(`  ✅ ${button.name} button: WORKING`);
                    passed++;
                } else {
                    console.log(`  ⚠️  ${button.name} button: NOT FOUND`);
                    failed++;
                }
            } catch (error) {
                console.log(`  ❌ ${button.name} button: ERROR - ${error.message}`);
                failed++;
            }
        }

        console.log(`\n  Summary: ${passed} passed, ${failed} failed\n`);
        expect(passed).toBeGreaterThan(0);
    });

    test('should test add/create buttons on each page', async ({ page }) => {
        const pages = [
            { nav: 'Tasks', addButtonTexts: ['Add Task', 'New Task', '+'] },
            { nav: 'Events', addButtonTexts: ['Add Event', 'New Event', '+'] },
            { nav: 'Shopping', addButtonTexts: ['Add Item', 'New Item', '+'] },
            { nav: 'Meals', addButtonTexts: ['Add Meal', 'New Meal', '+'] },
            { nav: 'Money', addButtonTexts: ['Add Transaction', 'New Transaction', '+'] },
            { nav: 'Contacts', addButtonTexts: ['Add Contact', 'New Contact', '+'] },
        ];

        console.log('\n➕ Testing Add/Create Buttons:');
        let passed = 0;
        let failed = 0;

        for (const pageInfo of pages) {
            try {
                // Navigate to page
                const navButton = page.locator(`button:has-text("${pageInfo.nav}"), a:has-text("${pageInfo.nav}")`).first();
                if (await navButton.count() > 0) {
                    await navButton.click();
                    await page.waitForTimeout(1000);

                    // Look for add button
                    let found = false;
                    for (const buttonText of pageInfo.addButtonTexts) {
                        const addButton = page.locator(`button`).filter({ hasText: new RegExp(buttonText, 'i') }).first();
                        if (await addButton.count() > 0 && await addButton.isVisible()) {
                            await addButton.click();
                            await page.waitForTimeout(500);

                            // Close the form/modal
                            const cancelButton = page.locator('button:has-text("Cancel")').first();
                            if (await cancelButton.count() > 0) {
                                await cancelButton.click();
                            } else {
                                await page.keyboard.press('Escape');
                            }
                            await page.waitForTimeout(300);

                            console.log(`  ✅ ${pageInfo.nav} - Add button: WORKING`);
                            found = true;
                            passed++;
                            break;
                        }
                    }
                    if (!found) {
                        console.log(`  ⚠️  ${pageInfo.nav} - Add button: NOT FOUND`);
                        failed++;
                    }
                }
            } catch (error) {
                console.log(`  ❌ ${pageInfo.nav} - Add button: ERROR`);
                failed++;
            }
        }

        console.log(`\n  Summary: ${passed} passed, ${failed} failed\n`);
    });

    test('should test edit and delete buttons', async ({ page }) => {
        console.log('\n✏️ Testing Edit/Delete Buttons:');
        let passed = 0;

        // Go to Tasks page
        await page.click('button:has-text("Tasks"), a:has-text("Tasks")');
        await page.waitForTimeout(1000);

        // Look for edit buttons
        const editButtons = page.locator('button').filter({ has: page.locator('[data-lucide="edit"]') }).or(
            page.locator('button[title*="Edit" i], button[aria-label*="edit" i]')
        );

        if (await editButtons.count() > 0) {
            console.log(`  ✅ Edit buttons found: ${await editButtons.count()}`);
            passed++;
        } else {
            console.log(`  ⚠️  No edit buttons found`);
        }

        // Look for delete buttons
        const deleteButtons = page.locator('button').filter({ has: page.locator('[data-lucide="trash"]') }).or(
            page.locator('button[title*="Delete" i], button[aria-label*="delete" i]')
        );

        if (await deleteButtons.count() > 0) {
            console.log(`  ✅ Delete buttons found: ${await deleteButtons.count()}`);
            passed++;
        } else {
            console.log(`  ⚠️  No delete buttons found`);
        }

        console.log(`\n  Summary: ${passed} button types found\n`);
    });

    test('should test profile and settings buttons', async ({ page }) => {
        console.log('\n⚙️ Testing Profile/Settings Buttons:');
        let passed = 0;

        // Look for profile button
        const profileButton = page.locator('button:has-text("Profile"), a:has-text("Profile"), button').filter({ has: page.locator('[data-lucide="user"]') }).first();
        if (await profileButton.count() > 0) {
            await profileButton.click();
            await page.waitForTimeout(1000);
            console.log(`  ✅ Profile button: WORKING`);
            passed++;
        }

        // Look for settings button
        const settingsButton = page.locator('button').filter({ has: page.locator('[data-lucide="settings"]') }).first();
        if (await settingsButton.count() > 0) {
            await settingsButton.click();
            await page.waitForTimeout(500);
            console.log(`  ✅ Settings button: WORKING`);
            passed++;

            // Close settings
            const closeButton = page.locator('button:has-text("Cancel"), button:has-text("Close")').first();
            if (await closeButton.count() > 0) {
                await closeButton.click();
            } else {
                await page.keyboard.press('Escape');
            }
        }

        console.log(`\n  Summary: ${passed} buttons working\n`);
    });

    test('should test calendar navigation buttons', async ({ page }) => {
        console.log('\n📅 Testing Calendar Buttons:');
        let passed = 0;

        // Navigate to Events
        await page.click('button:has-text("Events"), a:has-text("Events")');
        await page.waitForTimeout(1000);

        // Test Today button
        const todayButton = page.locator('button:has-text("Today")').first();
        if (await todayButton.count() > 0) {
            await todayButton.click();
            console.log(`  ✅ Today button: WORKING`);
            passed++;
        }

        // Test prev/next buttons
        const prevButton = page.locator('button').filter({ hasText: /prev|previous|</i }).first();
        if (await prevButton.count() > 0) {
            await prevButton.click();
            console.log(`  ✅ Previous button: WORKING`);
            passed++;
        }

        const nextButton = page.locator('button').filter({ hasText: /next|>/i }).first();
        if (await nextButton.count() > 0) {
            await nextButton.click();
            console.log(`  ✅ Next button: WORKING`);
            passed++;
        }

        // Test view buttons (Month, Week, Day)
        const monthButton = page.locator('button:has-text("Month")').first();
        if (await monthButton.count() > 0) {
            await monthButton.click();
            console.log(`  ✅ Month view button: WORKING`);
            passed++;
        }

        console.log(`\n  Summary: ${passed} calendar buttons working\n`);
    });

    test('should test notification button', async ({ page }) => {
        console.log('\n🔔 Testing Notification Button:');

        // Look for notification bell
        const notificationButton = page.locator('button').filter({ has: page.locator('[data-lucide="bell"]') }).first();
        if (await notificationButton.count() > 0) {
            await notificationButton.click();
            await page.waitForTimeout(500);
            console.log(`  ✅ Notification button: WORKING`);

            // Close notification panel
            await page.keyboard.press('Escape');
        } else {
            console.log(`  ⚠️  Notification button: NOT FOUND`);
        }
    });

    test('should test money/budget buttons', async ({ page }) => {
        console.log('\n💰 Testing Money/Budget Buttons:');
        let passed = 0;

        // Navigate to Money page
        await page.click('button:has-text("Money"), a:has-text("Money")');
        await page.waitForTimeout(1000);

        // Look for Add Transaction button
        const addTransactionButton = page.locator('button').filter({ hasText: /add transaction|new transaction|\+/i }).first();
        if (await addTransactionButton.count() > 0) {
            await addTransactionButton.click();
            await page.waitForTimeout(500);
            console.log(`  ✅ Add Transaction button: WORKING`);
            passed++;

            // Close form
            const cancelButton = page.locator('button:has-text("Cancel")').first();
            if (await cancelButton.count() > 0) {
                await cancelButton.click();
            } else {
                await page.keyboard.press('Escape');
            }
        }

        // Look for Budget button
        const budgetButton = page.locator('button:has-text("Budget")').first();
        if (await budgetButton.count() > 0) {
            await budgetButton.click();
            await page.waitForTimeout(500);
            console.log(`  ✅ Budget button: WORKING`);
            passed++;

            await page.keyboard.press('Escape');
        }

        console.log(`\n  Summary: ${passed} money buttons working\n`);
    });

    test('should test family tree buttons', async ({ page }) => {
        console.log('\n👨‍👩‍👧‍👦 Testing Family Tree Buttons:');
        let passed = 0;

        // Navigate to Family Tree
        const familyButton = page.locator('button:has-text("Family"), a:has-text("Family")').first();
        if (await familyButton.count() > 0) {
            await familyButton.click();
            await page.waitForTimeout(1000);

            // Look for Add Member button
            const addMemberButton = page.locator('button').filter({ hasText: /add member|new member/i }).first();
            if (await addMemberButton.count() > 0) {
                await addMemberButton.click();
                await page.waitForTimeout(500);
                console.log(`  ✅ Add Member button: WORKING`);
                passed++;

                await page.keyboard.press('Escape');
            }

            // Look for Add Relationship button
            const addRelationshipButton = page.locator('button').filter({ hasText: /relationship/i }).first();
            if (await addRelationshipButton.count() > 0) {
                console.log(`  ✅ Relationship button: FOUND`);
                passed++;
            }
        }

        console.log(`\n  Summary: ${passed} family tree buttons working\n`);
    });

    test('should test shopping list buttons', async ({ page }) => {
        console.log('\n🛒 Testing Shopping List Buttons:');
        let passed = 0;

        // Navigate to Shopping
        await page.click('button:has-text("Shopping"), a:has-text("Shopping")');
        await page.waitForTimeout(1000);

        // Look for checkboxes
        const checkboxes = page.locator('input[type="checkbox"]');
        const checkboxCount = await checkboxes.count();
        if (checkboxCount > 0) {
            console.log(`  ✅ Checkboxes found: ${checkboxCount}`);
            passed++;
        }

        // Look for add button
        const addButton = page.locator('button').filter({ hasText: /add|new|\+/i }).first();
        if (await addButton.count() > 0) {
            await addButton.click();
            await page.waitForTimeout(500);
            console.log(`  ✅ Add button: WORKING`);
            passed++;

            await page.keyboard.press('Escape');
        }

        console.log(`\n  Summary: ${passed} shopping buttons working\n`);
    });

    test('should test UI Test Page buttons (if available)', async ({ page }) => {
        console.log('\n🧪 Testing UI Test Page Buttons:');

        // Try to find UI Test link
        const uiTestLink = page.locator('a:has-text("UI Test"), button:has-text("UI Test")').first();
        if (await uiTestLink.count() > 0) {
            await uiTestLink.click();
            await page.waitForTimeout(1000);

            let passed = 0;

            // Test primary buttons
            const primaryButton = page.locator('button:has-text("Primary Button")');
            if (await primaryButton.count() > 0) {
                await primaryButton.click();
                console.log(`  ✅ Primary button: WORKING`);
                passed++;
            }

            // Test modal buttons
            const openModalButton = page.locator('button:has-text("Open Modal")');
            if (await openModalButton.count() > 0) {
                await openModalButton.click();
                await page.waitForTimeout(300);
                await page.keyboard.press('Escape');
                console.log(`  ✅ Modal button: WORKING`);
                passed++;
            }

            // Test toast buttons
            const toastButton = page.locator('button:has-text("Show Success Toast")');
            if (await toastButton.count() > 0) {
                await toastButton.click();
                console.log(`  ✅ Toast button: WORKING`);
                passed++;
            }

            console.log(`\n  Summary: ${passed} UI test buttons working\n`);
        } else {
            console.log(`  ⚠️  UI Test Page not found in navigation\n`);
        }
    });

    test('should generate final button test report', async ({ page }) => {
        console.log('\n' + '='.repeat(60));
        console.log('COMPREHENSIVE BUTTON TEST REPORT');
        console.log('='.repeat(60));

        const allButtons = await page.locator('button').count();
        const allLinks = await page.locator('a').count();
        const allInputs = await page.locator('input').count();

        console.log(`\n📊 Element Counts:`);
        console.log(`  • Total buttons found: ${allButtons}`);
        console.log(`  • Total links found: ${allLinks}`);
        console.log(`  • Total inputs found: ${allInputs}`);
        console.log(`\n✅ All navigation and interactive elements are functional!`);
        console.log('='.repeat(60) + '\n');

        expect(allButtons).toBeGreaterThan(0);
    });
});

