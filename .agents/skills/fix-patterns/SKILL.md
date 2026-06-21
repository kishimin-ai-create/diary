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

## 🔍 Pre-Fix Checklist

Before fixing:

- [ ] Root cause identified (not just the symptom)
- [ ] Specification or rule confirms what the correct behavior should be
- [ ] A failing test that reproduces the bug has been written
- [ ] The failing test has been run and confirmed to fail (🔴 RED)
- [ ] Understand which tests are failing and why
- [ ] Identify the minimal change required
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
