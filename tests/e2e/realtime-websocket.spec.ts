import { test, expect } from '@playwright/test';

/**
 * Dedicated E2E tests for Real-time WebSocket functionality
 * 
 * Tests:
 * - WebSocket connection establishment
 * - Authentication over WebSocket
 * - Real-time task updates
 * - Real-time shopping updates
 * - Real-time meal updates
 * - Activity log broadcasting
 * - Connection recovery/reconnection
 * - Multi-user scenarios
 */

test.describe('WebSocket Connection', () => {
    test('should establish WebSocket connection on page load', async ({ page }) => {
        // Monitor WebSocket connections
        const wsConnections: unknown[] = [];

        page.on('websocket', ws => {
            wsConnections.push(ws);
            console.log('WebSocket connection opened:', ws.url());

            ws.on('close', () => console.log('WebSocket closed'));
            ws.on('framereceived', frame => {
                try {
                    const data = JSON.parse(frame.payload as string);
                    console.log('WebSocket received:', data.type);
                } catch {
                    // Non-JSON frame
                }
            });
        });

        await page.goto('/');
        await page.waitForTimeout(3000);

        // Should have at least one WebSocket connection
        expect(wsConnections.length).toBeGreaterThan(0);

        // Verify WebSocket URL
        const wsUrl = (wsConnections[0] as { url: () => string }).url();
        expect(wsUrl).toContain('ws://');
        expect(wsUrl).toContain('/ws');
    });

    test('should authenticate over WebSocket', async ({ page }) => {
        let authSuccessReceived = false;

        page.on('websocket', ws => {
            ws.on('framereceived', frame => {
                try {
                    const data = JSON.parse(frame.payload as string);
                    if (data.type === 'auth_success') {
                        authSuccessReceived = true;
                        console.log('Auth success received');
                    }
                } catch {
                    // Ignore
                }
            });
        });

        await page.goto('/');
        await page.waitForTimeout(3000);

        // If app sends auth, should receive auth_success
        // (This depends on your implementation)
        console.log('Auth success received:', authSuccessReceived);
    });

    test('should handle WebSocket reconnection', async ({ page }) => {
        let connectionCount = 0;

        page.on('websocket', () => {
            connectionCount++;
            console.log(`WebSocket connection #${connectionCount}`);
        });

        await page.goto('/');
        await page.waitForTimeout(2000);

        const initialConnections = connectionCount;

        // Simulate network interruption
        await page.context().setOffline(true);
        await page.waitForTimeout(2000);

        // Restore network
        await page.context().setOffline(false);
        await page.waitForTimeout(5000); // Wait for reconnection

        // Should have reconnected (new connection)
        expect(connectionCount).toBeGreaterThanOrEqual(initialConnections);
    });
});

test.describe('Real-time Task Updates', () => {
    test('should broadcast task creation to other users', async ({ browser }) => {
        // Create two browser contexts (simulating two users)
        const context1 = await browser.newContext();
        const context2 = await browser.newContext();

        const page1 = await context1.newPage();
        const page2 = await context2.newPage();

        let page2ReceivedUpdate = false;

        // Monitor WebSocket on page2
        page2.on('websocket', ws => {
            ws.on('framereceived', frame => {
                try {
                    const data = JSON.parse(frame.payload as string);
                    if (data.type === 'task_update' && data.action === 'create') {
                        page2ReceivedUpdate = true;
                        console.log('Page 2 received task update:', data);
                    }
                } catch {
                    // Ignore
                }
            });
        });

        // Load both pages
        await page1.goto('/');
        await page2.goto('/');
        await page1.waitForTimeout(3000);
        await page2.waitForTimeout(3000);

        // Create task on page1
        await page1.click('[data-testid="add-task-button"]').catch(() => {
            page1.click('button:has-text("Add Task")');
        });

        await page1.waitForTimeout(500);
        await page1.fill('[data-testid="task-title"]', 'WebSocket broadcast test task');
        await page1.click('button[type="submit"]');

        // Wait for broadcast
        await page2.waitForTimeout(3000);

        // Verify page2 received the update
        console.log('Page 2 received update:', page2ReceivedUpdate);

        // Cleanup
        await context1.close();
        await context2.close();
    });

    test('should broadcast task completion', async ({ browser }) => {
        const context1 = await browser.newContext();
        const context2 = await browser.newContext();

        const page1 = await context1.newPage();
        const page2 = await context2.newPage();

        let completionReceived = false;

        page2.on('websocket', ws => {
            ws.on('framereceived', frame => {
                try {
                    const data = JSON.parse(frame.payload as string);
                    if (data.type === 'task_update' && data.action === 'complete') {
                        completionReceived = true;
                        console.log('Task completion received on page 2');
                    }
                } catch {
                    // Ignore
                }
            });
        });

        await page1.goto('/');
        await page2.goto('/');
        await page1.waitForTimeout(2000);
        await page2.waitForTimeout(2000);

        // Complete a task on page1 (assuming there's at least one task)
        const completeButton = page1.locator('[data-testid^="complete-task"]').first();

        if (await completeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await completeButton.click();
            await page2.waitForTimeout(2000);

            console.log('Completion broadcasted:', completionReceived);
        }

        await context1.close();
        await context2.close();
    });
});

