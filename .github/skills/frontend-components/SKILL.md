---
name: frontend-components
description: "Component design, naming, library strategy, and maintainable UI composition patterns."
---

# Frontend Components

Use this skill when designing shared UI, domain-specific UI, component naming, or folder structure.

## Component Categories

| Category | Purpose | Dependency on business logic | Typical owner | Examples |
|---|---|---|---|---|
| **Common components** | Shared UI foundation across the app | Low | Platform / architecture team | Button, Input, Dialog, Icon, Navigation |
| **Business components** | Domain-specific UI with business rules and data | High | Feature team | Product list, Cart summary, User profile widget |

## Working Rules

- Keep **display logic** and **business logic** separate whenever possible.
- Promote reusable business UI into shared patterns only when reuse is real.
- Prefer small, focused components over large multi-purpose components.

## Common Component Strategy

| Strategy | Use when | Advantages | Risks |
|---|---|---|---|
| **Existing component library** | Time-to-market matters most | Fast delivery, built-in a11y, docs, community support | Customization limits, bundle growth, vendor lock-in |
| **Hybrid approach** | You need more control without building everything | Good balance of speed and control | Still requires library learning and careful integration |
| **Full scratch** | UI/UX is unique and team expertise is strong | Full control, optimized output, strong brand fit | High build cost, ongoing maintenance burden |

### Recommendation Order

1. Start by evaluating an **existing component library**.
2. Move to a **hybrid approach** if styling or behavior needs exceed the library.
3. Use **full scratch** only when requirements clearly justify it.

## UI State Modeling

### Discriminated Union

Use discriminated union types to represent UI states explicitly.

```typescript
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: Data }
  | { status: "error"; message: string };
```

- Makes valid states explicit to both users and implementers of the component
- Eliminates impossible state combinations
- Reduces unnecessary conditional branches

### JSX Structure as UI State

When discriminated unions become complex, express UI state through JSX structure:

- Loading state → `<Suspense fallback={...}>`
- Error state → `<ErrorBoundary fallback={...}>`

Use component boundaries to encode UI states, not just props.

## Useful Patterns

Use established patterns when they simplify reuse and extension:

- Factory pattern
- Module pattern
- Compound components
- Higher-order components
- Render props

Choose patterns because they reduce duplication and clarify responsibilities, not because they are fashionable.

## Naming Conventions

| Target | Convention | Example |
|---|---|---|
| Component file / class | `PascalCase` | `UserProfileCard.tsx` |
| Props / events / variables | `camelCase` | `onSubmit`, `isLoading` |
| CSS classes / folder names | `kebab-case` | `user-profile-card` |

### Naming Rules

- Use descriptive names that reveal the component role.
- Prefer domain terms when the component is domain-specific.
- Avoid unclear abbreviations and vague labels.

```text
Good:
- ButtonPrimary
- InputSearch
- UserProfileCard
- OrderListItem

Avoid:
- BtnX
- DataBox
- InfoThing
```

## Design Principles

### 1. Modularity and Encapsulation

- Give each component a clear interface and bounded responsibility.
- Hide implementation details behind props and events.
- Reduce unintended side effects when the component changes.

### 2. Reusability

- Use parameters and composition so components adapt to multiple contexts.
- Reuse should create consistency, not accidental coupling.

### 3. Maintainability

- Keep components small.
- Follow consistent naming and coding standards.
- Make debugging and change impact obvious.

### 4. Extensibility

- Build complex UI by combining small components.
- Prefer composition over deep inheritance.
- Consider micro-frontend boundaries only when organizational scale requires them.

## Common Anti-Patterns

| Anti-pattern | Why it hurts | Better approach |
|---|---|---|
| **God Object component** | Breaks single responsibility, hard to test and change | Split into focused subcomponents |
| **Tight coupling** | One change breaks other areas | Define stable interfaces, use dependency injection or event-driven boundaries |
| **Magic numbers** | Hard to understand and maintain | Replace with named constants or config |
| **Over-engineering** | Adds cost and runtime overhead | Solve the current problem simply |
| **Ignoring accessibility** | Excludes users and creates expensive rework | Build WCAG and assistive-tech checks in from the start |
| **Mixing business logic into UI** | Makes UI hard to reuse and test | Move business logic into services, hooks, or modules |
| **Inconsistent styling** | Produces fragmented UX | Use a style guide and a consistent styling strategy |
| **Ambiguous link labels** | Hurts accessibility and clarity | Use descriptive labels |
| **Tiny click targets** | Bad mobile usability | Ensure adequate padding and touch target size |

## Suggested Directory Structures

### Small Project

```text
src/
├── core/
│   └── services/
├── shared/
│   └── components/
├── features/
│   ├── dashboard/
│   │   └── components/
│   └── users/
│       └── components/
└── assets/
```

### Large Project

```text
src/
├── app/
├── features/
│   ├── products/
│   │   ├── components/
│   │   ├── schemas/
│   │   └── server/
│   └── users/
│       ├── components/
│       └── server/
├── lib/
├── api/
├── database/
├── components/
└── utils/
```

## Default Recommendation

- Follow the **framework's standard conventions first**.
- Separate **globally shared UI** from **feature-owned UI**.
- Introduce abstraction only after repeated use proves the need.
