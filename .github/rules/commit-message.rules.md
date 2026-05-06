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
