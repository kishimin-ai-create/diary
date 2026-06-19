# DESIGN.md

## Read first

1. design-tokens
2. component-architecture
3. component mapping
4. operation guide

## Source of truth

- Tokens SSoT: design tokens in JSON
- Component mapping: design-to-code mapping file

## Rules

- Do not introduce external UI vocabulary directly
- Normalize requested UI patterns before implementation
- Verify design-related changes with `pnpm penpot:verify`
