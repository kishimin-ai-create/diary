# Review Codex Instructions

These rules apply inside `review/`.

## Review Files

- Treat files in `review/` as the primary source for reviewer feedback when
  drafting replies or planning fixes.
- Preserve existing reviewer context and do not delete unresolved findings.
- Use repository-relative paths only.
- Do not include local absolute filesystem paths.

## Response Style

- Classify feedback as needing a code fix, a documentation update, or a reply.
- For findings that need code changes, describe the intended fix and validation.
- For findings that only need a reply, explain the reason using requirements,
  ADRs, design documents, or current code behavior.
- Keep responses concise and specific.
