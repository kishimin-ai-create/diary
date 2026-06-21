# Review Responses — 20260621.md

## Finding 1: Remove the BOM from Codex TOML agents

**Disposition:** fixed

> **Original comment:**
> All newly added `.codex/agents/*.toml` files start with a UTF-8 BOM before `name`; standard TOML
> parsing rejects that byte (for example, Python `tomllib` reports `Invalid statement` at line 1,
> column 1), so these project-scoped Codex agents cannot be loaded. Remove the BOM from the generated
> files so the first byte is the `n` in `name`.

**Reply:**
Thank you for catching this. The issue was reproducible: the TOML files started with `EF BB BF`
before `name`, which made strict TOML parsing fail. The BOM has been removed from every
`.codex/agents/*.toml` file, and the files now parse successfully with Python `tomllib`.

> Fixed by Codex fallback after FixAgent delegation was unavailable — all `.codex/agents/*.toml`
> files now start with `name =` and parse as TOML.

---

## Finding 2: Point agents at the actual requirements directory

**Disposition:** fixed

> **Original comment:**
> This instruction sends future agents to `docs/requirements/`, but this same commit adds the
> requirement files under `docs/v1/requirements/` and there is no `docs/requirements` directory. Tasks
> that follow this source-of-truth rule will miss the product requirements or conclude they are
> absent, so update the path or add the expected directory.

**Reply:**
Agreed. The repository currently has `docs/v1/requirements/`, not `docs/requirements/`, so the
agent instructions were pointing future work at a non-existent source-of-truth path. The root
`AGENTS.md` and `docs/AGENTS.md` now reference `docs/v1/requirements/`, and the stale
`docs/requirements` references no longer appear in the checked instruction paths.

> Fixed by Codex fallback after FixAgent delegation was unavailable — updated `AGENTS.md` and
> `docs/AGENTS.md` to point at `docs/v1/requirements/`.

---

## Finding 3: Restore the corrupted reaction placeholders

**Disposition:** fixed

> **Original comment:**
> The review template now tells CodeReviewAgent to emit mojibake (`総 / 綜`) instead of the intended reaction symbols, so generated review files will contain unreadable feedback prompts. This encoding corruption appears throughout the updated agent docs, so restore the original UTF-8 characters rather than committing the garbled bytes.

**Reply:**
Confirmed. The CodeReviewAgent review template contained corrupted reaction placeholders in all
three priority examples. Those prompts now use the intended readable symbols: `Useful? React with
👍 / 👎.`

> Fixed by Codex fallback after FixAgent delegation was unavailable — updated
> `.github/agents/CodeReviewAgent.agent.md` reaction prompts.

---

*Response file generated: 2026-06-22*
*Findings processed: 3 (3 fixed)*
