---
description: Summarize what has been done so far in this repository and session
name: summarize-work
argument-hint: Optional scope such as "this session", "backend only", or "recent changes"
agent: agent
---

Summarize what work has been done so far for this repository and in the current
session.

Additional scope from the user:
${input:Optional scope such as "this session", "backend only", or "recent changes"}

Instructions:

1. Prioritize the current conversation context when available.
2. Also inspect the current working tree and relevant changed files so the output
   is grounded in observable repository changes.
3. Group the summary by requested task, not just by file.
4. For each item, briefly state:
   - what was requested
   - what was changed or created
   - the main file paths involved
5. If something was requested but not completed, say so plainly.
6. Do not invent history that is not supported by the conversation or repository
   state.

Output format:

- Respond in Japanese
- Use a concise bullet list
- Prefer task-oriented summaries over chronological chatter
- Do not write any files unless the user explicitly asks
