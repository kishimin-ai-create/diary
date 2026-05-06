# TypeScript Rules

## Type Assertions (`as`)

- Type assertions using `as` are **prohibited**
- If an assertion is absolutely necessary, **you must add an explanatory comment on the line immediately before it**

```ts
// NG
const el = document.getElementById("app") as HTMLDivElement;

// OK — getElementById can return null, but the element is guaranteed to exist in index.html
const el = document.getElementById("app") as HTMLDivElement;
```

## `any` Type

- Use of the `any` type is **prohibited**
- If `any` is absolutely necessary, **you must add an explanatory comment on the line immediately before it**

```ts
// NG
function parse(raw: any) { ... }

// OK — Using any temporarily because type definitions for this external library do not exist; will replace with unknown once type definitions are added
function parse(raw: any) { ... }
```

## Alternatives

Before reaching for `as` or `any`, consider the following:

- Use type guard functions (`instanceof`, `typeof`, custom type predicates) instead of `as`
- Use `unknown` instead of `any`, and narrow the type with guards
- If a type is truly unknown, handle it safely via the `unknown` → guard → concrete type flow
