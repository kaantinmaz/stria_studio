# CLAUDE.md — Stria Studio

Guidelines for any LLM/agent working in this repo. These bias toward **caution over speed**: a wrong change that looks right costs more than a clarifying question.

## 1. Think Before Coding

- State assumptions explicitly. If a requirement is unclear, ask — don't guess silently.
- Surface confusion instead of papering over it. A silent decision you got wrong is expensive.
- When there's a real tradeoff, present the options and your recommendation before committing.

## 2. Simplicity First

- Build the minimum that works. No speculative features, no "flexibility for later."
- Prefer the standard library / native platform feature / one line over custom machinery.
- No interface with one implementation, no config for a value that never changes.

## 3. Surgical Changes

- Match the existing patterns, naming, and style of the code you touch.
- No unrelated refactoring. Stay on the task.
- Only remove code your own change made dead. Don't delete what you didn't break.

## 4. Goal-Driven Execution

- Turn each requirement into a testable objective with a verification checkpoint.
- Prove it works (run it / test it) before claiming done. Evidence before assertions.
- Iterate against the goal, not against a vague sense of progress.

**Success looks like:** fewer unnecessary diffs, fewer rewrites, clarifying questions asked earlier.

---

## Project Facts

| | |
|---|---|
| **Product** | Stria Studio website |
| **Frontend** | Next.js + Tailwind CSS |
| **Backend** | Laravel |
| **Database** | MySQL |
| **Design source** | Claude design `Stria Studio - Minimal.dc.html` |

### Local DB (MAMP)

```
Database: stria_studio
User:     root
Password: root
Host:     127.0.0.1
Port:     8889
```

> MAMP's MySQL binary/socket lives under `/Applications/MAMP/Library/bin/`. The `mysql` CLI is not on the default PATH.

---

## Knowledge Wiki

This repo keeps an **LLM-maintained wiki** under [`wiki/`](wiki/README.md) — a persistent, interlinked knowledge base that compounds over time instead of being re-derived every query.

- Read [`wiki/README.md`](wiki/README.md) for the schema and hard rules.
- Browse [`wiki/index.md`](wiki/index.md) for the catalog.
- Operations live in [`wiki/prompts/`](wiki/prompts/): `setup`, `ingest`, `query`, `lint`.

When you learn something durable about this project (a decision, an entity, a concept, an open issue), **file it in the wiki** — don't let it evaporate into chat history.
