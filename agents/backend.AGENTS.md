# backend

I'm using `Hono` and `Typescript`. Within this directory, you should make
decisions as a Typescript expert.

### Directory Structure for Clean Architecture

```text
src/
├── domain/                # Domain Layer
│   ├── entities/          # Business Entities
│   └── repositories/      # Repository Interfaces
├── usecase/               # Usecase Layer
│   ├── interactors/       # Business Logic Implementation
│   ├── input_ports/       # Input Boundaries
│   └── output_ports/      # Output Boundaries
├── interface/             # Interface Adapters Layer
│   ├── controllers/       # Controllers
│   ├── presenters/        # Presenters
│   └── gateways/          # Repository Implementations
└── infrastructure/        # Infrastructure Layer
    ├── database/          # Database Configurations
    ├── external_api/      # External API Clients
    └── framework/         # Framework Specific Settings
```

#### Layer Descriptions

| Layer              | Description                                                                                                                                                                             |
| :----------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Domain**         | The innermost circle. Defines business rules and entities. It is the core of the application and has no dependencies on other layers.                                                   |
| **Usecase**        | Contains application-specific business logic. It orchestrates the flow of data to and from the entities and directs those entities to use their critical business rules.                |
| **Interface**      | A set of adapters that convert data from the format most convenient for the use cases and entities to the format most convenient for external agencies such as the Database or the Web. |
| **Infrastructure** | The outermost layer. It is where all the details go: the framework, the database, the UI, etc. It communicates with the Interface layer to receive and send data.                       |

### Strict Rules to Follow

- **Domain Layer:** Never import frameworks or infrastructure-specific SDKs
  (e.g., SQLx, Axum). It must contain only business entities, rules, and Ports
  (interfaces/traits).
- **Usecase Layer:** Dedicated to orchestration and transaction boundary
  management. Implementation of SQL or HTTP calls is strictly prohibited; it
  must interact with the outside world only through Ports.
- **Handler Layer:** Keep it "thin." Its responsibility is limited to
  parsing/validating input, calling the Usecase, and mapping internal errors to
  HTTP responses or DTOs.
- **Error Handling:** Never leak raw infrastructure errors (like DB errors)
  outside the infrastructure layer. They must be mapped into domain-specific
  error types (e.g., `AppError` or `RepoError`).

### Implementation Steps (Thinking Process)

To avoid getting lost during development, the following implementation order is
recommended:

1.  **Domain:** Implement the core models and business logic first.
2.  **Port:** Define the interfaces (Traits) required for I/O.
3.  **Usecase:** Define the flow of the process (orchestration) using the Ports.
4.  **Adapter:** Implement the infrastructure details (e.g., DB queries,
    external API clients).
5.  **Registry:** Wire everything together using Dependency Injection.
6.  **Handler:** Create the entry point, such as an HTTP endpoint.
7.  **Test:** Conduct tests from the inside out (Domain → Usecase →
    Infrastructure → Interface).

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
