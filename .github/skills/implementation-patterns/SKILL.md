---
name: implementation-patterns
description: Implementation pattern library for deriving minimal implementations from tests. Aggregates detailed implementation examples and anti-patterns used by GreenAgent.
---

# Implementation Patterns

## 📋 Common Implementation Patterns

### Pattern 1: Validation First (Then Success/Error)

```typescript
async execute(input: InputType): Promise<OutputType> {
  // Validation errors (422)
  if (!input.name || input.name.trim() === "") {
    return {
      success: false,
      statusCode: 422,
      error: { code: "INVALID_INPUT", message: "Field required" },
      data: null,
    };
  }

  if (input.name.length > 100) {
    return {
      success: false,
      statusCode: 422,
      error: { code: "INVALID_INPUT", message: "Too long" },
      data: null,
    };
  }

  // Business rules (409)
  const existing = await this.repository.findByName(input.name);
  if (existing) {
    return {
      success: false,
      statusCode: 409,
      error: { code: "DUPLICATE", message: "Already exists" },
      data: null,
    };
  }

  // Success path (201)
  try {
    const created = await this.repository.create(input);
    return {
      success: true,
      statusCode: 201,
      data: created,
    };
  } catch (error) {
    // Infrastructure errors (500)
    return {
      success: false,
      statusCode: 500,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Internal server error" },
      data: null,
    };
  }
}
```

### Pattern 2: Error Throwing (vs Returning)

If tests expect exceptions:

```typescript
async execute(input: InputType): Promise<OutputType> {
  if (!input.isValid) {
    throw new ValidationError("Invalid input");
  }
  return this.repository.create(input);
}
```

### Pattern 3: React Component (Happy Path First)

```typescript
export function AppCreatePage() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.createApp({ name });
      // Success logic (from test assertions)
    } catch (err) {
      // Error logic (from test assertions)
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      {error && <div role="alert">{error}</div>}
      <button type="submit">Create</button>
    </form>
  );
}
```

## 🚀 Example: CreateApp Interactor

**Given Failing Tests** (like CreateApp.test.ts):

- Happy path: creates app with valid name → 201, returns app data
- Validation: empty name → 422, returns error with code "APP_NAME_INVALID"
- Duplicate: name exists → 409, returns error with code "APP_NAME_DUPLICATE"
- Boundary: 1-char and 100-char names should pass
- Infrastructure: repository errors → 500, generic error message

**Implementation**:

```typescript
import {
  App,
  AppNameValidationError,
  AppNameDuplicateError,
  AppNotFoundError,
} from "../../domain/entities/App";
import { AppRepository } from "../../domain/repositories/AppRepository";

export interface CreateAppInput {
  name: string;
}

export interface CreateAppOutput {
  success: boolean;
  statusCode: number;
  data: App | null;
  error?: { code: string; message: string };
}

export class CreateAppInteractor {
  constructor(private appRepository: AppRepository) {}

  async execute(input: CreateAppInput): Promise<CreateAppOutput> {
    try {
      // Validation: empty/whitespace name
      if (!input.name || input.name.trim() === "") {
        return {
          success: false,
          statusCode: 422,
          error: { code: "APP_NAME_INVALID", message: "App name is required" },
          data: null,
        };
      }

      // Validation: too long
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

      // Business rule: duplicate name check
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

      // Success: create app
      const createdApp = await this.appRepository.create({ name: input.name });
      return {
        success: true,
        statusCode: 201,
        data: createdApp,
      };
    } catch (error) {
      // Infrastructure error
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

**Why This Implementation**:

- ✅ Validates empty/whitespace (passes empty string test)
- ✅ Validates length (passes 101-char test)
- ✅ Checks duplicate uniqueness (passes duplicate test)
- ✅ Returns exact response structure (matches assertions)
- ✅ Uses domain error codes (from domain entities)
- ✅ Catches and handles infrastructure errors (500 status)
- ✅ Nothing extra (no logging, no util functions, no comments)
- ✅ All tests pass

## 🎨 Frontend Component Example

**Given Tests** (like AppCreatePage.test.tsx):

- Renders form with name input, Create button
- Shows error message on validation failure
- Submits to API on valid input
- Shows success toast after creation
- Redirects to detail page

**Implementation**:

```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

export function AppCreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await api.createApp({ name });
      if (result.success) {
        // Show success (test expects toast)
        navigate(`/apps/${result.data.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create app");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">App Name *</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </div>
      {error && <div role="alert">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create"}
      </button>
      <button type="button" onClick={() => navigate("/apps")}>
        Cancel
      </button>
    </form>
  );
}
```

## 🚫 What NOT To Do

### ❌ Anti-Pattern 1: Over-Making Features Beyond Tests

```typescript
// WRONG - Adds pagination not tested
async findAll(): Promise<{ items: App[]; total: number; page: number }> {
  const apps = await this.repository.findAll();
  return {
    items: apps,
    total: apps.length,
    page: 1,
  };
}

// RIGHT - Return exactly what test expects
async findAll(): Promise<App[]> {
  return await this.repository.findAll();
}
```

### ❌ Anti-Pattern 2: Refactoring Code During Green Phase

```typescript
// WRONG - Extracting helper function before it's tested
private isValidAppName(name: string): boolean {
  return name.length > 0 && name.length <= 100;
}

// RIGHT - Keep validation inline
if (input.name.length > 100) {
  return { success: false, statusCode: 422, ... };
}
```

### ❌ Anti-Pattern 3: Hardcoding Rejection (When It Doesn't Pass Tests)

```typescript
// WRONG - Hardcoding when tests expect real logic
async findByName(name: string): Promise<App | null> {
  return null; // Always returns null - fails duplicate check test
}

// RIGHT - Implement actual logic (even if simple)
async findByName(name: string): Promise<App | null> {
  const existing = this.apps.find(a => a.name === name && !a.deletedAt);
  return existing || null;
}
```

### ❌ Anti-Pattern 4: Modifying Tests to Pass

```typescript
// WRONG - Modifying test expectations
// expect(result.statusCode).toBe(422);  // Original
// expect(result.statusCode).toBe(400);  // Wrong - changed test!

// RIGHT - Change implementation to match test
if (invalidInput) {
  return { statusCode: 422, ... };  // Match what test expects
}
```
