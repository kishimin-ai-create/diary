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
