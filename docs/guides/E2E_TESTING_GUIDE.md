# End-to-End Testing Guide

This guide covers the comprehensive E2E testing setup for the Family Hub application using Playwright.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

The E2E testing suite uses:
- **Playwright** - Modern, fast, reliable E2E testing framework
- **TypeScript** - Type-safe test code
- **Faker.js** - Generate realistic test data
- **Page Object Model** - Maintainable test architecture
- **Docker** - Isolated test database environment

## Setup

### Prerequisites

- Node.js 18+ installed
- Docker installed and running
- All project dependencies installed

### 1. Install Dependencies

```bash
npm install
```

This installs Playwright, Faker, and all required dependencies.

### 2. Install Playwright Browsers

```bash
npx playwright install --with-deps
```

This downloads browser binaries for Chromium, Firefox, and WebKit.

### 3. Set Up Test Environment

Create a `.env.test` file in the project root:

```env
VITE_API_URL=http://localhost:3002/api
DATABASE_URL=postgresql://postgres:postgres_test@localhost:5434/familyhub_test
NODE_ENV=test
PORT=3002
TEST_USER_EMAIL=testuser@example.com
TEST_USER_PASSWORD=TestPassword123!
TEST_USER_NAME=Test User
API_BASE_URL=http://localhost:3002/api
```

### 4. Start Test Services

Start the test database and backend:

```bash
docker-compose -f docker-compose.test.yml up -d
```

Wait for services to be ready (about 10-15 seconds).

## Running Tests

### Run All Tests

```bash
npm run test:e2e
```

### Run Tests with UI Mode

```bash
npm run test:e2e:ui
```

This opens Playwright's interactive UI where you can:
- Run individual tests
- Watch tests execute
- Debug failures
- Time travel through test execution

### Run Tests in Headed Mode

```bash
npm run test:e2e:headed
```

See the browser as tests run.

### Debug Tests

```bash
npm run test:e2e:debug
```

Opens the Playwright Inspector for step-by-step debugging.

### Run Specific Browser

```bash
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
```

### Run Specific Test File

```bash
npx playwright test tests/auth.spec.ts
```

### Run Specific Test

```bash
npx playwright test -g "should login with valid credentials"
```

### View Test Report

```bash
npm run test:e2e:report
```

Opens an HTML report showing test results, screenshots, and videos.

## Test Structure

```
tests/
├── global-setup.ts           # Database setup, test user creation
├── global-teardown.ts        # Cleanup after all tests
├── utils/
│   ├── auth-helpers.ts       # Authentication utilities
│   ├── api-helpers.ts        # API interaction utilities
│   └── db-helpers.ts         # Database utilities
├── page-objects/             # Page Object Model classes
│   ├── AuthPage.ts
│   ├── DashboardPage.ts
│   ├── TasksPage.ts
│   ├── EventsPage.ts
│   ├── FamilyTreePage.ts
│   ├── ShoppingPage.ts
│   ├── MealsPage.ts
│   ├── MoneyPage.ts
│   └── ContactsPage.ts
└── *.spec.ts                 # Test suites
    ├── auth.spec.ts
    ├── tasks.spec.ts
    ├── events.spec.ts
    ├── family-tree.spec.ts
    ├── shopping.spec.ts
    ├── meals.spec.ts
    ├── transactions.spec.ts
    ├── contacts.spec.ts
    ├── notifications.spec.ts
    └── integration.spec.ts
```

## Writing Tests

### Using Page Objects

Page Objects encapsulate UI interactions:

```typescript
import { test } from '@playwright/test';
import { login } from './utils/auth-helpers';
import { TasksPage } from './page-objects/TasksPage';
import { DashboardPage } from './page-objects/DashboardPage';

test('should create a task', async ({ page }) => {
  await login(page);
  
  const dashboard = new DashboardPage(page);
  const tasksPage = new TasksPage(page);
  
  await dashboard.navigateToTasks();
  
  await tasksPage.addTask({
    title: 'My Test Task',
    dueDate: '2025-12-31',
    priority: 'high',
  });
  
  await tasksPage.expectTaskVisible('My Test Task');
});
```

### Using Faker for Test Data

Generate realistic test data:

```typescript
import { faker } from '@faker-js/faker';

const taskTitle = faker.lorem.words(3);
const userName = faker.person.fullName();
const email = faker.internet.email();
const phone = faker.phone.number();
```

