# Backend Rules

## Directory Structure (DDD + Clean Architecture with Controller/Service Style)

```text
src/
├── models/                # Domain Model (Entities / Value Objects)
├── services/              # Application Service (Usecase / Business Logic)
├── repositories/           # Repository Interfaces (Domain) & Implementations
├── controllers/           # Entry Point (HTTP Layer)
└── infrastructures/       # External Systems (DB, APIs, Framework)
````


## Layer Descriptions

| Layer              | Description                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| **Model**          | Domain layer. Defines entities and business rules. No dependencies on other layers.             |
| **Service**        | Application layer. Executes business logic and orchestrates use cases.                          |
| **Repository**     | Handles data persistence. Interfaces belong to Model, implementations belong to Infrastructure. |
| **Controller**     | Entry point. Handles HTTP requests/responses and calls Services.                                |
| **Infrastructure** | External concerns such as DB, frameworks, and APIs.                                             |


## Strict Rules to Follow

### Model Layer

* Must not depend on any other layer
* No frameworks, no database access, no HTTP

### Service Layer

* Contains business logic and usecase orchestration
* Must not include infrastructure details (DB, HTTP, etc.)

### Repository Layer

* Interfaces belong to the Model layer
* Implementations belong to the Infrastructure layer
* Must not leak infrastructure-specific errors

### Controller Layer

* Must be thin
* Only handles request/response mapping
* Calls Service layer only

### Infrastructure Layer

* Handles all external systems (DB, APIs, frameworks)
* Must not contain business logic


## Dependency Rule

* Dependencies must always point inward (toward Model)

```text
Controller → Service → Model
           ↓
      Repository (interface)
           ↓
    Infrastructure (implementation)
```

* Outer layers must not be referenced from inner layers


## Error Handling

* Do not expose raw infrastructure errors outside Infrastructure layer
* Map errors to domain-specific types (e.g., AppError, RepoError)


## Command Execution Rules

* Use the **bash shell**
* Do not use PowerShell (pwsh)
* Run commands in the current working directory unless specified
* When working on backend, execute commands inside the `backend` directory

### Commands

```bash
npm run lint
npm run typecheck
npm run test
```


## Implementation Steps (Thinking Process)

1. Model: Define domain models and business rules
2. Repository: Define interfaces (ports)
3. Service: Implement usecases using repositories
4. Infrastructure: Implement repository details (DB, API)
5. Controller: Handle HTTP and call services
6. Test: Test from inside out (Model → Service → Infrastructure → Controller)


## Testing Strategy (Summary)

### Principles

* Understand the system before testing
* Define quality based on user value
* Prioritize based on risk (impact × probability)

### Testing Approach

* Combine automated testing with exploratory testing
* Use "Arrange → Act → Assert" cycle

### Test Structure

- Place unit tests next to the source code
- Use `.test.ts` suffix

- Integration tests should be placed under `tests/integrations/`
  - HTTP-level integration tests (tests that go through the Hono app) belong in `tests/integrations/infrastructure/`
  - Each resource should have its own file (e.g., `app.test.ts`, `todo.test.ts`, `index.test.ts`)
  - Shared test utilities (HTTP helper, factory functions, constants) should be in `tests/integrations/helpers.ts`

### Test Types

- Unit tests (Small): no external dependencies
- Integration tests (Medium): may use database or filesystem
- E2E tests (Large): minimal usage only

### Strategy

* Improve testability continuously
* Keep test plans simple and maintainable

