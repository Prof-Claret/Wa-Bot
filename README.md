# Wa-Bot

A uselessly helpful self-care WhatsApp bot, on purpose. It breathes with you,
reminds you to drink water, gives you homework you cannot fail, and is proud
of you for doing nothing. Built on [Baileys](https://github.com/WhiskeySockets/Baileys)
(runs on [Bun](https://bun.sh), falls back to Node 20+).

> **This is a toy, not a treatment.** No streaks, no scores, nothing to win.

- Product & requirements: [`docs/PRD.md`](docs/PRD.md)
- Full feature backlog: [`docs/FEATURES.md`](docs/FEATURES.md)
- Architecture / structure map: [`docs/STRUCTURE.md`](docs/STRUCTURE.md)
- Implementation plan & tasks: [`tasks/plan.md`](tasks/plan.md), [`tasks/todo.md`](tasks/todo.md)

## Quick start

Requires [Bun](https://bun.sh) (or Node 20+).

```sh
bun install            # first run: bun asks to trust 2 lifecycle scripts → bun pm trust --all
cp .env.example .env   # then edit: PAIRING_MODE, PHONE_NUMBER (for code mode), OWNER
bun run smoke          # sanity: Baileys loads under Bun (no network pairing)
bun start              # links to WhatsApp: scan QR, or receive a pairing code
```

- **Pairing** — `PAIRING_MODE=qrcode`: scan the terminal QR from WhatsApp →
  Settings → Linked devices. `PAIRING_MODE=code`: set `PHONE_NUMBER` and type
  the code WhatsApp offers you. The session persists in `.session/` — never
  run two clients on it ([AGENTS.md](AGENTS.md) explains why).
- **Chat** — prefix commands with `!` (`!help` lists everything). In groups the
  bot answers prefixes or mentions of itself, never chatter.
- **Develop** — `bun run dev` (watch), `bun test`, `bun run typecheck`.

## The v1 command set

| Pack | Commands |
|---|---|
| tiny comforts | `!ping` `!breathe [1–8]` `!hydrate` `!drank` `!vibe` `!compliment` |
| doing nothing | `!cocoon [5–30]` `!nap` `!touchgrass` `!touched` |
| tiny memory | `!mood` `!moods` `!moment` `!yearbook` `!countgrass` `!forget` |
| strange comfort | `!excuse` `!yell` `!whisper` `!lament` |
| owner corner | `!pause` `!resume` `!stats` |

## Safety model

- **Reactive-only**: the bot speaks when spoken to (plus one opt-in nudge
  concept, not yet implemented). No bulk sends, ever.
- **Local-only state**: counters and one-word logs in `data/state.json`.
  Nothing syncs, nothing uploads. `!forget` wipes a user with no backups.
- **Ban-safety**: minimum send interval per chat (`MIN_SEND_INTERVAL_MS`),
  paced ceremonies, and Baileys is WhatsApp-Web automation, not a sanctioned
  API — keep volume human (see AGENTS.md).

## Status

v0.1 — infrastructure complete (pairing, reconnect, normalization, dispatch,
tests). Product waves 1+ of [`docs/PRD.md`](docs/PRD.md) partially landed
through the "doing nothing" pack; ambient nudges, `!wrap`, and stickers are
frozen for later. See `tasks/todo.md` for execution state.
