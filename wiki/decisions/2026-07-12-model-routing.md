# Decision: Model routing — Fable 5 thinks, Opus 4.8 / Codex 5.6 code

**Date:** 2026-07-12
**Status:** Accepted (owner directive, this session).

## Context

The project runs in the Oh My Pi harness with **Fable 5** (`anthropic/claude-fable-5`) as the session model. The owner wants a fixed division of labor for all work in this repo: Fable 5 handles thinking, planning, and orchestration; coding and detail-level implementation is always delegated to a stronger coding model.

Available delegates verified on this machine:
- **Codex CLI 0.144.1**, default model `gpt-5.6-sol` ("Codex 5.6"), repo already `trusted` in `~/.codex/config.toml`.
- **Claude Code CLI 2.1.207** for **Opus 4.8** (`claude -p --model opus`).

## Decision

1. **Fable 5** = orchestrator only: scoping, decomposition, briefs, acceptance criteria, integration, verification.
2. **Coding + detail work** → delegate:
   - **Codex 5.6** (`codex exec -m gpt-5.6-sol -c model_reasoning_effort=high`) for parallel lanes, mechanical multi-file edits, isolated briefs. `--sandbox workspace-write --full-auto` for write lanes, `read-only` for review lanes.
   - **Opus 4.8** (`claude -p --model opus`) for high-stakes single edits, nuanced refactors, code review.
3. Orchestrator verifies delegate output itself (tests/build) — delegate "done" is a claim, not evidence.
4. Independent briefs run in parallel (background). Trivial 1-line diffs may be done inline.

## Consequences

- Codified in [`CLAUDE.md`](../../CLAUDE.md) §5 so every future session applies it without being told.
- The `codex-fleet` skill's `gpt-5.5` default is overridden by this policy: this project uses `gpt-5.6-sol`.
- Delegation adds a brief-writing step per task; acceptable per the owner's quality-over-speed bias.

## Sources

Owner directive (session 2026-07-12); `~/.codex/config.toml` (model `gpt-5.6-sol`, trusted project entry); `codex --version` = 0.144.1; `claude --version` = 2.1.207.
