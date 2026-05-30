# Protected paths

Use
[`.github/instructions/protected-paths.instructions.md`](instructions/protected-paths.instructions.md) as
the source of truth for protected paths.

- Do not modify files or folders listed in
  `.github/instructions/protected-paths.instructions.md` unless the user explicitly requests a
  change to that exact path.
- You may read protected files for context, but you must not edit, rename, move,
  or delete them unless the user explicitly asks for it.

# Autonomy

- **Never ask for confirmation or permission for any operation** — this includes
  git commits, file edits, file creation, deletions, running commands, applying
  fixes, or any other repository action. Receive the instruction and act immediately.
- Do not pause mid-task to ask approval-style questions such as whether to
  proceed, edit, apply, update, commit, or fix something when the requested
  change is already clear.
- If a small assumption is needed, choose a reasonable default and continue
  without stopping to ask.
- Only ask a question when a fact is genuinely missing and makes correct
  implementation impossible (e.g., an unknown API key or an ambiguous spec with
  two incompatible interpretations). Ask for the missing fact only — never for
  permission to proceed.
- **Git operations** (commit, push, branch, rebase, etc.) require no
  confirmation. Execute them directly as part of the task.

# Design documents

- Design documents are stored under `docs/design/`.
- When implementation, review, or documentation tasks need design context, check
  `docs/design/` first before assuming requirements from code alone.
- Treat the relevant files under `docs/design/` as the primary design reference
  unless the user explicitly says otherwise.

# Review comments

- Review feedback files are stored under `review/`.
- When asked to address review comments or draft replies, check `review/` first.
- Use the review files as the primary source for reviewer feedback unless the
  user provides a different source.

# Post-task automation

- After fixing an error or resolving one error root cause, automatically invoke
  `@ArticleWriterAgent` and create one error-focused article for that fix.
- After `@CodeReviewAgent` completes and saves its review file, automatically
  invoke `@ReviewResponseAgent` with the newly created review file as context
  before proceeding to any other post-task step.
- After completing an implementation, fix, review-response, refactor, or similar
  repository task, automatically invoke post-task agents in this order:
  1. `@ArticleWriterAgent`
  2. `@WorkSummaryAgent`
- Run the post-task agents only after the main task changes are finished.
- Do not recursively re-invoke post-task agents when the current task is already
  `@ArticleWriterAgent` or `@WorkSummaryAgent`.
- Do not auto-run the post-task agents for tasks that only modify `blog/` or
  `diary/`.

---

# Principles

- Code as design.
- Code will be changed.
- KISS(Keep It Simple, Stupid.)
- DRY(Don't Repeat Yourself.)
- YAGNI(You Are'nt Going to Need it.)
- PIE(Program Intently and Expressively)
- SLAP(Single Level of Abstraction Principle.)
- OCP(Open-Closed Principle)
- Naming is important
- Changeability
- Interoperability
- Efficiency
- Reliability
- Testability
- Reusability
- Simplicity Principle
- Isomorphism Principle
- Symmetry Principle
- Hierarchy Principle
- Linearity Principle
- Clarity Principle
- Safety Principle
- No ARIA is better than bad ARIA.

---

# Engineering rules

## Responsibility Separation

- Code expresses **How**
  - Describe how the system works
  - Do not include the reasoning (Why)

- Tests express **What**
  - Define what the system should do
  - Do not depend on implementation details (How)

- Commit messages express **Why**
  - Explain why the change is needed
  - Do not describe implementation details

- Code comments express **Why not**
  - Explain why alternative approaches were not chosen
  - Clarify trade-offs and decisions

## ADR Compliance

- Before starting work, identify and review related `docs/ADR/`
- Implementation must follow `docs/ADR/` decisions strictly
- If implementation conflicts with an ADR, stop and update the `docs/ADR/` first

## Comments

- Please write an appropriate comment
- Aim for code that is easy to understand without needing comments, but include
  comments for parts that cannot be expressed otherwise

---

## Commit Message Rules

### Format

- Use Conventional Commits format:

  <type>: <summary>

- Keep the summary concise (within 50 characters)
- Use imperative mood (e.g., "add", "fix", "refactor")

---

### Types

- test: add or update tests
- feat: add new behavior to pass tests
- refactor: improve structure without changing behavior
- fix: bug fix
- docs: documentation only

---

### Description (Why)

- Always explain **Why** in the commit body
- Do not explain **How** (implementation details)
- Do not repeat what is obvious from the code

---

### Rules

- One commit = one logical change
- Commits must be small and incremental (follow TDD cycle)
- Each step in TDD should be committed:
  - failing test → `test:`
  - implementation → `feat:`
  - refactoring → `refactor:`

---

### Language

- All commit messages must be written in English
- Use clear and simple English
- Avoid ambiguous or vague expressions

---

### Prohibited

- Vague messages (e.g., "update", "fix stuff")
- Mixing multiple concerns in one commit
- Describing only What or How without Why

---

### Validation

- If the reason (Why) is not clear, the commit is invalid
- If multiple purposes exist, split the commit
