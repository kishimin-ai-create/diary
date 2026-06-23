# Codex Agent Bridge

This file explains how Codex should use the agent definitions stored under
`.github/agents/`.

## Purpose

The files in `.github/agents/*.agent.md` are prompt and workflow definitions.
They are not automatically callable tools in Codex just because they exist in
the repository.

Codex must treat them as reusable operating instructions and bridge them into
its own execution model.

## Trigger

When the user explicitly mentions an agent name that matches a file under
`.github/agents/`, such as:

- `@ArticleWriterAgent`
- `@WorkSummaryAgent`
- `@PullRequestWriterAgent`
- `@CodeReviewAgent`

Codex should interpret that mention as a request to use the corresponding agent
definition.

## Bridge Procedure

1. Read `.github/AGENT_IO.md`.
2. Read the matching `.github/agents/{AgentName}.agent.md`.
3. Read any directly referenced repository template or instruction file that is
   necessary for the task.
4. If sub-agent tooling is available in the current Codex environment, spawn a
   scoped sub-agent and pass along:
   - the requested outcome
   - the relevant file paths or scope
   - the behavior and output rules from the matched `.agent.md`
5. If sub-agent tooling is not available, Codex should execute the task itself
   using the same rules.

## Execution Rules

- Treat `.agent.md` files as behavior specifications, not as permission grants.
- Follow repository-level `AGENTS.md` rules first when there is any conflict.
- Do not run `git push`, force-push, or other remote-writing commands.
- When the current user explicitly invokes an agent, that invocation grants the
  agent permission to create any commit required by its `.agent.md` definition
  after the required verification succeeds. Keep this permission scoped to the
  requested task, use the commit granularity required by the agent definition,
  and never push.
- If the current user explicitly says not to commit, that instruction overrides
  the agent commit permission.
- Do not treat "post-completion required steps" in `.agent.md` as automatic.
  Only perform those follow-up tasks when the user asked for them or when they
  are clearly part of the requested deliverable.
- If an agent asks for output in a specific folder such as `blog/`, `diary/`,
  `pull-request/`, or `review/`, preserve that output contract unless the user
  asked for a different destination.
