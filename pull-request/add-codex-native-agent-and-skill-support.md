## Title

Add Codex-native agent and skill support for shared repository workflows

## Summary

This PR makes the existing `.github/` Copilot support files usable in local
Codex sessions without duplicating the repository guidance. It adds Codex
custom agents, repo-scoped skills, and bridge instructions that map shared
agent and prompt definitions into Codex-native entry points, while also
removing remote push behavior from shared agent workflows.

## Related Tasks

TBD

## What was done

- Added repository and directory-scoped `AGENTS.md` files, including the root
  `AGENTS.md`, `.github/AGENTS.md`, and the scoped guidance files under
  `backend/`, `docs/`, `frontend/`, `pull-request/`, and `review/`, so Codex
  can follow project rules from the same working areas as the existing
  GitHub-side setup.
- Added 22 project-scoped Codex custom agents under `.codex/agents/`. These
  TOML wrappers point Codex back to the matching `.github/agents/*.agent.md`
  definitions and keep the GitHub agent files as the source of truth.
- Added 30 repo-scoped skills under `.agents/skills/`, mirroring the shared
  `.github/skills/` files and adding `write-article` and `summarize-work` as
  Codex equivalents for `.github/prompts/*.prompt.md`.
- Added `.github/CODEX_AGENT_BRIDGE.md` and updated the root `AGENTS.md` so
  explicit mentions such as `@ArticleWriterAgent`, `@WorkSummaryAgent`,
  `@PullRequestWriterAgent`, and `@CodeReviewAgent` are handled through the
  repository definitions instead of assumed native tools.
- Updated `.github/instructions/git.instructions.md` and the affected
  `.github/agents/*.agent.md` files so shared agent workflows stop at local
  commits and do not perform `git push` or other remote-writing steps.
- Updated `agents/AGENTS.md`, `agents/backend.AGENTS.md`,
  `agents/React.AGENTS.md`, and `agents/Git.AGENTS.md` so PR review guidance
  stays aligned with the diary project's backend, frontend, and reviewer-facing
  expectations.
- Added `.codex/README.md` to document how `.github/agents/`, `.github/skills/`,
  and `.github/prompts/` map into Codex-native locations.

## What is not included

- No backend or frontend runtime behavior changes are included in this scope.
- This draft does not summarize the separate README rewrite or the v1
  requirements and specification documents that are also present on the branch.

## Impact

- Codex can use repository-defined agent roles and shared prompt equivalents
  without reauthoring the original `.github/` guidance.
- Shared agent workflows now make a clearer distinction between local git work
  and human-controlled remote pushes.
- Review and documentation tasks have scoped Codex instructions in the same
  areas where the repository already stores those artifacts.

## Testing

- Ran `git diff --check main..HEAD -- .agents .codex .github AGENTS.md backend/AGENTS.md docs/AGENTS.md frontend/AGENTS.md pull-request/AGENTS.md review/AGENTS.md agents`
- The command reported `new blank line at EOF` warnings in multiple
  `.github/agents/*.agent.md` files and in
  `.github/instructions/git.instructions.md`.
- No backend or frontend test commands were run because the scoped changes are
  documentation, agent definitions, and repository configuration files.

## Notes

- This draft is intentionally focused on the Codex-support changes on the
  branch, not the full branch diff.
- `.agents/skills/frontend-patterns/SKILL.md` is currently empty because the
  mirrored source file `.github/skills/frontend-patterns/SKILL.md` is also
  empty.