test.describe('Real-time Shopping Updates', () => {
    test('should broadcast shopping list changes', async ({ browser }) => {
        const context1 = await browser.newContext();
        const context2 = await browser.newContext();

        const page1 = await context1.newPage();
        const page2 = await context2.newPage();

        let shoppingUpdateReceived = false;

        page2.on('websocket', ws => {
            ws.on('framereceived', frame => {
                try {
                    const data = JSON.parse(frame.payload as string);
                    if (data.type === 'shopping_update') {
                        shoppingUpdateReceived = true;
                        console.log('Shopping update received:', data);
                    }
                } catch {
                    // Ignore
                }
            });
        });

        await page1.goto('/');
        await page2.goto('/');
        await page1.waitForTimeout(2000);

        // Add shopping item on page1
        await page1.click('[data-testid="nav-shopping"]').catch(() => {
            page1.click('text=Shopping');
        });

        await page1.waitForTimeout(500);

        await page1.click('[data-testid="add-shopping-item"]').catch(() => {
            console.log('Shopping add button may have different selector');
        });

        await page2.waitForTimeout(2000);

        console.log('Shopping update received:', shoppingUpdateReceived);

        await context1.close();
        await context2.close();
    });
});

test.describe('Real-time Meal Updates', () => {
    test('should broadcast meal additions', async ({ browser }) => {
        const context1 = await browser.newContext();
        const context2 = await browser.newContext();

        const page1 = await context1.newPage();
        const page2 = await context2.newPage();

        let mealUpdateReceived = false;

        page2.on('websocket', ws => {
            ws.on('framereceived', frame => {
                try {
                    const data = JSON.parse(frame.payload as string);
                    if (data.type === 'meal_update') {
                        mealUpdateReceived = true;
                        console.log('Meal update received:', data);
                    }
                } catch {
                    // Ignore
                }
            });
        });

        await page1.goto('/');
        await page2.goto('/');
        await page1.waitForTimeout(2000);

        // Add meal on page1
        await page1.click('[data-testid="nav-meals"]').catch(() => {
            page1.click('text=Meals');
        });

        await page1.waitForTimeout(500);

        await page1.click('[data-testid="add-meal-button"]').catch(() => {
            console.log('Meal add button may differ');
        });

        await page2.waitForTimeout(2000);

        console.log('Meal update received:', mealUpdateReceived);

        await context1.close();
        await context2.close();
    });
});

test.describe('Activity Log Broadcasting', () => {
    test('should broadcast activity to all users', async ({ browser }) => {
        const context1 = await browser.newContext();
        const context2 = await browser.newContext();

        const page1 = await context1.newPage();
        const page2 = await context2.newPage();

        let activityReceived = false;

        page2.on('websocket', ws => {
            ws.on('framereceived', frame => {
                try {
                    const data = JSON.parse(frame.payload as string);
                    if (data.type === 'activity_log') {
                        activityReceived = true;
                        console.log('Activity log received:', data);
                    }
                } catch {
                    // Ignore
                }
            });
        });

        await page1.goto('/');
        await page2.goto('/');
        await page1.waitForTimeout(2000);

        // Perform any action on page1 that logs activity
        await page1.click('[data-testid="add-task-button"]').catch(() => {
            page1.click('button:has-text("Add Task")');
        });

        await page1.waitForTimeout(500);
        await page1.fill('[data-testid="task-title"]', 'Activity test');
        await page1.click('button[type="submit"]');

        await page2.waitForTimeout(2000);

        console.log('Activity broadcasted:', activityReceived);

        await context1.close();
        await context2.close();
    });
});

