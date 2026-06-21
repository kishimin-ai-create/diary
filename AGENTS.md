# Codex Instructions

This file adapts the Copilot rules in `.github/` for Codex. More specific
`AGENTS.md` files in subdirectories extend these rules.

## Project

- This repository is a diary application.
- `backend/` contains the Hono + TypeScript API.
- `frontend/` contains the Next.js + React + TypeScript UI.
- `docs/requirements/` contains the product requirements and use cases.
- `.github/` contains the Copilot instruction source that these Codex rules are
  based on.

## GitHub Agent Bridge

- Files under `.github/agents/*.agent.md` are instruction files, not
  automatically installed tools in Codex.
- If the user explicitly mentions an agent name such as `@ArticleWriterAgent`,
  `@WorkSummaryAgent`, or `@PullRequestWriterAgent`, treat that as a request to
  use the matching definition in `.github/agents/`.
- Before acting on that request, read:
  - `.github/CODEX_AGENT_BRIDGE.md`
  - `.github/AGENT_IO.md`
  - the matching `.github/agents/{AgentName}.agent.md`
- If Codex sub-agent tools are available, prefer launching a well-scoped
  sub-agent that follows the matched agent definition.
- If sub-agent tools are unavailable, perform the task directly while following
  the matched agent definition yourself.
- Repository safety rules in this file override any conflicting instruction in
  `.github/agents/*.agent.md`, especially around protected paths, git history,
  and validation.
- Do not assume chained follow-up agents in `.agent.md` files are mandatory in
  Codex. Run them only when the current user request actually asks for that
  outcome.

## GitHub Prompt Bridge

- Files under `.github/prompts/*.prompt.md` are Copilot prompt files.
- Codex custom prompts are local-only and deprecated, so the repository-shared
  Codex equivalent for these prompt files is repo-scoped skills under
  `.agents/skills/`.
- Treat `.github/prompts/write-article.prompt.md` as mapped to the
  `write-article` skill.
- Treat `.github/prompts/summarize-work.prompt.md` as mapped to the
  `summarize-work` skill.
- When the user asks for `/write-article` or `/summarize-work`, interpret that
  as a request to use the corresponding mapped skill behavior.

## Working Style

- When the requested change is clear, make the change directly and verify it.
- Ask a question only when a missing fact makes correct implementation
  impossible.
- Before broad changes, read the relevant requirements, ADRs, design documents,
  and nearby code.
- Use paths relative to the repository root in committed files and generated
  documentation.
- Do not leave unfinished edits, generated noise, or unrelated refactors.

## Protected Paths

Do not modify these unless the user explicitly asks for that exact path:

- `README.md`
- `agents/`

You may read protected paths for context.

## Requirements, ADRs, and Design

- Treat `docs/requirements/` as the product behavior source of truth.
- Check `.github/ADR/` for related architectural decisions before implementation.
- For design-related work, read `.github/DESIGN.md` first, then any relevant
  files under `docs/design/` if they exist.
- If code, requirements, and ADRs conflict, stop changing code and report the
  conflict clearly.

## Engineering Rules

- Code explains how the system works.
- Tests explain what the system must do.
- Commit messages explain why the change is needed.
- Comments should explain why a non-obvious trade-off exists, not restate the
  code.
- Keep changes scoped to one logical task.

## TypeScript

- Avoid `as` assertions.
- Avoid `any`.
- If `as` or `any` is truly unavoidable, add an explanatory comment immediately
  before the line.
- Prefer `unknown`, type guards, discriminated unions, and explicit domain types.

## Testing and TDD

- Follow TDD for code changes: red, green, refactor.
- Write or update a failing test before changing production behavior whenever
  feasible.
- Test filenames must include a size prefix:
  - `*.small.test.ts` or `*.small.test.tsx`
  - `*.medium.test.ts` or `*.medium.test.tsx`
  - `*.large.test.ts` or `*.large.test.tsx`
- Do not create unprefixed `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or
  `*.spec.tsx` files.
- Prefer more small tests than medium tests, and more medium tests than large
  tests.
- Structure tests with Arrange, Act, Assert.
- Test names should state what is tested, under what condition, and the expected
  result.

## Security and Configuration

- Never commit secrets, credentials, tokens, or `.env` files.
- Document required environment variables with placeholders.
- Do not hardcode production URLs in source files. Use environment variables or
  relative API paths.
- Frontend code should use relative API paths where possible.
- Backend code should read runtime configuration from `process.env`.
- Validate input at API boundaries.
- Never log passwords, tokens, or full request bodies containing credentials.

## Git

- Use Conventional Commits: `<type>: <summary>`.
- Include the why in the commit body when writing a full commit message.
- One commit should contain one logical change.
- Do not rewrite shared history or force-push shared branches.
- Do not commit dependencies, build output, generated artifacts, or
  machine-specific files unless explicitly required.

## Validation

- Run the smallest relevant checks for the files you changed.
- For backend changes, prefer commands from `backend/package.json`.
- For frontend changes, prefer commands from `frontend/package.json`.
- If validation cannot be run, explain why in the final response.
