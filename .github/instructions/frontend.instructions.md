---
applyTo: "frontend/**"
---

# Frontend Rules

## Component Design

- Shared UI components must extend and forward native HTML props and event
  handlers — never redefine standard props (e.g. `onClick`, `disabled`, `type`,
  `aria-*`) with custom signatures.
- UI-level components must not directly import global state hooks, routing
  hooks, or data-fetching logic. Move such dependencies into `features/` or a
  dedicated wrapper.
- Folder names (`ui/`, `features/`, `pages/`) must clearly communicate
  responsibility — do not place page-level logic in `ui/`.

## `useEffect`

- `useEffect` is only permitted for synchronizing with **external systems**
  (e.g. DOM APIs, WebSockets, third-party subscriptions).
- Do not use `useEffect` to drive UI logic or state transitions. Use event
  handlers, derived state, `useMemo`, or custom hooks instead.

## Testing

- Test names must express: **what** is being tested, **under what condition**,
  and **what outcome is expected**.
- Structure every test body with **Arrange / Act / Assert (AAA)**.
- Query priority: `getByRole` → `getByLabelText` → other semantic queries →
  `getByTestId` (last resort only).
- Snapshots must be small and focused. Large or overly detailed snapshots are
  prohibited.
