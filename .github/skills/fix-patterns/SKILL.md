---
name: fix-patterns
description: Bug fix pattern library. Aggregates typical fix patterns, checklists, and anti-patterns used by FixAgent.
---

# Bug Fix Patterns

## 🎯 Common Fix Patterns

### Pattern 1: Wrong Status Code / Error Code

```typescript
// BEFORE: Returns 500 instead of 409 for duplicate
catch (error) {
  return { success: false, statusCode: 500, error: { code: "SERVER_ERROR" } };
}

// AFTER: Correct status code for the specific error type
catch (error) {
  if (error instanceof DuplicateError) {
    return { success: false, statusCode: 409, error: { code: "CONFLICT" } };
  }
  return { success: false, statusCode: 500, error: { code: "SERVER_ERROR" } };
}
```

**Why correct**: Spec requires 409 for duplicates; 500 was a misrouted catch.

### Pattern 2: Missing Null Guard

```typescript
// BEFORE: Crashes when repository returns null
const app = await this.appRepository.findById(id);
return { success: true, data: app.toDto() }; // TypeError if null

// AFTER: Correct null handling
const app = await this.appRepository.findById(id);
if (!app) {
  return { success: false, statusCode: 404, error: { code: "NOT_FOUND" } };
}
return { success: true, data: app.toDto() };
```

**Why correct**: Missing guard caused unhandled runtime error; spec requires 404.

### Pattern 3: Wrong Validation Logic

```typescript
// BEFORE: Allows empty string after trim
if (input.name === "") {
  return validationError("Name is required");
}

// AFTER: Correctly rejects whitespace-only input
if (!input.name || input.name.trim() === "") {
  return validationError("Name is required");
}
```

**Why correct**: Spec states "whitespace trimming" — empty-after-trim is invalid.

### Pattern 4: Missing JSDoc (Rule Violation Fix)

```typescript
// BEFORE: Exported function without JSDoc (violates typescript.instructions.md)
export function createAppController(usecase: AppUsecase): AppController {
  // ...
}

// AFTER: JSDoc added
/**
 * Creates an AppController bound to the given use case.
 */
export function createAppController(usecase: AppUsecase): AppController {
  // ...
}
```

**Why correct**: Rule requires JSDoc on all exported functions.

### Pattern 5: Incorrect Import Path / Missing Export

```typescript
// BEFORE: Import path resolves to wrong module
import { AppError } from '../models/errors';

// AFTER: Correct path
import { AppError } from '../domain/app-error';
```

**Why correct**: File was moved; import was not updated.

### Pattern 6: Runtime Boundary Bug Hidden Behind HTTP 200

```text
Symptom: API request returns 200, but the UI shows empty data or an error.
Check:
1. Call the backend endpoint directly.
2. Call the frontend proxy endpoint.
3. Parse both response bodies as JSON.
4. Open the browser UI and verify the user-visible state.
```

**Why correct**: A proxy, CDN, or runtime can preserve the status code while
truncating, re-encoding, or misrouting the body. The fix is not proven until the
body parses and the UI renders the expected state.

### Pattern 7: Self-Referential Frontend Proxy Configuration

```text
Symptom: Browser network panel shows frontend-origin /api requests.
Correct interpretation: This is normal for a Next.js route proxy.
Actual check: Verify whether the server-side backend target also points to the
frontend origin. That is the bug.
```

**Why correct**: Diagnosing the browser-visible origin alone confuses a normal
BFF/proxy topology with a configuration loop.

### Pattern 8: Timestamp Display Drift

```typescript
new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});
```

**Why correct**: API/database timestamps are often UTC. If the UI must match
those values, implicit browser-local timezone conversion must be removed and
covered by a rendered-text test.

### Pattern 9: Missing Auth Exit Path

```text
Symptom: Login stores a token, but there is no visible logout.
Fix direction: Connect the existing token clearing function to navigation and
test that storage is cleared and the visible navigation changes.
```

**Why correct**: Authentication is a lifecycle. Verifying only login leaves users
stuck in an authenticated state until they manually clear storage.

### Pattern 10: Missing List Pagination State

```text
Symptom: A list renders records but the user cannot move to later pages, or the
request always uses page=1 after interactions.
Fix direction: Keep page state at the page/container boundary, pass page/pageSize/
totalCount to the list component, and reset page to 1 when filters change.
```

**Why correct**: Pagination is part of the query contract. A list with totalCount
but no page transitions silently hides records beyond the first page.

