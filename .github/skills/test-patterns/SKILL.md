---
name: test-patterns
description: Test design pattern library. Aggregates detailed Vitest/RTL patterns, mock examples, and full test examples used by RedAgent.
---

# Test Patterns

## When to Write Tests

- Write tests when you are **afraid of making a change** (predictive changeability: "will this break something?")
- Write tests when you want to **learn or optimize the structure** through TDD cycles
- Do not write tests just for coverage; if a test does not reduce fear or improve design, it adds no value
- TDD refactoring is the continuous process of tuning the balance between open extension and closed modification (OCP)

### Vitest Structure

```typescript
describe("Feature/Component Name", () => {
  describe("Scenario or Context", () => {
    it("should [expected behavior] when [condition]", () => {
      // Arrange - Setup
      // Act - Execute
      // Assert - Verify
    });
  });
});
```

### Testing Library (React)

```typescript
import { render, screen } from "@testing-library/react";
import { fireEvent, waitFor } from "@testing-library/react";

// Use getByRole first, then getByLabelText, then getByTestId as last resort
it("should display error message when form submission fails", async () => {
  render(<AppForm />);

  fireEvent.click(screen.getByRole("button", { name: /create app/i }));

  await waitFor(() => {
    expect(screen.getByRole("alert")).toHaveTextContent(/name is required/i);
  });
});
```

### Mock Pattern

```typescript
// Mock repository interface
const mockAppRepository: AppRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};
```

## 🎨 Test Design Techniques

### 1. Normal Cases (Happy Path)

Test the main success scenario completely.

```typescript
describe("Happy Path - Valid Input", () => {
  it("creates app with valid name and returns 201 response", async () => {
    // Simple success case
  });
});
```

### 2. Error Cases (Validation & System Errors)

Test every validation rule and error scenario from spec.

```typescript
describe("Error Cases - Validation Failures", () => {
  it("returns 422 when app name is empty", () => {});
  it("returns 422 when app name exceeds 100 characters", () => {});
  it("returns 409 when app name already exists", () => {});
  it("returns 500 when database fails", () => {});
});
```

### 3. Boundary Values

Test minimum, maximum, and edge values.

```typescript
describe("Boundary Cases", () => {
  it("creates app with 1-character name (minimum)", () => {});
  it("creates app with 100-character name (maximum)", () => {});
  it("returns error with 101-character name (over max)", () => {});
});
```

### 4. Equivalence Partitioning

Group similar inputs and test one from each partition.

```typescript
// Partitions: valid names, empty strings, null, undefined, numeric, special chars
describe("Equivalence Partitions - Name Input", () => {
  it("accepts alphanumeric names", () => {});
  it("accepts names with spaces", () => {});
  it("rejects null or undefined", () => {});
  it("rejects special characters", () => {});
});
```

### 5. Decision Tables

For features with multiple input combinations, create decision table tests.

```typescript
// Decision: (isAdmin, hasEditPermission, resourceOwned) -> (canEdit)
describe("Decision Table - Edit Permissions", () => {
  it("[Admin=T, Permission=T, Owned=T] -> Can Edit", () => {});
  it("[Admin=T, Permission=F, Owned=T] -> Can Edit", () => {});
  it("[Admin=F, Permission=T, Owned=T] -> Can Edit", () => {});
  it("[Admin=F, Permission=F, Owned=T] -> Cannot Edit", () => {});
});
```

## 📝 Example: CreateApp Usecase Tests

**Input Specification:**

```
POST /api/v1/apps
Request: { name: string (1-100 chars, unique) }
Response 201: { data: { id: uuid, name: string, createdAt: ISO8601, updatedAt: ISO8601 } }
Error 422: validation failure
Error 409: name already exists
Error 500: server error
```

**Output Test File:**

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  CreateAppInteractor,
  CreateAppInput,
  CreateAppOutput,
} from "../usecase/CreateAppInteractor";
import { AppRepository } from "../../domain/repositories/AppRepository";

describe("CreateApp Usecase", () => {
  let mockRepository: AppRepository;
  let interactor: CreateAppInteractor;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findByName: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    interactor = new CreateAppInteractor(mockRepository);
  });

  describe("Happy Path - Valid Input", () => {
    it("should create app and return 201 with app data when name is valid and unique", async () => {
      // Arrange
      const input: CreateAppInput = { name: "My Awesome App" };
      mockRepository.findByName = vi.fn().mockResolvedValue(null);
      mockRepository.create = vi.fn().mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "My Awesome App",
        createdAt: "2026-04-12T10:00:00Z",
        updatedAt: "2026-04-12T10:00:00Z",
        deletedAt: null,
      });

      // Act
      const result: CreateAppOutput = await interactor.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
      expect(result.data.name).toBe("My Awesome App");
      expect(result.statusCode).toBe(201);
    });
  });

  describe("Validation Errors - Invalid Name Input", () => {
    it("should return 422 error when name is empty string", async () => {
      // Arrange
      const input: CreateAppInput = { name: "" };

      // Act
      const result: CreateAppOutput = await interactor.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(422);
      expect(result.error.message).toContain("name is required");
    });

    it("should return 422 error when name exceeds 100 characters", async () => {
      // Arrange
      const longName = "a".repeat(101);
      const input: CreateAppInput = { name: longName };

      // Act
      const result: CreateAppOutput = await interactor.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(422);
      expect(result.error.message).toContain(
        "name must not exceed 100 characters",
      );
    });
  });

  describe("Business Rule Errors - Duplicate Name", () => {
    it("should return 409 error when app name already exists", async () => {
      // Arrange
      const input: CreateAppInput = { name: "Existing App" };
      mockRepository.findByName = vi.fn().mockResolvedValue({
        id: "existing-id",
        name: "Existing App",
        createdAt: "2026-04-11T10:00:00Z",
        updatedAt: "2026-04-11T10:00:00Z",
        deletedAt: null,
      });

      // Act
      const result: CreateAppOutput = await interactor.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(409);
      expect(result.error.message).toContain("app name already exists");
    });
  });

  describe("Boundary Cases - Name Length", () => {
    it("should create app successfully with 1-character name (minimum)", async () => {
      // Arrange
      const input: CreateAppInput = { name: "A" };
      mockRepository.findByName = vi.fn().mockResolvedValue(null);
      mockRepository.create = vi.fn().mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "A",
        createdAt: "2026-04-12T10:00:00Z",
        updatedAt: "2026-04-12T10:00:00Z",
        deletedAt: null,
      });

      // Act
      const result: CreateAppOutput = await interactor.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(201);
    });

    it("should create app successfully with 100-character name (maximum)", async () => {
      // Arrange
      const maxName = "a".repeat(100);
      const input: CreateAppInput = { name: maxName };
      mockRepository.findByName = vi.fn().mockResolvedValue(null);
      mockRepository.create = vi.fn().mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: maxName,
        createdAt: "2026-04-12T10:00:00Z",
        updatedAt: "2026-04-12T10:00:00Z",
        deletedAt: null,
      });

      // Act
      const result: CreateAppOutput = await interactor.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(201);
    });
  });

  describe("Infrastructure Errors - System Failures", () => {
    it("should return 500 error when database query fails", async () => {
      // Arrange
      const input: CreateAppInput = { name: "Test App" };
      mockRepository.findByName = vi
        .fn()
        .mockRejectedValue(new Error("Database connection failed"));

      // Act
      const result: CreateAppOutput = await interactor.execute(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error.message).toContain("Internal server error");
    });
  });
});
```

When you run these tests: `npm test -- CreateApp.test.ts`, **every test must
FAIL** because `CreateAppInteractor` doesn't exist yet.
