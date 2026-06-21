# Documentation Codex Instructions

These rules apply inside `docs/`.

## Source of Truth

- `docs/v1/requirements/` contains the product requirements.
- Keep requirement files consistent with each other:
  - `usecase.md` for user flows
  - `screen_requirements.md` for screen behavior
  - `data_requirements.md` for data requirements
  - `functinal_requirements.md` for functional requirements
- If a requirement conflicts with code or ADRs, document the conflict instead of
  silently choosing one.

## Writing Rules

- Use repository-relative paths only.
- Do not include local absolute filesystem paths, machine names, or user names.
- Keep requirement statements testable and implementation-agnostic.
- Prefer concise, structured Markdown with stable headings.
- When adding behavior, include observable outcomes and error cases where they
  matter.

## Design References

- For design-related documentation, read `.github/DESIGN.md` first.
- If `docs/design/` exists, keep detailed design documents there and reference
  them from requirement docs instead of duplicating large sections.
