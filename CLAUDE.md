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

## 5. Model Routing (project policy)

**Fable 5** (the session model) is the *thinking* layer: planning, architecture, decomposition, review, and integration. **Coding and detail work is always delegated** to one of:

| Delegate | How | Use for |
|---|---|---|
| **Codex 5.6** (`gpt-5.6-sol`) | `codex exec --skip-git-repo-check -m gpt-5.6-sol -c model_reasoning_effort=high --sandbox workspace-write --full-auto "<brief>"` (read-only sandbox for review lanes) | Parallel lanes/fleets, mechanical multi-file edits, isolated implementation briefs |
| **Opus 4.8** | `claude -p --model opus "<brief>"` (Claude Code CLI, non-interactive) | High-stakes single edits, nuanced refactors, code review |

Rules:
- The orchestrator (Fable 5) writes the brief, defines acceptance criteria, and **verifies the delegate's output itself** (run tests/build). Delegate completions are claims, not evidence.
- Independent briefs fire in parallel (background), never serially.
- Trivial one-liners (typo, config value) may be done inline — don't spawn a delegate for a 1-line diff.

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
