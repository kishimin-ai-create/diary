# Codex Project Customization

This directory contains Codex-specific project customization derived from the
existing `.github/` support files.

## Layout

- `.codex/agents/`
  - Project-scoped custom agents in the documented Codex TOML format.
- `.agents/skills/`
  - The repo-scoped skill discovery path that Codex scans automatically.

## Skill Discovery

Repository skills are kept under `.agents/skills/`, which is the repo-scoped
discovery path that Codex scans automatically.

## Mapping From `.github/`

- `.github/agents/*.agent.md`
  - Mirrored as Codex custom agents under `.codex/agents/`
- `.github/skills/*`
  - Mirrored as repo-scoped Codex skills under `.agents/skills/`
- `.github/prompts/*.prompt.md`
  - Mapped to repo-scoped Codex skills because Codex custom prompts are
    local-only and deprecated
  - `write-article.prompt.md` -> `write-article`
  - `summarize-work.prompt.md` -> `summarize-work`
