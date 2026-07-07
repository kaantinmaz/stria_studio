# SETUP

One-time bootstrap of the wiki from an initial batch of sources.

## Prompt

> You are maintaining the LLM-Wiki in `wiki/` for the Stria Studio project. Read the schema in `wiki/README.md` and follow its hard rules.
>
> 1. For each file I place in `wiki/raw/`, read it fully.
> 2. Extract entities, concepts, decisions, and open issues. Create one page per distinct thing in the right folder (`entities/`, `concepts/`, `decisions/`, `issues/`).
> 3. Cross-link pages with `[[...]]`. Every page ends with a `## Sources` section pointing at its `raw/` file(s).
> 4. Write 1–3 `syntheses/` pages summarizing the big picture.
> 5. Rebuild `index.md` to list everything by category.
> 6. Append one `SETUP` line to `log.md`.
>
> Before writing, show me the list of pages you intend to create and wait for my OK. (Skip this confirmation only if I said "automatic".)

## Notes
- **Controlled** (default): confirm the page plan before writing.
- **Automatic**: run the whole pass without stopping — use only when the sources are trusted.
