---
name: summarize-work
description: Use when summarizing completed work from the repository or current session in Japanese as the Codex equivalent of .github/prompts/summarize-work.prompt.md.
---

# Summarize Work

This skill is the repository-shared Codex equivalent of
`.github/prompts/summarize-work.prompt.md`.

## Use This Skill When

- The user asks for `/summarize-work`
- The user wants an in-chat summary of completed work
- The user wants scope such as `this session`, `backend only`, or
  `recent changes`

## Workflow

1. Read `.github/prompts/summarize-work.prompt.md` for the source prompt
   contract.
2. Prioritize the current conversation context when available.
3. Also inspect the current working tree and relevant changed files so the
   output is grounded in observable repository changes.
4. Group the summary by requested task, not just by file.
5. For each item, state:
   - what was requested
   - what was changed or created
   - the main file paths involved
6. If something was requested but not completed, say so plainly.
7. Do not write any files unless the user explicitly asks.

## Output Expectations

- Respond in Japanese
- Use a concise bullet list
- Prefer task-oriented summaries over chronological chatter
- Do not invent history that is not supported by the conversation or repository
  state
