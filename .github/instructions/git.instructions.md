---
applyTo: "**"
---

# Git Rules

## Branch Naming

- Use the format: `{type}/{short-description}` (e.g. `feat/add-auth`,
  `fix/null-guard`, `refactor/clean-interactor`).
- Use kebab-case for the description.
- Types mirror Conventional Commits: `feat`, `fix`, `refactor`, `docs`, `test`,
  `chore`.

## History

- Never force-push to `main` or any shared branch.
- Do not rewrite (rebase, amend, squash) commits that have already been pushed
  to a shared branch.
- Rebase / squash is allowed on your own feature branch before opening a PR.

## What Not to Commit

- Do not commit `node_modules/`, build output (`dist/`, `build/`), or any
  generated artifact unless explicitly required.
- Do not commit `.env` files or any file containing secrets or credentials.
  Use `.env.example` with placeholder values instead.
- Do not commit machine-specific files (e.g. `.DS_Store`, `Thumbs.db`,
  IDE config files not shared by the team).

## Commit Discipline

- Commit messages must follow Conventional Commits format — see
  `skills/commit-message-rules/SKILL.md` for the full commit message rules.
- One commit = one logical change. Never bundle unrelated changes.
- Each TDD step must be a separate commit (`test:` → `feat:` → `refactor:`).

