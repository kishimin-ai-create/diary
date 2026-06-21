---
name: write-article
description: Use when writing a Japanese technical article from repository changes and saving it under blog/ as the Codex equivalent of .github/prompts/write-article.prompt.md.
---

# Write Article

This skill is the repository-shared Codex equivalent of
`.github/prompts/write-article.prompt.md`.

## Use This Skill When

- The user asks for `/write-article`
- The user wants a technical article or devlog from repository changes
- The output should be saved under `blog/`

## Workflow

1. Read `.github/prompts/write-article.prompt.md` for the source prompt
   contract.
2. Prefer using the `ArticleWriterAgent` custom agent when sub-agent tooling is
   available.
3. If sub-agent tooling is unavailable, perform the work directly while
   following the same observable-facts-only rules.
4. Identify the intended scope from the user's request first.
5. If the scope is incomplete, infer it from the most relevant recent
   repository changes, related docs, and current working tree changes.
6. Save the final Markdown file under `blog/`.
7. Report the generated file path and the covered scope in chat.

## Output Expectations

- Japanese technical writing
- Clear explanation of background, changes, implementation details, and key
  learnings
- Minimal filler
- No unsupported claims
