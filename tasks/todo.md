# Task list — Wa-Bot v1 (plan: tasks/plan.md)

Execution state after the first build session (all verified by `bun run typecheck`, `bun test`, `bun run smoke`):

- [x] Task 1 — Project scaffold + Baileys-on-Bun smoke test (Phase 1)
  - bun init, pinned `@whiskeysockets/baileys@7.0.0-rc14`, tsconfig strict, `bun pm trust --all` (postinstall caveat), smoke passes
- [x] Task 2 — Connection lifecycle: pairing (QR + code) and reconnect policy (Phase 1)
  - QR renders in terminal (verified boot); pairing-code path implemented; backoff reconnect; loggedOut → wipe+exit; session-conflict → exit with guidance
- [x] Task 3 — Message normalization (Phase 2)
  - `src/messages.ts` pure; dedupe by key.id; status/self/protocol-frame filters; text variants + mention tags
- [x] Task 4 — Command framework (Phase 2)
  - registry, prefix/mention parse, per-chat mutex, owner gate, error boundary with warm hiccups reply
- [x] Task 5 — Built-ins `!ping` `!help` `!whoami` (Phase 2) — implemented; **manual E2E pending human pairing**
- [x] Task 6 — Config hardening + ban-safety rails (Phase 3)
  - validated env (abort on invalid), `GROUP_RESPONSE` policy, per-chat `MIN_SEND_INTERVAL_MS` pacing, ceremonies paced by phase spacing
- [x] Task 7 — README + AGENTS.md updated with verified facts (Phase 3)
- [ ] PRD Wave 1 remainder → shipped with v0.1 (core comfort + nothing/memory/chaos packs; ambient nudge, `!wrap`, stickers frozen per docs/FEATURES.md)
- [ ] Checkpoint 1 (human) — pair with a real phone, confirm session survives restart
- [ ] Checkpoint 2 (human) — `!ping`/`!breathe`/`!vibe` in a private chat AND a group (mention + prefix cases)

27 unit tests / 5 files pass. Nothing speculative remains in AGENTS.md.
