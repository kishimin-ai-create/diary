---
name: refactor-patterns
description: Refactoring pattern library for TypeScript code. Aggregates detailed pattern examples, anti-patterns, and implementation examples used by RefactorAgent.
---

# Refactoring Patterns

## 🎯 Common Refactoring Patterns

### Pattern 1: Extract Validation Logic (No Behavior Change)

```typescript
// BEFORE: Validation mixed with business logic
async execute(input: CreateAppInput): Promise<CreateAppOutput> {
  if (!input.name || input.name.trim() === "") {
    return { success: false, statusCode: 422, error: {...}, data: null };
  }
  if (input.name.length > 100) {
    return { success: false, statusCode: 422, error: {...}, data: null };
  }
  // ...rest of logic
}

// AFTER: Extracted validation (same behavior, clearer code)
private validateName(name: string): { valid: true } | { valid: false; error: CreateAppOutput } {
  if (!name || name.trim() === "") {
    return {
      valid: false,
      error: { success: false, statusCode: 422, error: {...}, data: null }
    };
  }
  if (name.length > 100) {
    return {
      valid: false,
      error: { success: false, statusCode: 422, error: {...}, data: null }
    };
  }
  return { valid: true };
}

async execute(input: CreateAppInput): Promise<CreateAppOutput> {
  const validation = this.validateName(input.name);
  if (!validation.valid) return validation.error;
  // ...rest of logic (unchanged)
}
```

**Why safe**: Return values identical, error codes unchanged, logic flow
preserved.

### Pattern 2: Extract Error Response Factory (Eliminate Duplication)

```typescript
// BEFORE: Error responses repeated throughout
if (!input.name) {
  return {
    success: false,
    statusCode: 422,
    error: { code: "APP_NAME_INVALID", message: "Name required" },
    data: null
  };
}

// AFTER: Centralized error factory
private validationError(code: string, message: string): CreateAppOutput {
  return { success: false, statusCode: 422, error: { code, message }, data: null };
}

// Usage (same behavior, less duplication)
if (!input.name) return this.validationError("APP_NAME_INVALID", "Name required");
```

**Why safe**: Same return values, error codes unchanged, structure identical.

### Pattern 3: Rename for Clarity (Preserves All Behavior)

```typescript
// BEFORE: Unclear naming
const result = await this.repo.findByName(input.name);
if (result) {
  /* handle duplicate */
}

// AFTER: Clearer naming (no behavior change)
const existingApp = await this.appRepository.findByName(input.name);
if (existingApp) {
  /* handle duplicate - logic identical */
}
```

**Why safe**: Same logic, identical behavior, only names changed. Tests still
pass.

### Pattern 4: Guard Clauses (Improved Readability, No Behavior Change)

```typescript
// BEFORE: Nested if statements
if (isValid) {
  if (isUnique) {
    if (isAuthorized) {
      // Do work
    } else {
      return unauthorized();
    }
  } else {
    return duplicate();
  }
} else {
  return invalid();
}

// AFTER: Early returns (same behavior, better clarity)
if (!isValid) return invalid();
if (!isUnique) return duplicate();
if (!isAuthorized) return unauthorized();
// Do work
```

**Why safe**: Control flow identical, return values unchanged, logic meaning
preserved.

### Pattern 5: Consolidate Similar Error Handling

```typescript
// BEFORE: Repeated error handling patterns
try {
  step1();
} catch (error) {
  return { success: false, statusCode: 500, error: {...} };
}

try {
  step2();
} catch (error) {
  return { success: false, statusCode: 500, error: {...} };
}

// AFTER: Consolidated error handling (same behavior)
const executeSteps = async () => {
  await step1();
  await step2();
};

try {
  await executeSteps();
} catch (error) {
  return { success: false, statusCode: 500, error: {...} };
}
```

**Why safe**: Same error path, identical return values, behavior preserved.

## 📋 Specific Refactoring Techniques for Backend (Hono + TypeScript)

### Technique 1: Extract Port/Adapter Responsibilities

```typescript
// Move repository-specific logic into repository class
// Move validation into validator class/function
// Keep orchestration in interactor only
```

### Technique 2: Improve Error Handling in Service Layer

```typescript
// Consolidate try-catch patterns
// Map infrastructure errors to domain errors consistently
// Extract error response building
```

### Technique 3: Organize Usecase Classes

```typescript
// One public method (execute) per interactor
// Private methods for sub-responsibilities
// Clear separation between input validation / business logic / error handling
```

## 📋 Specific Refactoring Techniques for Frontend (React + TypeScript)

### Technique 1: Extract Components (No Behavior Change)

```typescript
// BEFORE: Large component with multiple responsibilities
export function AppCreatePage() {
  // Form input logic
  // Form submission logic
  // Error display logic
  // Loading state logic
}

// AFTER: Extracted components (same behavior, clearer structure)
function AppNameInput({ value, onChange, error }) {
  /* input logic */
}
function ErrorDisplay({ error }) {
  /* error display */
}
function SubmitButton({ loading, onClick }) {
  /* button logic */
}

export function AppCreatePage() {
  // Orchestration only
}
```

### Technique 2: Extract Custom Hooks (No Behavior Change)

```typescript
// BEFORE: Form state in component
function AppCreatePage() {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // ...
}

// AFTER: Extracted hook (same behavior, reusable)
function useAppCreateForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  return { name, setName, error, setError, loading, setLoading };
}

export function AppCreatePage() {
  const form = useAppCreateForm();
  // ...
}
```

