# LINT

Periodic health check of the wiki.

## Prompt

> You are linting the LLM-Wiki in `wiki/`. Follow `wiki/README.md`. This is read-mostly: report first, fix only safe/obvious issues.
>
> Scan the whole wiki and report:
>
> 1. **Contradictions** — pages that disagree on a fact. → flag in `issues/`.
> 2. **Stale claims** — statements a newer source has superseded.
> 3. **Orphan pages** — pages nothing links to.
> 4. **Broken / missing cross-references** — `[[...]]` targets that don't exist.
> 5. **Unsourced claims** — pages missing a valid `## Sources`.
> 6. **Index drift** — pages missing from `index.md` or listed but deleted.
>
> Fix safe issues directly (broken links, index drift, obvious orphans). For anything judgment-heavy (contradictions, stale claims), record it in `issues/` and ask me.
>
> Append one `LINT` line to `log.md` summarizing what was found and fixed.