### Test Hooks

```typescript
test.describe('Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Runs before each test
    await login(page);
  });

  test.afterEach(async ({ page }) => {
    // Runs after each test
    await page.close();
  });

  test('my test', async ({ page }) => {
    // Test code
  });
});
```

### Assertions

```typescript
// Visibility
await expect(element).toBeVisible();
await expect(element).not.toBeVisible();

// Text content
await expect(element).toHaveText('Expected text');
await expect(element).toContainText('partial text');

// Form state
await expect(checkbox).toBeChecked();
await expect(input).toHaveValue('value');

// Custom timeout
await expect(element).toBeVisible({ timeout: 10000 });
```

## Test Suites Overview

### Authentication Tests (`auth.spec.ts`)
- User registration
- Login/logout
- Error handling
- Session persistence

### Tasks Tests (`tasks.spec.ts`)
- Create, edit, delete tasks
- Mark as complete
- Task filtering

### Events Tests (`events.spec.ts`)
- Create, edit, delete events
- Different event types
- Calendar integration

### Family Tree Tests (`family-tree.spec.ts`)
- Add/edit/delete family members
- Create relationships
- Family visualization

### Shopping Tests (`shopping.spec.ts`)
- Add/edit/delete shopping items
- Mark as purchased
- Category filtering

### Meals Tests (`meals.spec.ts`)
- Meal planning
- Recipe management
- Favorites

### Transactions Tests (`transactions.spec.ts`)
- Income/expense tracking
- Budget management
- Analytics charts

### Contacts Tests (`contacts.spec.ts`)
- Contact management
- Category organization
- Link to family members

### Notifications Tests (`notifications.spec.ts`)
- Notification display
- Mark as read
- Notification actions

### Integration Tests (`integration.spec.ts`)
- End-to-end user journeys
- Cross-feature workflows
- Data consistency

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

### GitHub Actions Workflow

Location: `.github/workflows/e2e-tests.yml`

Features:
- Automated test execution
- PostgreSQL service container
- Test report artifacts
- Screenshot/video capture on failure
- 30-day artifact retention

### Viewing CI Results

1. Go to the Actions tab in GitHub
2. Click on the workflow run
3. Download artifacts:
   - `playwright-report` - Full HTML report
   - `test-results` - Raw test results
   - `screenshots` - Failure screenshots
   - `videos` - Failure videos

## Troubleshooting

### Tests Failing Locally

1. **Ensure services are running:**
   ```bash
   docker-compose -f docker-compose.test.yml ps
   ```

2. **Check backend logs:**
   ```bash
   docker-compose -f docker-compose.test.yml logs test-backend
   ```

3. **Reset test database:**
   ```bash
   docker-compose -f docker-compose.test.yml down -v
   docker-compose -f docker-compose.test.yml up -d
   ```

### Debugging Flaky Tests

1. **Run in headed mode:**
   ```bash
   npm run test:e2e:headed
   ```

2. **Add explicit waits:**
   ```typescript
   await page.waitForLoadState('networkidle');
   await page.waitForSelector('[data-testid="element"]');
   ```

3. **Increase timeouts:**
   ```typescript
   test('my test', async ({ page }) => {
     test.setTimeout(60000); // 60 seconds
   });
   ```

### Port Conflicts

If port 5434 or 3002 is already in use:

1. Stop conflicting services
2. Or update ports in `docker-compose.test.yml` and `.env.test`

### Browser Issues

Reinstall browsers:
```bash
npx playwright install --force --with-deps
```

## Best Practices

1. **Use Page Objects** - Keep tests maintainable
2. **Generate Test Data** - Use Faker for realistic data
3. **Avoid Hard-coded Waits** - Use Playwright's auto-waiting
4. **Test User Flows** - Focus on real user scenarios
5. **Keep Tests Independent** - Each test should work in isolation
6. **Clean Up Data** - Use global setup/teardown
7. **Use Descriptive Names** - Make test intent clear
8. **Limit Assertions** - One logical assertion per test
9. **Parallelize When Possible** - Faster test execution
10. **Document Complex Tests** - Add comments for clarity

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Faker.js Documentation](https://fakerjs.dev)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)

## Support

For issues or questions:
1. Check this guide
2. Review Playwright documentation
3. Check test logs and screenshots
4. Open an issue in the repository