### Pattern 11: Scoped Loading Used for Full-Page Loading

```text
Symptom: Initial page loading shows a small inline message or spinner even though
the UI spec requires a full-page branded loading state.
Fix direction: Check the UI specification first. For initial page loads, render a
role="status" full-page overlay with the service logo centered. For refetches
inside an already-rendered page, keep the loading state scoped.
```

**Why correct**: Initial loading and localized refetches have different UX
requirements. Treating them the same breaks the specification and makes loading
look unfinished.

### Pattern 12: Locale Drift in Loading and Browser Chrome

```text
Symptom: Visible page copy switches locale, but loading text, logo alt text, or
the browser tab title remains in the default language.
Fix direction: Remove direct imports of default-locale messages from render
paths. Render loading states through the same i18n provider as normal content,
and verify document.title changes with the selected service name.
```

**Why correct**: Loading and browser chrome are user-visible UI. If they bypass
the active locale, the app appears only partially internationalized.

## 🔍 Pre-Fix Checklist

Before fixing:

- [ ] Root cause identified (not just the symptom)
- [ ] Specification or rule confirms what the correct behavior should be
- [ ] A failing test that reproduces the bug has been written
- [ ] The failing test has been run and confirmed to fail (🔴 RED)
- [ ] Understand which tests are failing and why
- [ ] Identify the minimal change required
- [ ] For proxy/deployment bugs, direct backend output, frontend proxy output,
      JSON parsing, and visible UI state have all been compared
- [ ] For frontend `/api` domain complaints, the server-side proxy target has
      been checked before treating the browser-visible origin as wrong
- [ ] For timestamp bugs, API/database values and rendered text have been
      compared with an explicit timezone expectation
- [ ] For auth bugs, both token creation and token clearing paths have been
      checked
- [ ] For list bugs, page/pageSize/totalCount and active filters have been traced
      from UI state to the API query parameters
- [ ] For loading UI bugs, the relevant UI specification has been checked to
      distinguish full-page initial loading from scoped refetch loading
- [ ] For i18n UI bugs, loading text, image alt text, and browser tab title have
      been checked in every supported locale touched by the change
- [ ] Confirm no protected paths are involved
- [ ] All pre-existing tests currently pass (except those directly related to the defect)

## 🔍 Post-Fix Checklist

After fixing:

- [ ] The newly written test now passes (🟢 GREEN confirmed)
- [ ] Defect is resolved (symptom no longer manifests)
- [ ] All tests pass (no regressions introduced)
- [ ] TypeScript compiles without errors
- [ ] Lint passes without errors
- [ ] Change is minimal (no unrelated code modified)
- [ ] No new features or behavior added
- [ ] Refactoring (if any) is scoped only to code touched by the fix
- [ ] Verified and committed (test + fix in one commit)

## ❌ Anti-Patterns: Things That Look Like Fixes But Aren't

### ❌ Anti-Pattern 1: "Fix + Cleanup" in One Commit

```typescript
// WRONG - Bug fix bundled with unrelated rename
// Fix: corrected null guard
// Also renamed: appRepo → appRepository (unrelated)
```

**Why risky**: Two changes in one commit make it impossible to revert only the
bug fix. Keep fixes atomic.

### ❌ Anti-Pattern 2: Rewriting Instead of Fixing

```typescript
// WRONG - Complete rewrite to fix one validation bug
// Original: 80-line function, one validation condition wrong
// "Fixed": entire function rewritten from scratch

// RIGHT - Targeted fix
// Original: 80-line function
// Fixed: changed 1 condition on line 12
```

**Why risky**: Rewrites introduce new bugs in code that was previously correct.

### ❌ Anti-Pattern 3: Fixing Without Understanding Root Cause

```typescript
// WRONG - Trial-and-error fix
// Test fails with "Cannot read property 'id' of undefined"
// "Fix": added ?. everywhere (nullish chaining spray)
app?.id ?? '' // was app.id
user?.name ?? '' // was user.name (user is always defined)
```

**Why risky**: Masking errors with optional chaining hides real bugs and can
change behavior in unexpected ways.

### ❌ Anti-Pattern 4: Over-fixing (Fixing More Than Reported)

```typescript
// WRONG - User asked to fix error code; agent also "fixed" error messages,
// added new validation, restructured error handling, etc.
```

**Why risky**: Changes beyond the stated scope are untested regressions waiting
to happen.
