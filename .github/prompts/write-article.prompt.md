---
description: Write a Japanese technical article from repository changes and save it under blog/
name: write-article
argument-hint: Describe the target changes, audience, format, tone, or commit/PR range
agent: ArticleWriterAgent
---

Write a Japanese technical article based on the relevant changes in this repository.

Additional request from the user:
${input:Describe the target changes, audience, format, tone, or commit/PR range}

Instructions:

1. Identify the article scope from the user's input first.
2. If the input does not fully define the scope, infer it from the most relevant recent repository changes, related docs, and current working tree changes.
3. Base the article only on observable facts from code, diffs, and repository documents.
4. Save the final Markdown file under `blog/`.
5. In chat, report the generated file path and the scope you covered.

Output expectations:

- Japanese technical writing
- Clear explanation of background, changes, implementation details, and key learnings
- Minimal filler and no unsupported claims
