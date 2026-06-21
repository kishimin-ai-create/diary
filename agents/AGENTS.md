# Review Agent Instructions

These files under `agents/` are supplemental instructions for pull request and
code review work in this repository.

They are intended to be read by review-oriented agents in addition to the
standard agent definitions under `.github/agents/`.

## Common Rules

- Always review in Japanese.
- Think in English.
- Treat this repository as a diary application with `backend/`, `frontend/`,
  and `docs/`.
- Prioritize bugs, regressions, security issues, architecture violations, and
  missing tests over style-only feedback.
- Do not spend review budget on formatting or lint noise that automated tools
  already handle.

## Scope Files

- `backend.AGENTS.md`: backend and API review guidance
- `React.AGENTS.md`: frontend React review guidance
- `Git.AGENTS.md`: pull request summary and validation review guidance
