# INGEST

Fold a new source into the wiki.

## Prompt

> You are maintaining the LLM-Wiki in `wiki/`. Follow `wiki/README.md`.
>
> A new source has landed in `wiki/raw/<file>`. Do NOT edit it.
>
> 1. Read the new source fully.
> 2. Update or create the affected wiki pages (typically 5–15 across `entities/`, `concepts/`, `decisions/`, `issues/`). Merge into existing pages where they exist; create new ones otherwise.
> 3. If the source contradicts an existing claim, do NOT silently overwrite — record the conflict in `issues/` and flag both sources.
> 4. Fix and add cross-links. Update each touched page's `## Sources`.
> 5. Update `index.md` for any new/renamed pages.
> 6. Append one `INGEST` line to `log.md` naming the source and the pages touched.
>
> End with a short report: pages created, pages updated, conflicts flagged.
