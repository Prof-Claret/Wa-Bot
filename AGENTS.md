# AGENTS.md — verified facts only

## Setup / run / test

- Runtime: **Bun** (tested on 1.4.3; Node 20+ also works, per Baileys `engines`).
- First-install caveat: Bun blocks Baileys' preinstall (engine check) and one protobuf postinstall — **run `bun pm trust --all`** after the first `bun install`.
- Commands: `bun run smoke` (import sanity, no network) · `bun test` · `bun run typecheck` · `bun start` (real pairing) · `bun run dev` (watch).
- The bot needs a real WhatsApp link (QR scan, or `PAIRING_MODE=code` + `PHONE_NUMBER`). Sessions persist in `.session/` — sacred; **never run two processes on it.**
- Disconnect reality (verified against `DisconnectReason` enum): there is no `conflict` member; the real cases are `401 loggedOut` (auth wiped → restart to re-pair) and `440 connectionReplaced` (second client on session → exit with guidance).

## Baileys import shape (verified against installed 7.0.0-rc14 typings, not blogs)

- `import makeWASocket, { Browsers, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState } from '@whiskeysockets/baileys'` — a default export plus named re-exports, all at the package root (`lib/index.d.ts` re-exports Utils/Types/Defaults).
- `messages.upsert` items are typed `WAMessage` (`proto.IWebMessageInfo & {...}`) — not `proto.WebMessageInfo`.
- `sock.user` is a `Contact` with `.name`/`.id` — there is no `pushName` in 7.x typings.
- `printQRInTerminal` is gone in 7.x — render the QR yourself (`qrcode-terminal`) in the `connection.update` `qr` branch.

## Architecture (full map: `docs/STRUCTURE.md`)

- Only `connection.ts` and `send.ts` touch the Baileys socket; `send.ts` is the *thin send layer* — library API changes are contained there.
- `src/messages.ts` is pure and unit-tested; `src/dispatcher.ts` enforces group policy (prefix or bot-mention; `prefix-only` env), the owner gate, and a per-chat mutex; ceremonies (breathe/cocoon/…) bypass chat pacing deliberately via `send.sendPhase` — their spacing IS the pacing.
- All user-facing copy lives in `src/copy/*` (tone contract: `docs/PRD.md` §6). Strings-only files that import nothing.
- All state is local JSON through `src/state.ts` (`data/state.json`, atomic rename; local-only per PRD charter — no exports, no cloud).
- Product roadmap: `docs/PRD.md` + `docs/FEATURES.md`; execution state: `tasks/todo.md`.
- Ban-safety standing rule: reactive-only, no bulk sends. Don't add features that violate the PRD Anti-Feature Charter (§3).
