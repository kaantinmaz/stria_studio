# Stria Studio — Knowledge Wiki

An LLM-maintained wiki (Karpathy's [LLM-Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)). Knowledge is **compiled once and kept current**, not re-derived on every query. This file is the **schema** — how the wiki is structured and maintained.

## Three layers

1. **Raw sources** (`raw/`) — immutable input documents (specs, transcripts, exports, screenshots-as-notes). Never edited after landing.
2. **The wiki** — LLM-generated, interlinked markdown: entity pages, concept pages, decisions, issues, syntheses.
3. **The schema** — this file + [`CLAUDE.md`](../CLAUDE.md). Defines structure and workflow.

## Layout

| Folder | Holds |
|--------|-------|
| `raw/` | Immutable source docs. One file per source. |
| `entities/` | Concrete things: people, tools, services, DB tables, API endpoints, components. |
| `concepts/` | Patterns, domain ideas, conventions, "how X works here." |
| `decisions/` | Decision records (ADR-style): context → decision → consequences. |
| `issues/` | Open questions, bugs, risks, unknowns. |
| `syntheses/` | Cross-cutting summaries that stitch several pages together. |
| `prompts/` | The operations: `setup`, `ingest`, `query`, `lint`. |
| `index.md` | Catalog of all pages, by category. |
| `log.md` | Append-only timeline of every operation. |

## Page conventions

- **Filename:** `kebab-case.md`. **Title:** `# Title` as first line.
- **Cross-link liberally** with `[[wiki-relative/path]]` or standard markdown links. A link to a page that doesn't exist yet is fine — it flags work to do.
- Every page ends with a `## Sources` section listing which `raw/` file(s) back its claims.
- Keep pages small and single-purpose. Split when a page starts doing two jobs.

## Hard rules

1. **`raw/` is immutable.** Add new sources; never rewrite existing ones.
2. **No unsourced claims.** Every factual statement traces to a `raw/` source or a `decisions/` record.
3. **Update `index.md` and `log.md`** on every ingest/query/lint that changes the wiki.
4. **Contradictions get flagged, not silently overwritten.** Surface them in `issues/`.

## Operations

| Op | When | Prompt |
|----|------|--------|
| **Setup** | Once, to bootstrap | [`prompts/setup.md`](prompts/setup.md) |
| **Ingest** | New source arrives | [`prompts/ingest.md`](prompts/ingest.md) |
| **Query** | Answer a question from the wiki | [`prompts/query.md`](prompts/query.md) |
| **Lint** | Periodic health check | [`prompts/lint.md`](prompts/lint.md) |
