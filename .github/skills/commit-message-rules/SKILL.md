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
- If "Why" is just "because the spec says so", write **what became possible** instead
  - Bad: "add customer list feature because spec requires it"
  - Good: "allow users to view customer list"

## Rules

- One commit = one logical change
- Commits must be small and incremental (follow TDD cycle)
- Each TDD step must be committed separately:
  - failing test → `test:`
  - implementation → `feat:`
  - refactoring → `refactor:`
- Do not make commits that are too small — if the commit message only restates what the code obviously does (e.g., "create PostController"), the commit is likely too granular
- Each commit must leave the application in a working (non-crashing) state — avoid commits where dependent files (routes, controllers, views) are missing
- Separate auto-generated code (e.g., `gen-types`, bulk-generated helper files) into its own commit to distinguish intentional changes from generated changes

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

# Commit Granularity

Create commits with a small and meaningful scope.

## Rules

- One commit should represent one logical change.
- Do not mix refactoring, feature implementation, and bug fixes in the same commit.
- Separate formatting-only changes from functional changes.
- Separate file moves/renames from code modifications when possible.
- Keep commits easy to review and easy to revert.
- A reviewer should be able to understand the intent of the commit from the commit message and diff alone.

## Good Examples

### Feature implementation

feat: add LINE notification service

- add notification module
- add push message implementation
- add configuration handling

### Refactoring

refactor: extract user validation logic

- move validation into dedicated module
- remove duplicated validation code

### Bug fix

fix: handle empty API response

- add null check
- prevent runtime error

## Bad Examples

### Mixed concerns

feat: add LINE notification and refactor API layer

### Large unrelated changes

feat: implement notification system

- add LINE notification
- update ESLint config
- migrate to Zod
- rename components
- update dependencies

## Goal

Each commit should have a single clear purpose.

A reviewer should be able to answer:
"What changed and why?"
without reading unrelated modifications.

# Commit Order

Arrange commits in logical implementation order so the history reads like a smooth, intentional development flow.

## Rules

- Implement dependencies before the code that depends on them (e.g., define the API endpoint before implementing the API call)
- Group related changes consecutively (e.g., PC nav change followed immediately by SP nav change, not separated by unrelated commits)
- Commit frequently during development (even as WIP) to avoid a tangled history
- When using LLMs to generate code, limit the scope per generation to keep commits clean
- Use `git rebase -i` to fix commit order or squash/split commits before opening a PR

## Anti-patterns

- A commit calls a function that does not exist yet in the same or earlier commits
- PC and SP variants of the same change are separated by unrelated commits
- Auto-generated and hand-written changes are mixed in one commit

## Good

```
chore: remove obsolete security skill file

Since I no longer need the skill I wrote myself, I’m asking my copilot to write a security skill.
```

## Bad

```
chore: remove obsolete security skill file
```