### Technique 3: Improve Prop Handling (No Behavior Change)

```typescript
// BEFORE: Magic prop values
<Button onClick={() => handleClick()} disabled={loading} />

// AFTER: Clear intent (same behavior, more readable)
<SubmitButton isLoading={loading} onSubmit={handleSubmit} />
```

## ❌ Anti-Patterns: Things That Look Safe But Aren't

### ❌ Anti-Pattern 1: "Just Optimizing" (Without Clarity Improvement)

```typescript
// WRONG - Performance improvement only, no clarity gain
// Original: straightforward loop
// Refactored: complex reduce() just for performance
// Tests pass but you've changed the code intent for one benefit only
```

**Why risky**: Optimization-only changes can hide behavior differences. Stay
conservative.

### ❌ Anti-Pattern 2: "Better Organization" (Changing Behavior)

```typescript
// WRONG - Looks like organization but changes behavior
async execute(input) {
  // Original: validates then checks duplicates
  await validateInput(input);
  const existing = await findByName(input.name);

  // Refactored: introduces early return (changes behavior order!)
  const existing = await findByName(input.name);  // Now before validation
  await validateInput(input);
}
```

**Why risky**: Changed order of operations can impact behavior (e.g., skipping
database call).

### ❌ Anti-Pattern 3: "Adding Comments for Future Devs"

```typescript
// WRONG - Adding explanations as code changes
// Original clean line
const result = await repo.find(id);

// Refactored with "clarity"
// eslint-disable-next-line some-rule
// TODO: This could be optimized by caching
const result = await repo.find(id); // Get from database
```

**Why risky**: You've added code/comments (side effects). Keep refactoring pure.

### ❌ Anti-Pattern 4: "Fixing Supposed Bugs" While Refactoring

```typescript
// WRONG - Refactoring + bug fix combined
// Original code (tests pass, so it's correct by definition)
if (status === "open") {
  /* do something */
}

// Refactored: "Fix" - but this changes tested behavior!
if (status === "open" || status === "pending") {
  /* do something */
}
```

**Why risky**: Tests define correctness. If tests pass, code is correct. Never
"fix" without new failing tests.

## 🎯 Safety-First Example: CreateAppInteractor Refactoring

**Original Code** (works, tests pass):

```typescript
export class CreateAppInteractor {
  constructor(private appRepository: AppRepository) {}

  async execute(input: CreateAppInput): Promise<CreateAppOutput> {
    try {
      if (!input.name || input.name.trim() === "") {
        return {
          success: false,
          statusCode: 422,
          error: { code: "APP_NAME_INVALID", message: "App name is required" },
          data: null,
        };
      }

      if (input.name.length > 100) {
        return {
          success: false,
          statusCode: 422,
          error: {
            code: "APP_NAME_INVALID",
            message: "App name must not exceed 100 characters",
          },
          data: null,
        };
      }

      const existing = await this.appRepository.findByName(input.name);
      if (existing) {
        return {
          success: false,
          statusCode: 409,
          error: {
            code: "APP_NAME_DUPLICATE",
            message: `App with name "${input.name}" already exists`,
          },
          data: null,
        };
      }

      const createdApp = await this.appRepository.create({ name: input.name });
      return {
        success: true,
        statusCode: 201,
        data: createdApp,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred. Please try again later.",
        },
        data: null,
      };
    }
  }
}
```

**Refactored Code** (cleaner, tests still pass):

```typescript
export class CreateAppInteractor {
  constructor(private appRepository: AppRepository) {}

  async execute(input: CreateAppInput): Promise<CreateAppOutput> {
    try {
      // Validate input
      const validation = this.validateAppName(input.name);
      if (!validation.isValid) {
        return validation.error;
      }

      // Check uniqueness
      const existing = await this.appRepository.findByName(input.name);
      if (existing) {
        return this.nameConflictError(input.name);
      }

      // Create and return
      const createdApp = await this.appRepository.create({ name: input.name });
      return this.successResponse(createdApp);
    } catch (error) {
      return this.serverErrorResponse();
    }
  }

  private validateAppName(
    name: string,
  ): { isValid: true } | { isValid: false; error: CreateAppOutput } {
    if (!name || name.trim() === "") {
      return {
        isValid: false,
        error: this.validationError("App name is required"),
      };
    }

    if (name.length > 100) {
      return {
        isValid: false,
        error: this.validationError("App name must not exceed 100 characters"),
      };
    }

    return { isValid: true };
  }

  private validationError(message: string): CreateAppOutput {
    return {
      success: false,
      statusCode: 422,
      error: { code: "APP_NAME_INVALID", message },
      data: null,
    };
  }

  private nameConflictError(name: string): CreateAppOutput {
    return {
      success: false,
      statusCode: 409,
      error: {
        code: "APP_NAME_DUPLICATE",
        message: `App with name "${name}" already exists`,
      },
      data: null,
    };
  }

  private successResponse(app: App): CreateAppOutput {
    return {
      success: true,
      statusCode: 201,
      data: app,
    };
  }

  private serverErrorResponse(): CreateAppOutput {
    return {
      success: false,
      statusCode: 500,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      data: null,
    };
  }
}
```

**Why This Refactoring is Safe**:

- ✅ All tests pass (same return values, error codes)
- ✅ External behavior identical
- ✅ Validation logic clearer
- ✅ Error handling consolidated
- ✅ Easier to maintain and extend
- ✅ Side effects preserved (repository calls unchanged)
- ✅ No new features added
