# No Hardcoded Local Paths

Committing absolute filesystem paths or local environment information is
**prohibited** in all files tracked by git.

## Why

- Absolute paths are machine-specific and break reproducibility across
  environments and contributors.
- Paths containing usernames or local directory structures reveal personal
  environment details.
- Local paths in documentation or review files mislead contributors and create
  noise in code review.
- Paths like `C:\Users\YourName\...` will silently point to a non-existent
  location on every other machine.

## Rule

| Prohibited | Required instead |
|---|---|
| `C:\Users\YourName\Desktop\project\backend\src\foo.ts` | `backend/src/foo.ts` |
| `C:/Users/YourName/projects/app/...` | Relative path from project root |
| `/home/username/projects/app/...` | Relative path from project root |
| `/Users/username/Documents/app/...` | Relative path from project root |
| Machine-specific hostname in committed config | Generic placeholder or env var |

## Scope

This rule applies to **ALL files tracked by git**, including:

- Source code (`.ts`, `.tsx`, `.js`, `.jsx`, etc.)
- Documentation (`.md` files: `README.md`, `review/`, `blog/`, `diary/`, `docs/`)
- Configuration files (`.json`, `.yml`, `.yaml`, `.env.example`, etc.)
- Agent definitions (`.github/agents/`)
- Rule files (`.github/rules/`)

### ✅ Relative paths are always acceptable

Paths relative to the project root (e.g., `backend/src/infrastructure/hono-app.ts`,
`./config`, `../rules/git.rules.md`) are always permitted and preferred.

### ✅ Exceptions

- `.gitignore` entries — patterns may reference absolute path fragments for
  clarity.
- Generated files that are **not tracked** by git (e.g., build artifacts,
  test reports, `storybook-static/`).
- `vite.config.ts` proxy config referencing `localhost` for local dev convenience
  (already covered by `no-hardcoded-urls.rules.md`).

## Detection

Before committing, verify no absolute paths with local usernames appear in
staged files:

```bash
# Windows (PowerShell)
git diff --cached | Select-String -Pattern "C:[/\\]Users[/\\]|/home/[A-Za-z]|/Users/[A-Za-z]"

# Unix
git diff --cached | grep -E "C:[/\\]Users[/\\]|/home/[A-Za-z]+/|/Users/[A-Za-z]+/"
```

## Enforcement

- Code review must reject any PR that introduces absolute filesystem paths
  containing local usernames or machine-specific directory structures.
- When writing review files, blog posts, diary entries, or documentation —
  always use project-root-relative paths, not filesystem absolute paths.
- Agents generating files must use relative paths in all output.
