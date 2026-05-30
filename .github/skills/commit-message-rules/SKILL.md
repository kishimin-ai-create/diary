---
name: commit-message-rules
description: "Conventional Commits format rules, types, body guidelines, language, and validation criteria for all commit messages."
---

# Commit Message Rules

## Format

```
<type>: <summary>

<body — explain Why>
```

- Summary: imperative mood, within 50 characters (e.g., "add", "fix", "refactor")
- Body: always explain **Why** the change is needed

## Types

- `test:` — add or update tests
- `feat:` — add new behavior to pass tests
- `refactor:` — improve structure without changing behavior
- `fix:` — bug fix
- `docs:` — documentation only

## Body (Why)

- Always explain **Why** in the body
- Do not explain **How** (implementation details)
- Do not repeat what is obvious from the code

## Rules

- One commit = one logical change
- Commits must be small and incremental (follow TDD cycle)
- Each TDD step must be committed separately:
  - failing test → `test:`
  - implementation → `feat:`
  - refactoring → `refactor:`

## Language

- All commit messages must be written in English
- Use clear and simple English
- Avoid ambiguous or vague expressions

## Prohibited

- Vague messages (e.g., "update", "fix stuff")
- Mixing multiple concerns in one commit
- Describing only What or How without Why

## Validation

- If the reason (Why) is not clear, the commit is invalid
- If multiple purposes exist, split the commit

## Examples

```
chore: remove obsolete security skill file

Since I no longer need the skill I wrote myself, I’m asking my copilot to write a security skill.
```