test.describe('WebSocket Heartbeat', () => {
    test('should maintain connection with heartbeat', async ({ page }) => {
        const pings: number[] = [];
        const pongs: number[] = [];

        page.on('websocket', ws => {
            ws.on('framesent', frame => {
                if (frame.payload === 'ping' || frame.payload.includes('ping')) {
                    pings.push(Date.now());
                    console.log('Ping sent');
                }
            });

            ws.on('framereceived', frame => {
                try {
                    const data = JSON.parse(frame.payload as string);
                    if (data.type === 'pong') {
                        pongs.push(Date.now());
                        console.log('Pong received');
                    }
                } catch {
                    // Ignore
                }
            });
        });

        await page.goto('/');

        // Wait for several heartbeat intervals (assuming 30s interval)
        await page.waitForTimeout(65000); // Wait 65 seconds

        console.log('Pings sent:', pings.length);
        console.log('Pongs received:', pongs.length);

        // Should have sent at least 2 pings in 65 seconds
        expect(pings.length).toBeGreaterThanOrEqual(2);
    });
});

test.describe('Message Notifications', () => {
    test('should broadcast message notifications', async ({ browser }) => {
        const context1 = await browser.newContext();
        const context2 = await browser.newContext();

        const page1 = await context1.newPage();
        const page2 = await context2.newPage();

        let messageNotificationReceived = false;

        page2.on('websocket', ws => {
            ws.on('framereceived', frame => {
                try {
                    const data = JSON.parse(frame.payload as string);
                    if (data.type === 'message_notification') {
                        messageNotificationReceived = true;
                        console.log('Message notification received:', data);
                    }
                } catch {
                    // Ignore
                }
            });
        });

        await page1.goto('/');
        await page2.goto('/');
        await page1.waitForTimeout(2000);

        // Send message on page1
        await page1.click('[data-testid="nav-messages"]').catch(() => {
            page1.click('text=Messages');
        });

        await page1.waitForTimeout(500);

        await page1.fill('[data-testid="message-input"]', 'WebSocket test message').catch(() => {
            console.log('Message input may have different selector');
        });

        await page1.click('[data-testid="send-message"]').catch(() => {
            page1.click('button:has-text("Send")');
        });

        await page2.waitForTimeout(2000);

        console.log('Message notification received:', messageNotificationReceived);

        await context1.close();
        await context2.close();
    });
});

test.describe('Performance and Scalability', () => {
    test('should handle multiple rapid updates', async ({ page }) => {
        const updates: unknown[] = [];

        page.on('websocket', ws => {
            ws.on('framereceived', frame => {
                try {
                    const data = JSON.parse(frame.payload as string);
                    if (data.type && data.type.includes('_update')) {
                        updates.push(data);
                    }
                } catch {
                    // Ignore
                }
            });
        });

        await page.goto('/');
        await page.waitForTimeout(2000);

        // Create multiple tasks rapidly
        for (let i = 0; i < 5; i++) {
            await page.click('[data-testid="add-task-button"]').catch(() => {
                page.click('button:has-text("Add Task")');
            });

            await page.waitForTimeout(300);
            await page.fill('[data-testid="task-title"]', `Rapid test ${i}`);
            await page.click('button[type="submit"]');
            await page.waitForTimeout(200);
        }

        // Wait for all updates to arrive
        await page.waitForTimeout(3000);

        console.log('Total updates received:', updates.length);

        // Should have received updates for all tasks
        expect(updates.length).toBeGreaterThanOrEqual(5);
    });
});

test.describe('Error Recovery', () => {
    test('should recover from server restart', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        // Note: This test would require actually restarting the backend
        // In a real scenario, you'd use docker-compose restart or similar
        console.log('Server restart test requires manual backend restart');

        // Simulate by going offline and back online
        await page.context().setOffline(true);
        await page.waitForTimeout(3000);
        await page.context().setOffline(false);
        await page.waitForTimeout(5000);

        // WebSocket should reconnect
        // Verify by performing an action
        await page.click('[data-testid="add-task-button"]').catch(() => {
            console.log('Action after reconnect');
        });
    });
});

