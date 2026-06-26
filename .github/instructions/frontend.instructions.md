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

## Runtime API, Auth, and Time Rules

- Browser-side API calls should normally use relative `/api/...` paths when the
  app has a Next.js route proxy. Seeing the frontend origin in the browser
  Network panel is not itself a bug.
- Server-side proxy code must resolve backend origins from runtime configuration
  and must reject a backend origin equal to the frontend request origin.
- Proxy responses must not blindly preserve response framing headers such as
  `content-length` or `content-encoding` when the runtime re-emits the body.
- For API/proxy defects, verify direct backend JSON, proxied JSON, and rendered
  UI state. A `200` status alone is not enough.
- If login stores a token, the visible app shell must provide a logout action
  that clears the same storage and updates navigation.
- If API/database timestamps are UTC and the UI is expected to match them,
  specify `timeZone` explicitly in `Intl.DateTimeFormat` and cover the rendered
  value with a test.
