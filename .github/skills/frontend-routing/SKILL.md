---
name: frontend-routing
description: "Resource-oriented URL design, routing rules, parameter handling, and validation behavior for forms."
---

# Frontend Routing

Use this skill when designing URL paths, router behavior, parameter passing, or form validation UX.

## URL Path Design

Design paths around **resources**, not screens or implementation details.

### Good Default Shapes

| Screen type | Path |
|---|---|
| Home | `/` |
| Login | `/login` |
| List | `/orders` |
| Create | `/orders/new` |
| Detail | `/orders/{orderId}` |
| Edit | `/orders/{orderId}/edit` |
| Confirm / approve | `/orders/{orderId}/confirm` |
| Child collection | `/orders/{orderId}/products` |

## Path Rules

- Use **plural nouns** for resources.
- Represent nested collections with **hierarchy**.
- Use **kebab-case** in URLs.
- Use **lowerCamelCase** for path parameter names.
- Do **not** add a trailing slash.
- Do **not** use verbs such as `search`, `get`, or `delete` in the path unless they represent a real resource.

```text
Good:
/customers/{customerId}/orders/{orderId}
/system-orders/{orderId}

Avoid:
/customers/order/{order_id}
/systemOrders
/system_orders
/orders/search
/orders/{order_id}/detail
```

## Avoid Alternative URLs

A single piece of content should not have multiple primary URLs.

```text
Avoid serving the same page as both:
/product/black-t-shirt
/product?id=1234
```

### Public SEO Guidance

For public sites:

- keep the hierarchy short and intuitive
- avoid meaningless path segments
- prefer human-readable slugs

For highly sensitive pages, unpredictable paths may still be appropriate for defense-in-depth.

## Query Parameters

Use query parameters for **search conditions, filters, and other shareable page state**.

### Rules

- Prefer `?key=value`, not bare values.
- Repeat the same key for multi-select values.
- Do not put session IDs in the URL.
- Do not encode unstable values such as timestamps, temporary tracking state, or user-relative labels that expire quickly.
- Parse and update query strings with `URLSearchParams`.

```text
Good:
/orders/1/product?productId=2
/orders/1/product?type=pattern1&type=pattern2

Avoid:
/orders/1/product?2
/orders/1/product?type=pattern1,pattern2
/orders/1/product?session=452991833
/about?now=12:35am
```

## Passing Data Between Screens

| Method | Best for | Survives reload | Shareable by URL |
|---|---|---|---|
| **Path parameter** | Resource identifiers | Yes | Yes |
| **Query parameter** | Search conditions, filters | Yes | Yes |
| **In-memory state** | Temporary internal data | No | No |
| **Web Storage** | Longer-lived internal data | Yes | No |

### Recommendation

- Use **path/query parameters** when deep links and sharing matter.
- Use **memory or storage** for data that must not appear in the URL.
- Choose storage based on data lifetime and sensitivity.

## Router Mode

| Mode | Example | Strengths | Weaknesses |
|---|---|---|---|
| **Hash mode** | `/#/about` | Works on simple static hosting, legacy-friendly | Weak SEO, outdated default |
| **History mode** | `/about` | Clean URLs, better SEO, modern standard | Requires `index.html` fallback on the server |

### Recommendation

- Use **history mode** by default.
- Ensure the hosting layer supports fallback to `index.html`.

## Validation Principles

- Match validation rules to the instructions shown to users.
- Do not make frontend validation stricter or looser than the visible input requirements.
- Minimize the number of times the same user sees errors.
- Run validation on **both client and server**:
  - client-side for UX
  - server-side for data integrity and security

## Keeping Frontend and Backend Validation in Sync

| Approach | Best when | Notes |
|---|---|---|
| **Shared code** | Full-stack TypeScript / JavaScript | Strong sync, but constrains backend technology |
| **Schema + code generation** | OpenAPI / JSON Schema is part of the workflow | Good for submit-time validation and SDK generation |
| **Independent implementation + review** | Stacks differ significantly | Flexible, but depends on discipline |

### Recommendation

- Prefer **schema-driven generation** when it fits the toolchain.
- Avoid shared runtime validation code unless the stack is genuinely full-stack JS/TS.
- For inline validation, only generate code when the developer experience stays clean.

## Inline Validation

| Timing | Good for | Guidance |
|---|---|---|
| **During input** | Length checks, password strength, clearly non-obvious rules | Use carefully; do not show errors before input is meaningfully complete |
| **On blur** | Required fields, obvious values like name, address, email | Show after the field has been touched and edited |
| **On submit** | Full-form validation | Always keep this, even if inline validation exists |

### Rules

- If you adopt inline validation, do it consistently across the form.
- Do not show errors on initial page load.
- Clear the message as soon as the value becomes valid.
- Consider async checks during input or blur to reduce server-side rejection later.

## Validation Messages

### Content Rules

- Be **specific**.
- Be **brief**.
- Be **constructive**, not blaming.

```text
Avoid: An error occurred. Check the form.
Good: Password must be at least 8 characters.
```

### Placement Rules

| Placement | Recommendation |
|---|---|
| **Inline near the field** | Default choice |
| **Top summary + inline** | Good for long forms with many fields |
| **Tooltip** | Avoid as primary pattern |
| **Modal / dialog** | Avoid for normal form errors |

## HTML vs JavaScript Validation

- Implement primary validation logic in **JavaScript** using a schema or validation library.
- Still set correct HTML semantics such as `type`, `required`, `maxlength`, `min`, `max`, and `pattern` for accessibility and input assistance.
- Use `novalidate` when you need full control over message behavior.
- Connect errors with `aria-errormessage`.

## Submit Buttons

- Do **not** rely on disabled submit buttons as the main error-prevention strategy.
- Disabled controls create accessibility and usability issues.
- Even with inline validation, still validate again on submit.
