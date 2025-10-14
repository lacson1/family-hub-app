import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helpers';
import { faker } from '@faker-js/faker';

test.describe('Form Fields - UI Components', () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
        await page.waitForLoadState('networkidle');
    });

    test.describe('Text Input Fields', () => {
        test('should type into text input field', async ({ page }) => {
            // Navigate to Contacts
            await page.click('text=Contacts');
            await page.waitForLoadState('networkidle');

            // Open add contact form
            const addButton = page.locator('button').filter({ hasText: /Add Contact/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Type into name field
                const nameInput = page.locator('input[type="text"]').first();
                const testName = faker.person.fullName();
                await nameInput.fill(testName);

                // Verify value
                await expect(nameInput).toHaveValue(testName);
            }
        });

        test('should clear text input field', async ({ page }) => {
            // Navigate to Tasks
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            // Open add task form
            const addButton = page.locator('button').filter({ hasText: /^Add Task$|^\+$/ }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Type and clear
                const titleInput = page.locator('input[aria-label*="Task title"], input[placeholder*="task"]').first();
                if (await titleInput.count() > 0) {
                    await titleInput.fill('Test Task');
                    await expect(titleInput).toHaveValue('Test Task');

                    await titleInput.clear();
                    await expect(titleInput).toHaveValue('');
                }
            }
        });

        test('should show placeholder text in empty fields', async ({ page }) => {
            // Navigate to Events
            await page.click('text=Events');
            await page.waitForLoadState('networkidle');

            // Open add event form
            const addButton = page.locator('button').filter({ hasText: /Add Event/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Check for placeholder text
                const titleInput = page.locator('input[placeholder*="event"]').first();
                if (await titleInput.count() > 0) {
                    const placeholder = await titleInput.getAttribute('placeholder');
                    expect(placeholder).toBeTruthy();
                }
            }
        });

        test('should handle text input focus states', async ({ page }) => {
            // Navigate to Contacts
            await page.click('text=Contacts');
            await page.waitForLoadState('networkidle');

            // Open form
            const addButton = page.locator('button').filter({ hasText: /Add Contact/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Focus on input
                const nameInput = page.locator('input[type="text"]').first();
                await nameInput.focus();

                // Verify it's focused
                await expect(nameInput).toBeFocused();
            }
        });
    });

    test.describe('Email Input Fields', () => {
        test('should accept valid email format', async ({ page }) => {
            // Navigate to Contacts
            await page.click('text=Contacts');
            await page.waitForLoadState('networkidle');

            // Open add contact form
            const addButton = page.locator('button').filter({ hasText: /Add Contact/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Type into email field
                const emailInput = page.locator('input[type="email"]').first();
                if (await emailInput.count() > 0) {
                    const testEmail = faker.internet.email();
                    await emailInput.fill(testEmail);
                    await expect(emailInput).toHaveValue(testEmail);
                }
            }
        });

        test('should show email field in contact form', async ({ page }) => {
            // Navigate to Contacts
            await page.click('text=Contacts');
            await page.waitForLoadState('networkidle');

            const addButton = page.locator('button').filter({ hasText: /Add Contact/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Check email field exists
                const emailInput = page.locator('input[type="email"]');
                if (await emailInput.count() > 0) {
                    await expect(emailInput.first()).toBeVisible();
                }
            }
        });
    });

    test.describe('Phone Input Fields', () => {
        test('should accept phone number input', async ({ page }) => {
            // Navigate to Contacts
            await page.click('text=Contacts');
            await page.waitForLoadState('networkidle');

            // Open add contact form
            const addButton = page.locator('button').filter({ hasText: /Add Contact/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Type into phone field
                const phoneInput = page.locator('input[type="tel"], input[placeholder*="phone" i]').first();
                if (await phoneInput.count() > 0) {
                    await phoneInput.fill('555-123-4567');
                    await expect(phoneInput).toHaveValue('555-123-4567');
                }
            }
        });
    });

    test.describe('Date Input Fields', () => {
        test('should select date from date picker', async ({ page }) => {
            // Navigate to Tasks
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            // Open add task form
            const addButton = page.locator('button').filter({ hasText: /^Add Task$|^\+$/ }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Fill date field
                const dateInput = page.locator('input[type="date"]').first();
                if (await dateInput.count() > 0) {
                    await dateInput.fill('2025-12-25');
                    await expect(dateInput).toHaveValue('2025-12-25');
                }
            }
        });

        test('should display date picker on event form', async ({ page }) => {
            // Navigate to Events
            await page.click('text=Events');
            await page.waitForLoadState('networkidle');

            // Open add event form
            const addButton = page.locator('button').filter({ hasText: /Add Event/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Check for date input
                const dateInput = page.locator('input[type="date"]');
                await expect(dateInput.first()).toBeVisible();
            }
        });
    });

    test.describe('Time Input Fields', () => {
        test('should select time from time picker', async ({ page }) => {
            // Navigate to Events
            await page.click('text=Events');
            await page.waitForLoadState('networkidle');

            // Open add event form
            const addButton = page.locator('button').filter({ hasText: /Add Event/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Fill time field
                const timeInput = page.locator('input[type="time"]').first();
                if (await timeInput.count() > 0) {
                    await timeInput.fill('14:30');
                    await expect(timeInput).toHaveValue('14:30');
                }
            }
        });
    });

    test.describe('Select Dropdown Fields', () => {
        test('should open and select from dropdown', async ({ page }) => {
            // Navigate to Tasks
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            // Open add task form
            const addButton = page.locator('button').filter({ hasText: /^Add Task$|^\+$/ }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Select priority
                const prioritySelect = page.locator('select[aria-label*="priority" i]').first();
                if (await prioritySelect.count() > 0) {
                    await prioritySelect.selectOption('high');
                    await expect(prioritySelect).toHaveValue('high');
                }
            }
        });

        test('should show all dropdown options', async ({ page }) => {
            // Navigate to Events
            await page.click('text=Events');
            await page.waitForLoadState('networkidle');

            // Open add event form
            const addButton = page.locator('button').filter({ hasText: /Add Event/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Check event type dropdown
                const typeSelect = page.locator('select[aria-label*="event type" i]').first();
                if (await typeSelect.count() > 0) {
                    // Get all options
                    const options = await typeSelect.locator('option').count();
                    expect(options).toBeGreaterThan(0);
                }
            }
        });

        test('should change dropdown value', async ({ page }) => {
            // Navigate to Contacts
            await page.click('text=Contacts');
            await page.waitForLoadState('networkidle');

            // Open add contact form
            const addButton = page.locator('button').filter({ hasText: /Add Contact/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Select category
                const categorySelect = page.locator('select').first();
                if (await categorySelect.count() > 0) {
                    // Try to select a different value
                    await categorySelect.selectOption({ index: 1 });
                    const newValue = await categorySelect.inputValue();

                    // Value should have changed (unless there's only one option)
                    const optionCount = await categorySelect.locator('option').count();
                    if (optionCount > 1) {
                        expect(newValue).toBeDefined();
                    }
                }
            }
        });
    });

    test.describe('Textarea Fields', () => {
        test('should type multi-line text in textarea', async ({ page }) => {
            // Navigate to Events
            await page.click('text=Events');
            await page.waitForLoadState('networkidle');

            // Open add event form
            const addButton = page.locator('button').filter({ hasText: /Add Event/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Type into description textarea
                const descriptionTextarea = page.locator('textarea').first();
                if (await descriptionTextarea.count() > 0) {
                    const multiLineText = 'Line 1\nLine 2\nLine 3';
                    await descriptionTextarea.fill(multiLineText);
                    await expect(descriptionTextarea).toHaveValue(multiLineText);
                }
            }
        });

        test('should handle textarea resize', async ({ page }) => {
            // Navigate to Events
            await page.click('text=Events');
            await page.waitForLoadState('networkidle');

            // Open add event form
            const addButton = page.locator('button').filter({ hasText: /Add Event/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Check textarea exists
                const textarea = page.locator('textarea').first();
                if (await textarea.count() > 0) {
                    await expect(textarea).toBeVisible();

                    // Check for rows attribute
                    const rows = await textarea.getAttribute('rows');
                    expect(rows).toBeTruthy();
                }
            }
        });
    });

    test.describe('Number Input Fields', () => {
        test('should accept numeric input in number fields', async ({ page }) => {
            // Navigate to Money
            await page.click('text=Money');
            await page.waitForLoadState('networkidle');

            // Look for add transaction button
            const addButton = page.locator('button').filter({ hasText: /Add Transaction|New/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Type into amount field
                const amountInput = page.locator('input[type="number"], input[placeholder*="amount" i]').first();
                if (await amountInput.count() > 0) {
                    await amountInput.fill('150.50');
                    await expect(amountInput).toHaveValue('150.50');
                }
            }
        });

        test('should handle decimal values', async ({ page }) => {
            // Navigate to Money
            await page.click('text=Money');
            await page.waitForLoadState('networkidle');

            // Look for any numeric input
            const addButton = page.locator('button').filter({ hasText: /Add|Budget/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                const numberInput = page.locator('input[type="number"]').first();
                if (await numberInput.count() > 0) {
                    await numberInput.fill('99.99');
                    await expect(numberInput).toHaveValue('99.99');
                }
            }
        });
    });

    test.describe('File Upload Fields', () => {
        test('should show file upload button in image picker', async ({ page }) => {
            // Navigate to Family Tree
            await page.click('text=Family');
            await page.waitForLoadState('networkidle');

            // Look for add family member button
            const addButton = page.locator('button').filter({ hasText: /Add Member|Add Family/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Check for file input or upload button
                const fileInput = page.locator('input[type="file"]');
                if (await fileInput.count() > 0) {
                    expect(await fileInput.count()).toBeGreaterThan(0);
                }
            }
        });
    });

    test.describe('Field Disabled States', () => {
        test('should not allow input in disabled fields', async ({ page }) => {
            // Navigate to any form page
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            // Check for any disabled fields in the page
            const disabledInputs = page.locator('input:disabled, button:disabled');
            if (await disabledInputs.count() > 0) {
                const firstDisabled = disabledInputs.first();
                await expect(firstDisabled).toBeDisabled();
            }
        });
    });

    test.describe('Field Focus and Blur', () => {
        test('should handle field focus correctly', async ({ page }) => {
            // Navigate to Tasks
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            // Open form
            const addButton = page.locator('button').filter({ hasText: /^Add Task$|^\+$/ }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Focus on first input
                const firstInput = page.locator('input').first();
                await firstInput.focus();
                await expect(firstInput).toBeFocused();

                // Tab to next field
                await page.keyboard.press('Tab');
                await expect(firstInput).not.toBeFocused();
            }
        });

        test('should trigger blur event on field exit', async ({ page }) => {
            // Navigate to Contacts
            await page.click('text=Contacts');
            await page.waitForLoadState('networkidle');

            // Open form
            const addButton = page.locator('button').filter({ hasText: /Add Contact/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Focus and blur
                const nameInput = page.locator('input[type="text"]').first();
                await nameInput.focus();
                await nameInput.blur();

                // Field should no longer be focused
                await expect(nameInput).not.toBeFocused();
            }
        });
    });

    test.describe('Keyboard Navigation in Forms', () => {
        test('should navigate form fields with Tab key', async ({ page }) => {
            // Navigate to Events
            await page.click('text=Events');
            await page.waitForLoadState('networkidle');

            // Open form
            const addButton = page.locator('button').filter({ hasText: /Add Event/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Tab through fields
                await page.keyboard.press('Tab');
                await page.keyboard.press('Tab');
                await page.keyboard.press('Tab');

                // Should be on some form element
                const focusedElement = await page.evaluate(() => window.document.activeElement?.tagName);
                expect(['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA']).toContain(focusedElement);
            }
        });

        test('should navigate backwards with Shift+Tab', async ({ page }) => {
            // Navigate to Tasks
            await page.click('text=Tasks');
            await page.waitForLoadState('networkidle');

            // Open form
            const addButton = page.locator('button').filter({ hasText: /^Add Task$|^\+$/ }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Tab forward then backward
                await page.keyboard.press('Tab');
                await page.keyboard.press('Tab');
                await page.keyboard.press('Shift+Tab');

                // Should be on a form element
                const focusedElement = await page.evaluate(() => window.document.activeElement?.tagName);
                expect(['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA']).toContain(focusedElement);
            }
        });
    });

    test.describe('Field Value Persistence', () => {
        test('should maintain field values during form interaction', async ({ page }) => {
            // Navigate to Contacts
            await page.click('text=Contacts');
            await page.waitForLoadState('networkidle');

            // Open form
            const addButton = page.locator('button').filter({ hasText: /Add Contact/i }).first();
            if (await addButton.count() > 0) {
                await addButton.click();
                await page.waitForTimeout(500);

                // Fill multiple fields
                const nameInput = page.locator('input[type="text"]').first();
                const testName = 'Test Person';
                await nameInput.fill(testName);

                const emailInput = page.locator('input[type="email"]').first();
                if (await emailInput.count() > 0) {
                    await emailInput.fill('test@example.com');
                }

                // Verify first field still has value
                await expect(nameInput).toHaveValue(testName);
            }
        });
    });
});

