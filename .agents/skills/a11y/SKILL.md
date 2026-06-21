---
name: a11y
description: Accessibility (a11y) guidelines and best practices for building inclusive web interfaces.
---

# Accessibility (a11y) Guidelines

## ARIA

- No ARIA is better than bad ARIA.
- Only add ARIA roles, states, and properties when native HTML semantics are insufficient.
- Incorrect ARIA usage actively harms users of assistive technologies.
- Prefer semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<label>`, etc.) over ARIA workarounds.

## Keyboard Navigation

- All interactive elements must be keyboard accessible.
- Maintain a logical and visible focus order.
- Never remove focus outlines without providing an alternative.

## Perceivable

- Provide text alternatives for non-text content (images, icons, charts).
- Ensure sufficient color contrast (WCAG AA: 4.5:1 for normal text, 3:1 for large text).
- Do not rely on color alone to convey information.

## Operable

- Avoid interactions that require precise pointer control (e.g., hover-only menus).
- Provide enough time for users to read and use content.

## Understandable

- Use plain language; avoid jargon where possible.
- Form inputs must have visible, associated labels.
- Error messages must clearly identify the problem and how to fix it.

## Robust

- Use valid, well-structured HTML.
- Test with screen readers (NVDA, VoiceOver) in addition to automated tools.
