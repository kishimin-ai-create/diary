# Protected paths

Use
[`.github/rules/protected-paths.rules.md`](../rules/protected-paths.rules.md) as
the source of truth for protected paths.

- Do not modify files or folders listed in
  `.github/rules/protected-paths.rules.md` unless the user explicitly requests a
  change to that exact path.
- You may read protected files for context, but you must not edit, rename, move,
  or delete them unless the user explicitly asks for it.

# Autonomy

- **Never ask for confirmation or permission for any operation** — this includes
  git commits, file edits, file creation, deletions, running commands, applying
  fixes, or any other repository action. Receive the instruction and act immediately.
- Do not pause mid-task to ask approval-style questions such as whether to
  proceed, edit, apply, update, commit, or fix something when the requested
  change is already clear.
- If a small assumption is needed, choose a reasonable default and continue
  without stopping to ask.
- Only ask a question when a fact is genuinely missing and makes correct
  implementation impossible (e.g., an unknown API key or an ambiguous spec with
  two incompatible interpretations). Ask for the missing fact only — never for
  permission to proceed.
- **Git operations** (commit, push, branch, rebase, etc.) require no
  confirmation. Execute them directly as part of the task.

# Design documents

- Design documents are stored under `docs/design/`.
- When implementation, review, or documentation tasks need design context, check
  `docs/design/` first before assuming requirements from code alone.
- Treat the relevant files under `docs/design/` as the primary design reference
  unless the user explicitly says otherwise.

# Review comments

- Review feedback files are stored under `review/`.
- When asked to address review comments or draft replies, check `review/` first.
- Use the review files as the primary source for reviewer feedback unless the
  user provides a different source.

# Post-task automation

- After fixing an error or resolving one error root cause, automatically invoke
  `@ArticleWriterAgent` and create one error-focused article for that fix.
- After `@CodeReviewAgent` completes and saves its review file, automatically
  invoke `@ReviewResponseAgent` with the newly created review file as context
  before proceeding to any other post-task step.
- After completing an implementation, fix, review-response, refactor, or similar
  repository task, automatically invoke post-task agents in this order:
  1. `@ArticleWriterAgent`
  2. `@WorkSummaryAgent`
- Run the post-task agents only after the main task changes are finished.
- Do not recursively re-invoke post-task agents when the current task is already
  `@ArticleWriterAgent` or `@WorkSummaryAgent`.
- Do not auto-run the post-task agents for tasks that only modify `blog/` or
  `diary/`.
