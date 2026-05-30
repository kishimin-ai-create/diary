---
name: engineering-principles
description: Core engineering and design principles to apply when writing, reviewing, or refactoring code.
---

# Engineering Principles

## Design Principles

- Code as design.
- Code will be changed.
- KISS (Keep It Simple, Stupid.) — prefer **Simple** (low complexity) over **Easy** (convenient but entangled); a powerful tool that is hard to understand is a liability
- DRY (Don't Repeat Yourself.)
- YAGNI (You Aren't Going to Need It.)
- PIE (Program Intently and Expressively.)
- SLAP (Single Level of Abstraction Principle.)
- OCP (Open-Closed Principle.)
- **SRP (Single Responsibility Principle)** — each class/module should have only one reason to change; a `UserManager` that handles validation, DB access, email, and logging should be split into `UserValidator`, `UserRepository`, `EmailService`, and an orchestrating service; changes to email format affect only `EmailService` ([SOLID — lawsofsoftwareengineering.com](https://lawsofsoftwareengineering.com/laws/solid-principles/))
- **DI (Dependency Injection / Dependency Inversion)** — depend on abstractions, not concretions; inject dependencies through constructor parameters or interfaces rather than instantiating them directly inside a class; enables swapping test doubles without changing production code ([SOLID — lawsofsoftwareengineering.com](https://lawsofsoftwareengineering.com/laws/solid-principles/))
- Naming is important.

## Quality Attributes

- Changeability
- Interoperability
- Efficiency
- Reliability
- Testability
- Reusability

## Code Structure Principles

- Simplicity Principle
- Isomorphism Principle
- Symmetry Principle
- Hierarchy Principle
- Linearity Principle
- Clarity Principle
- Safety Principle
