---
name: "Frontend State"
description: "State classification, storage choices, server-cache patterns, and offline-capable data handling."
---

# Frontend State

Use this skill when choosing how to store UI state, shared application state, server data, or offline data.

## Start by Classifying State

| State type | Scope | Typical examples | Default home |
|---|---|---|---|
| **UI state** | Single component or local tree | Modal open/close, tabs, form inputs, sort order | Component state, hooks, local context |
| **Application state** | Shared across the app | Current user, theme, app settings, global filters | Context or lightweight global store |
| **Server state** | Synced with backend | API responses, master data, transactions | Server-state library with cache |

## Local State Management

| Approach | Best for | Strengths |
|---|---|---|
| **Component state** | Simple local interactions | Small, obvious, low impact |
| **Custom hooks / composables** | Reusable local logic | Encapsulates behavior, improves testability |
| **Context / Provide-Inject** | Shared state inside a subtree | Avoids premature global state |

### Recommendation

- Keep state **as local as possible**.
- Extract repeated logic into **hooks/composables**.
- Use subtree sharing before promoting state to a global store.

## Global State Management

| Style | Best for | Trade-off |
|---|---|---|
| **Single store** | Small apps with simple shared state | Easy to inspect, can become crowded |
| **Multiple stores** | Medium-to-large apps with clear boundaries | Better separation, slightly more coordination |

### Recommendation

- Do not choose global state based only on team size.
- Choose it based on **shared scope**, **update frequency**, and **dependency complexity**.
- Prefer lightweight tools such as **Zustand**, **Pinia**, or **Jotai** when framework primitives are not enough.

## Server State Management

| Approach | Best for | Notes |
|---|---|---|
| **Dedicated server-state library** | Apps that need caching, refetching, loading/error states, optimistic updates | Recommended default |
| **Generic store + API client** | Small or specialized cases already centered on another store | More custom code |

### Recommendation

Use a dedicated library such as:

- **TanStack Query**
- **React Query / Vue Query**
- **SWR**

These libraries simplify:

- loading and error states
- background refresh
- caching and invalidation
- optimistic updates
- synchronization with server truth

## Selection Heuristics

Evaluate state tools against these questions:

- What kind of state dominates the app?
- How often does it change?
- How widely is it shared?
- How complex are dependencies between states?
- How much async fetching and cache behavior is required?
- Does the state contain sensitive data?
- Can framework-native primitives solve the problem first?

## Recommended Evolution Path

1. Start with **framework defaults**.
2. Add **custom hooks/composables** for reusable local logic.
3. Introduce **server-state tooling** when API complexity grows.
4. Add **lightweight global state** only when truly shared client state appears.

## State Anti-Patterns

| Anti-pattern | Problem | Better choice |
|---|---|---|
| **Making everything global** | Blurry ownership, harder debugging, unnecessary re-renders | Keep state local unless sharing is necessary |
| **Adding a heavy store too early** | Learning cost and boilerplate without value | Start simple and evolve gradually |
| **Mixing app state and server state** | Invalidates responsibilities and complicates sync | Manage them separately |
| **Unclear tool combinations** | Team inconsistency | Document which tool owns which kind of state |

## URL and Browser Storage Integration

| Storage target | Good for | Notes |
|---|---|---|
| **URL query params** | Shareable filters and search conditions | Best for deep links |
| **localStorage** | User settings, drafts, state that should survive browser close | Shared across tabs in same origin |
| **sessionStorage** | Temporary per-tab state | Cleared when the tab closes |
| **In-memory cache** | Fast temporary values | Lost on refresh |

### Rule

Hide storage access behind hooks, stores, or modules. Do not spread raw `localStorage` access throughout UI components.

## Cache Strategy

### Browser Cache

Use HTTP caching for static assets such as:

- CSS
- JavaScript bundles
- images

Typical controls include:

- `Cache-Control`
- `ETag`
- `Last-Modified`
- asset versioning / cache busting

### Application Cache

Use application-level cache carefully for:

- master data
- settings
- data where brief inconsistency is acceptable

### Cache Recommendations

- Cache **static files** aggressively.
- Cache **theme/settings-like values** in the app when acceptable.
- Do **not** cache API responses by default.
- If you cache API data, define expiry, invalidation, and logout cleanup clearly.
- Avoid storing sensitive data unless you have a strong reason and protection strategy.

## Offline / PWA Guidance

Offline support changes architecture; do not add it casually.

### Key Warnings

- PWA does not fully replace native mobile apps.
- Offline support often duplicates data and logic.
- Service workers affect the entire frontend, not just one screen.

### Static Asset Cache Strategy

| Strategy | Recommended use |
|---|---|
| **Network-first** | Default for normal web apps |
| **Cache-first / Stale-while-revalidate / Cache-then-network** | Static-content-heavy public sites |
| **Cache-only** | Avoid for normal offline web apps |
| **Network-only** | Avoid for offline use cases |

### Offline Storage

Prefer **IndexedDB** over `localStorage` for serious offline features because it:

- handles structured and larger data
- works asynchronously
- can be accessed from service workers

### Offline Logic Placement

- For new web apps, prefer implementing offline business logic in **client-side application code** first.
- Use service workers carefully and mainly for caching/proxy behavior.
- Use framework ecosystem tools when possible:
  - `vite-pwa`
  - `next-pwa`
  - `workbox`

### Offline Detection

- Do **not** rely on `navigator.onLine` as the primary source of truth.
- Detect offline conditions through real requests and network-error handling.
- Switch offline behavior automatically rather than forcing users to flip an explicit mode switch.
