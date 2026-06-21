# GitHub Support Files Codex Instructions

These rules apply inside `.github/`.

## Purpose

The `.github/` directory is the source for Copilot agents, instructions,
workflows, prompts, skills, templates, and ADRs. Keep changes compatible with
the existing Copilot file formats while adapting only what the user requested.

## Instruction Files

- Preserve YAML frontmatter such as `applyTo` in `.github/instructions/*.md`.
- Preserve agent frontmatter such as `description`, `tools`, and
  `user-invocable` in `.github/agents/*.agent.md`.
- Keep links relative to `.github/` or the repository root.
- Do not add local absolute paths.
- When adding a new global rule, consider whether related agent governing-rule
  tables also need a reference.

## Design

- `.github/DESIGN.md` is the first project-wide design reference for UI design
  work.
- Keep design rules focused on source-of-truth documents, tokens, component
  mapping, and verification commands.

## Workflows

- Keep CI workflow changes narrow.
- Do not introduce secrets directly into workflow files.
- Prefer existing package scripts over inline one-off command sequences.

## ADRs

- ADR files in `.github/ADR/` record architectural decisions.
- Do not change an ADR casually while implementing code. If behavior conflicts
  with an ADR, call out the conflict.
