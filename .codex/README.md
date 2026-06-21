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
