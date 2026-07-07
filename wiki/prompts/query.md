# QUERY

Answer a question from the wiki, and file back anything new you synthesize.

## Prompt

> You are querying the LLM-Wiki in `wiki/`. Follow `wiki/README.md`.
>
> Question: **<your question>**
>
> 1. Search the wiki (`index.md` first, then relevant pages). Read what's relevant.
> 2. Synthesize a direct answer. Cite the wiki pages (and through them, the `raw/` sources) you used.
> 3. If your answer is a durable, reusable insight not already captured, file it as a new `syntheses/` or `concepts/` page and update `index.md`.
> 4. If the wiki can't answer it, say so plainly and record the gap in `issues/`.
> 5. Append one `QUERY` line to `log.md`.
>
> Never invent facts. If it's not in the wiki or a source, say it's unknown.
