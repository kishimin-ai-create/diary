# Custom commands

This repository defines reusable Copilot custom commands under `.github/`.

## How to use prompt commands

Prompt files are stored in `.github/prompts/`.

> [!NOTE]
> Prompt files may work in Copilot Chat surfaces that support repository prompt
> files, but they are not guaranteed to appear as `/...` commands in Copilot
> CLI. For Copilot CLI, prefer the `@AgentName` commands documented below.

### `/write-article`

Generate a technical article from repository changes.

Example:

```text
/write-article summarize the recent frontend changes for beginners as a Zenn article
```

Behavior:

- Uses `ArticleWriterAgent`
- Saves the generated article under `blog/`
- Reports the generated file path in chat

### `/summarize-work`

Summarize what has been done so far in this repository and the current session.

Example:

```text
/summarize-work this session
```

Other examples:

```text
/summarize-work backend only
/summarize-work recent changes
```

Behavior:

- Summarizes work in English
- Prioritizes current conversation context
- Also checks the current working tree and changed files when needed

## How to use custom agents

Custom agents are stored in `.github/agents/` and are invoked from Copilot Chat
with `@AgentName`.

### `@ArticleWriterAgent`

Create a technical article from completed work and save it under
`blog/`.

Example:

```text
@ArticleWriterAgent output the recent changes as an article in the blog folder
```

### `@OpenApiWriterAgent`

Create or update an OpenAPI document for implemented backend APIs.

Example:

```text
@OpenApiWriterAgent create an OpenAPI document from the recent backend API changes
```

Behavior:

- Writes the spec to `docs/spec/backend/openapi.yaml`
- Uses implemented backend behavior as the source of truth

### `@WorkSummaryAgent`

Write a work diary entry for what has been done so far in this
repository or current session.

Example:

```text
@WorkSummaryAgent this session
```

Other examples:

```text
@WorkSummaryAgent backend only
@WorkSummaryAgent recent changes
```

Behavior:

- Writes the result to `diary\YYYYMMDD.md`
- Appends to the same day's file when it already exists
- Uses an article-like summary style instead of a plain bullet-only summary

### `@ReviewResponseAgent`

Read review comments from `review/`, fix what should be fixed, and draft review
replies.

Example:

```text
@ReviewResponseAgent respond to the findings in review/Master-20260421.md
```

Other examples:

```text
@ReviewResponseAgent review the findings under review/, fix what you can, and draft reply text
@ReviewResponseAgent respond only to backend-related review comments
```

Behavior:

- Uses files under `review/` as the main review input
- Applies safe repository fixes when the review point is valid
- Produces concise reply drafts for each handled comment
- Writes each reply draft directly under the corresponding fix/disposition item

## Notes

- Prompt commands are best for lightweight repeatable tasks.
- Custom agents are better when the task needs a specialized role or structured
  output.
- If you add a new prompt or agent, document the invocation example here.
- When you add a custom command, always update this file in the same task with
  its usage, invocation example, and output behavior.

## Automatic follow-up behavior

- After fixing one error root cause, the repository instructions now tell Copilot
  to automatically run `@ArticleWriterAgent`.
- After completing a repository task, the repository instructions now tell
  Copilot to automatically run:
  1. `@ArticleWriterAgent`
  2. `@WorkSummaryAgent`
- To avoid loops, this automatic follow-up does not re-run when the current task
  is already `@ArticleWriterAgent` or `@WorkSummaryAgent`.
- It also does not auto-run for tasks that only update `blog/` or `diary/`.
