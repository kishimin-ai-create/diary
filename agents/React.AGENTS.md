# frontend

I'm using `React` and `Typescript`. Within this directory, you should be
regarded as an expert in React and TypeScript.

## Overall

- The overall direction looks good. I focused mainly on **separation of
  concerns** and whether the structure will remain maintainable as the codebase
  grows.
- There are a few points around **common component design** and **testing
  practices** that are worth addressing early to avoid future friction.

---

## ✅ Good Points

- Component responsibilities are reasonably scoped, and state / side effects
  appear localized.
- Tests (if present) seem to be written from a **user-centric perspective**,
  which is a strong foundation.

---

## 🔥 Must Address (Affects Maintainability / Bugs)

### 1) Common Components: Are We Preserving Native HTML Props and Events?

- Be careful not to redefine standard props like `onClick` with custom
  signatures (e.g. passing only `value`). This often breaks compatibility with
  native attributes such as `disabled`, `type`, `aria-*`, etc.
- Prefer **extending and forwarding standard HTML props** rather than redefining
  them.

---

### 2) `useEffect`: Is It Truly Necessary?

- `useEffect` should primarily be used for **synchronizing with external
  systems**.
- Avoid driving UI logic or state transitions via `useEffect`, as it often
  introduces subtle bugs.
- Consider whether the logic can be handled via:
  - event handlers
  - derived state
  - `useMemo`
  - or extracting logic into custom hooks

---

### 3) Dependency Boundaries: UI vs Global State

- UI-level components should avoid directly depending on global state hooks,
  routing hooks, or data-fetching logic.
- Either:
  - move such logic into `features`, or
  - introduce a wrapper layer to clearly define boundaries

This improves reusability and testability.

---

## 🧪 Testing Considerations (Long-Term Maintainability)

### 4) Test Readability First (AAA + 3-Part Test Names)

- Test names should clearly express: **what** is being tested, **under what
  condition**, and **what outcome is expected**.
- Structure test bodies using **Arrange / Act / Assert (AAA)** to make intent
  obvious at a glance.

---

### 5) Testing Library Query Priority

- Prefer queries in the following order:
  - `getByRole`
  - `getByLabelText`
  - other semantic queries
- Treat `getByTestId` as a last resort.
- This aligns tests with accessibility and real user behavior.

---

### 6) Helper Functions in Tests: Use with Care

- Extracting common interactions (typing, clicking, setup) can reduce
  duplication.
- However, over-abstracting can make tests harder to read.
- Optimize first for **clarity**, then for reuse.

---

### 7) Snapshot Testing: Keep It Focused

- Avoid large or overly detailed snapshots.
- Prefer **small, focused snapshots** (or inline snapshots) that clearly express
  intent.
- Large snapshots tend to be brittle and expensive to maintain.

---

## 🧹 Minor Notes (Nits)

- Naming and folder placement (`ui`, `features`, `pages`, etc.) should clearly
  communicate responsibility.
- Where possible, rely on static analysis (ESLint, TypeScript) to catch
  mechanical issues and reduce review noise.

---

## 🤖 About AI-Assisted Reviews

- AI tools are effective for catching typos, formatting issues, and basic
  patterns.
- However, domain context and architectural intent still require human judgment.
- Final decisions should remain with the reviewer.

---

## 🎯 What I’d Like to See After This PR

- Common components that **preserve native props and events**
- `useEffect` limited to **external synchronization**
- Tests written with **ByRole-first queries**, **AAA structure**, and **clear
  test names**
