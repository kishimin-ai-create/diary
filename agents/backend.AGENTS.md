# backend

I'm using `Hono` and `Typescript`. Within this directory, you should make
decisions as a Typescript expert.

## Directory Structure (DDD + Clean Architecture with Controller/Service Style)

```text
src/
├── models/                # Domain Model (Entities / Value Objects)
├── services/              # Application Service (Usecase / Business Logic)
├── repositories/           # Repository Interfaces (Domain) & Implementations
├── controllers/           # Entry Point (HTTP Layer)
└── infrastructures/       # External Systems (DB, APIs, Framework)
```

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

- Must not depend on any other layer
- No frameworks, no database access, no HTTP

### Service Layer

- Contains business logic and usecase orchestration
- Must not include infrastructure details (DB, HTTP, etc.)

### Repository Layer

- Interfaces belong to the Model layer
- Implementations belong to the Infrastructure layer
- Must not leak infrastructure-specific errors

### Controller Layer

- Must be thin
- Only handles request/response mapping
- Calls Service layer only

### Infrastructure Layer

- Handles all external systems (DB, APIs, frameworks)
- Must not contain business logic

## Dependency Rule

- Dependencies must always point inward (toward Model)

```text
Controller → Service → Model
           ↓
      Repository (interface)
           ↓
    Infrastructure (implementation)
```

- Outer layers must not be referenced from inner layers

## Error Handling

- Do not expose raw infrastructure errors outside Infrastructure layer
- Map errors to domain-specific types (e.g., AppError, RepoError)

### Article Summary: Testing Web APIs (from Money Forward Developers Blog)

This article summarizes the key takeaways from the book _Testing Web APIs_ by
Mark Winteringham. It emphasizes that API testing is not just a technical
collection of scripts, but a **"comprehensive approach to understanding the
product and improving quality strategically."**

---

### Key Points

**1. Importance of Product Understanding (Chapter 2)**

- Before starting any tests, you must deeply understand how the system works by
  watching demos, reading documentation, analyzing source code, and observing
  actual traffic using DevTools.
- This helps identify risks and bottlenecks at the network communication level.

**2. Defining Quality and Risk (Chapter 3)**

- Consider what "value" means to the users and prioritize testing accordingly.
- Create a risk matrix based on "impact" and "probability" to clarify which
  risks must be addressed first.

**3. Utilizing Exploratory Testing (Chapter 5)**

- Incorporate exploratory testing into your API strategy—moving beyond
  predefined checks with a "What if?" mindset.
- Follow a cycle of "Explore → Learn → Experiment" to discover unknown issues.

**4. Valuable Test Automation (Chapter 6)**

- The goal of automation should be to enhance the value of regression testing.
  To maintain high code quality, the author recommends organizing test code into
  three layers:
  - **Tests:** Definition of test scenarios.
  - **Requests:** Execution of API requests.
  - **Payloads:** Definition of data sent and received.

**5. Testability and Strategy (Chapter 7)**

- Assess and improve "Testability" by considering the team's skill set and
  existing processes through the "9 Ps" (People, Pipeline, Process, etc.).
- Create a simple, one-page test plan that is easy to understand and keep
  updated.
