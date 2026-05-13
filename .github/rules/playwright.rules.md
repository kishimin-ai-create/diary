# Playwright E2E Test Rules

## Test Size

Playwright E2E tests are classified as **Medium** tests.

- File naming: `e2e/**/*.medium.test.ts`
- Run on: PR merge CI (`ci-pr.yml`) and nightly CI (`ci-nightly.yml`)
- NOT run on: push CI (`ci.yml`)

---

## Mandatory Test Coverage

Every feature branch **must** include passing Playwright tests for the following scenarios. These are non-negotiable and must not be removed.

### 1. Authentication — Sign Up Happy Path

- Navigate to the sign-up page
- Enter a valid email and password
- Submit the form
- Assert the user is redirected to the app list page (or equivalent authenticated screen)
- Assert no error message is displayed

### 2. Authentication — Sign In Happy Path

- Navigate to the sign-in (login) page
- Enter valid credentials (an existing user)
- Submit the form
- Assert the user is redirected to the app list page
- Assert no error message is displayed

### 3. CRUD — Happy Path

Cover the full create → read → update → delete lifecycle for the primary resource (Todo):

| Step   | Action                                      | Assertion                                       |
| ------ | ------------------------------------------- | ----------------------------------------------- |
| Create | Fill in the todo form and submit            | New todo appears in the list                    |
| Read   | Navigate to the detail page of the new todo | Todo title and details are visible              |
| Update | Edit the todo title/status and save         | Updated values are reflected without page reload |
| Delete | Delete the todo                             | Todo is removed from the list                   |

---

## Coding Guidelines

### Test structure

- Use **AAA (Arrange / Act / Assert)** structure inside each test.
- Test names must express: **what** is being tested, **under what condition**, and **what the expected outcome is**.

```ts
// Good
test('when valid credentials are submitted on the sign-in page, then the user is redirected to the app list', async ({ page }) => { ... })

// Bad
test('login works', async ({ page }) => { ... })
```

### Page helpers

- Extract repetitive UI interactions (navigate, fill form, click button) into helper functions or Page Object Models to reduce duplication.
- Keep helpers close to the test files (`e2e/helpers/` or co-located).

### Assertions

- Prefer `expect(locator).toBeVisible()` and `expect(locator).toHaveText()` over `page.waitForSelector`.
- Always assert on **user-visible outcomes**, not internal state or DOM structure.

### Selectors

- Prefer `getByRole`, `getByLabel`, `getByPlaceholder`, and `getByText` over `locator('css')` or `locator('[data-testid]')`.
- Use `data-testid` only as a last resort.

---

## Environment

- Tests run against the **local dev server** in CI (Vite + backend on localhost).
- The Playwright config must set `baseURL` from an environment variable so it can point to staging/production when needed.
- Never hard-code `localhost:5173` inside test files.
