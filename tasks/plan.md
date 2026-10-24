# Implementation Plan: Wa-Bot (Baileys WhatsApp command bot, v1)

## Overview

Build v1 of a command-based WhatsApp bot ("Wa-Bot") using Baileys, written in
TypeScript running on Bun (ESM). The bot links to a WhatsApp account on first
run via QR code *or* phone pairing code (env-selected), persists its session
across restarts, and responds in private chats and groups to text commands
(`!ping`, `!help`, `!whoami`). Everything unrequested (media/DB/plugins) is
explicitly out of v1 scope.

## Requirement decisions (user-confirmed)

- Purpose: command bot, reactive only (no proactive/bulk sends).
- Runtime: Bun + TypeScript + ESM. Logging via `pino` (Baileys itself uses
  pino — one logging library, not two).
- Scope: all chats it is part of, including groups. In groups the bot answers
  only when mentioned or when a message carries the command prefix.
- Pairing: both modes, env-selected (`PAIRING_MODE=qrcode|code` +
  `PHONE_NUMBER` for code mode).

## Architecture Decisions

- **Baileys version:** pin `@whiskeysockets/baileys@7.0.0-rc14` (current
  `latest`). 7.x is pure ESM — under Node ESM the default-import shape is a
  recurring foot-gun (`require()` / `.default` examples online are stale).
  Under Bun, CJS/ESM interop is handled by Bun's resolver; verify the import
  shape with a smoke script rather than copying examples.
- **Bun risk isolated early:** Baileys 7.x pulls native-ish deps
  (`libsignal@^6`, `whatsapp-rust-bridge`). `bun install` + a bare
  `import makeWASocket` smoke test is Task 1 output. If Bun breaks here,
  fallback is Node 20+ as runtime (same codebase, ESM works either way) —
  decision point before any Baileys work proceeds.
- **Session/auth:** `useMultiFileAuthState('.session')`, `.session/` and
  `.env` gitignored. Single client per auth state (two clients on the same
  state ⇒ `Stream Errored (conflict)` logout).
- **Structure:**
  ```
  src/
    index.ts        entrypoint: wire config → connection → dispatcher
    config.ts       .env load/validation (plain TS, no zod in v1)
    connection.ts   socket lifecycle, pairing, reconnect policy
    messages.ts     normalize messages.upsert → BotMessage (pure functions)
    commands/       index.ts (registry + dispatcher, reply helper)
                    ping.ts help.ts whoami.ts
  tests/            bun tests for pure logic only (normalize, parse, dispatch)
  ```
- **Testing:** `bun test`; only pure logic is unit-tested (Baileys I/O can't
  be unit-tested meaningfully — verified manually end-to-end).

## Task List

### Phase 1: Bootstrap & connection
- [ ] Task 1 — Project scaffold + Baileys-on-Bun smoke test
- [ ] Task 2 — Connection lifecycle: pairing (QR + code) and reconnect policy

**Checkpoint 1:** bot is paired via chosen mode, restart reconnects without
re-pairing, typecheck + `bun test` green. Human confirms session survived.

### Phase 2: Message handling & commands
- [ ] Task 3 — Message normalization (text extraction, jid/group/mention,
      self-message + status-broadcast filtering, dedupe by key.id)
- [ ] Task 4 — Command framework: prefix parsing, arg splitting, registry,
      reply helper (quote context), per-command error catch
- [ ] Task 5 — Built-ins: `!ping` (latency), `!help`, `!whoami`

**Checkpoint 2:** end-to-end — phone sends `!ping` in a private chat and in a
group (mention + plain prefix cases), bot replies correctly in each.

### Phase 3: Polish
- [ ] Task 6 — Config hardening: validated env at boot, group-response policy
      flag, simple per-chat send cooldown (ban-safety rail)
- [ ] Task 7 — Docs: README quick start; update AGENTS.md with verified
      commands + new gotchas (import shape, reconnect behavior)

**Checkpoint 3:** all acceptance criteria met, ready for review.

## Task details

- **Task 1 — Scaffold (depends: none)**
  Files: `package.json`, `tsconfig.json`, `bunfig.toml` (optional), `.gitignore`,
  `.env.example`, `src/index.ts` (empty entry). Deps: baileys, pino,
  qrcode-terminal; dev: typescript, @types/node.
  AC: `bun install` clean; `bun run typecheck` green; smoke file
  `bun run src/smoke.ts` imports `makeWASocket` and exits 0; git initialized
  with `.session/` + `.env` ignored.
- **Task 2 — Connection (depends: 1)**
  Files: `src/config.ts`, `src/connection.ts`, `src/index.ts`.
  AC: `PAIRING_MODE=qrcode` prints QR in terminal; `=code` prints pairing code
  from `PHONE_NUMBER`; disconnects reconnect with backoff unless reason is
  `loggedOut`; restart reuses `.session/` with no re-pairing.
  Verify: manual pair + one restart.
- **Task 3 — Normalize (depends: 2)**
  Files: `src/messages.ts`, `tests/messages.test.ts`.
  AC: extracts text from conversation/extendedText/caption payloads; tags
  `isGroup`, sender jid, mention list; drops status broadcasts and own msg
  dedupe by `key.id`; unit tests cover these paths.
- **Task 4 — Command framework (depends: 3)**
  Files: `src/commands/index.ts`, `tests/commands.test.ts`.
  AC: prefix (`!`) parse + arg split; registry maps name→handler; reply helper
  quotes src message; in groups, only mentions or prefixed messages reach
  handlers; handler exceptions are caught, logged, and answered with an error
  reply; mocked-sock tests for dispatch.
- **Task 5 — Built-ins (depends: 4)**
  Files: `src/commands/{ping,help,whoami}.ts`.
  AC: `!ping` replies measured round-trip; `!help` auto-lists registry;
  `!whoami` shows chat type + jid + sender. **Manual E2E: all three in private
  and in a group.**
- **Task 6 — Hardening (depends: 5)**
  Files: `src/config.ts`, `src/commands/index.ts`.
  AC: missing/invalid env aborts with clear message; `GROUP_RESPONSE` policy
  flag; per-chat minimum send interval; all covered by unit tests where pure.
- **Task 7 — Docs (depends: 6)**
  Files: `README.md`, `AGENTS.md`.
  AC: README quick start matches actual commands; AGENTS.md records verified
  gotchas discovered during build (replaces speculative notes).

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Baileys native deps broken under Bun | High | Smoke-import in Task 1; fallback: run same code under Node 20+ |
| Stale examples ⇒ wrong ESM default-import shape | Medium | Verify against installed `node_modules` typings in Task 1 |
| Baileys is a RC line + maintenance winding down; WhatsApp breaks it without warning | Medium | Pin exact version; treat upgrades as deliberate, not routine |
| Account ban from automation | High | Reactive-only design, cooldown rail (Task 6), no bulk sends — standing rule |
| Session conflict on accidental second client | Medium | `.session/` gitignored; explicit "stop other client" message on conflict logout |

## Open Questions

- Commands beyond `ping/help/whoami`: **answered by `docs/PRD.md`** (self-care
  feature pack). Product roadmap lives there; infra tasks below unaffected.
- Never needs a database in v1 — revisit if message logs or plugin state arrive.
- Hosting target (local vs server) — affects only docs/, not v1 code.
