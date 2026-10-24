# Wa-Bot — Structure Map

How the bot is organized on disk and how one message flows through it.
Infrastructure source of truth: `tasks/plan.md` (Tasks 1–4). This map
extrapolates that structure to the full feature set; nothing here is
implemented yet.

Related: [PRD](PRD.md) · [Feature list](FEATURES.md) · [AGENTS.md](../AGENTS.md)

## 1. Directory map

```
Wa-Bot/
├── AGENTS.md              agent-facing guidance (verified facts only)
├── README.md              quick start (Task 7)
├── docs/
│   ├── PRD.md             product requirements, charter, metrics
│   ├── FEATURES.md        full feature backlog
│   └── STRUCTURE.md       this file
├── tasks/
│   ├── plan.md            infra implementation plan (phases, AC)
│   └── todo.md            executable checklist for /build sessions
├── .env                   PAIRING_MODE / PHONE_NUMBER / config (gitignored)
├── .env.example           template of the above
├── .gitignore             ignores .session/, .env, data/, node_modules
├── data/                  all bot state lives here (gitignored, local-only)
│   └── state.json         counters, moods, moments, nudge budgets
├── .session/              Baileys auth state (gitignored, NEVER duplicated)
├── src/
│   ├── index.ts           entrypoint: config → connection → dispatcher wiring
│   ├── config.ts          env load + validation, aborts on missing/invalid
│   ├── connection.ts      socket lifecycle: pairing (QR/code), reconnect,
│   │                      conflict handling, single client per auth state
│   ├── messages.ts        pure normalization: extract text, jid/group/mention
│   │                      tags, drop status/self dupes, dedupe by key.id
│   ├── dispatcher.ts      prefix parse + arg split + registry lookup,
│   │                      per-chat mutex (runs one command at a time),
│   │                      error boundary (catch → log → warm error reply)
│   ├── send.ts            THIN SEND LAYER: only file allowed to call
│   │                      sock.sendMessage — future library swap is here
│   ├── pacing.ts          delays, per-chat rate limiter, nudge budget,
│   │                      quiet hours (Anti-Feature Charter enforcement)
│   ├── state.ts           load/save data/state.json with atomic rename;
│   │                      typed accessors per feature namespace
│   ├── copy/              all user-facing strings; TONE CONTRACT LIVES HERE
│   │   ├── index.ts       re-exports per-namespace strings
│   │   ├── core.ts        breathe, hydrate, drank, vibe, compliment copy
│   │   ├── nothing.ts     cocoon / nap / silent copy
│   │   ├── memory.ts      mood / moment / yearbook / wrap copy
│   │   └── chaos.ts       excuse / yell / lament copy
│   └── commands/          every file = ONE command, default-exports handler
│       ├── registry.ts    name → { handler, help, pack, needsMention }
│       ├── builtin/       ping, help, whoami (infra Tasks 3–5)
│       ├── core/          breathe, hydrate, drank, vibe, compliment
│       ├── nothing/       cocoon, touchgrass, touched, nothing, nap, silent
│       ├── memory/        mood, moods, moment, yearbook, countgrass, forget
│       ├── chaos/         excuse, yell, whisper, lament, paradox, songify
│       ├── ambient/       nudge, quiet
│       └── admin/         reconnect, pause, resume, stats (owner only)
└── tests/                 bun tests; pure logic only
    ├── messages.test.ts   normalization edge cases
    ├── dispatcher.test.ts parse/mention policy/error boundary (mock sock)
    ├── pacing.test.ts     rate limits, budget, quiet hours
    └── state.test.ts      atomic save, namespace accessors
```

## 2. Module rules (what may import what)

```
index ──> config, connection, dispatcher, state

commands/* ──> state, copy, pacing, send        (handler imports = this only)
dispatcher ──> commands/registry, messages, send
connection ──> config, send (for conflict notices), pino logger
messages   ──> (nothing: PURE — no Baileys socket access)
send       ──> Baileys socket (sole Baileys consumer besides connection)
pacing     ──> state (budgets/quiet hours read/write)
copy/*     ──> (nothing: strings only)
```

Hard rules:
- Baileys types leak no further than `connection.ts` and `send.ts`.
- A command handler never calls the socket or touches timers directly.
- `copy/` files import nothing; tone review = reading text, not code.

## 3. Message flow (the one path everything takes)

```
WhatsApp device
   │ WebSocket (Baileys, single socket, persistent .session/)
   ▼
connection.ts  ── "connection.update" ──> pairing / reconnect / conflict log
   │ "messages.upsert" (raw)
   ▼
messages.ts ── normalize() ──> BotMessage?        [PURE]
   │              • extract text (conversation/extended/caption)
   │              • tags: isGroup, jid, sender, mentions
   │              • drop: status broadcast, own msg, seen key.id
   ▼
dispatcher.ts
   │  • group policy: mention OR prefix required (plan.md AC)
   │  • admin gate: OWNER only pack
   │  • registry lookup → handler
   ▼
handler (src/commands/<pack>/<cmd>.ts)
   │  • reads writes state via state.ts
   │  • strings only from copy/
   │  • replies via send.ts (quoting source msg)
   ▼
send.ts ── pacing.ts gate (per-chat cooldown / phase ceiling / budget)
   │
   ▼
sock.sendMessage() ──> WhatsApp
```

One command running at a time per chat (async-mutex in dispatcher). If the
process dies mid-`!breathe`, the breathe is over — recovery policy is
"nothing to recover", by design.

## 4. State model (`data/state.json` namespace map)

```
{  users: { <jid>: {
      hydrate: { drank: { "<date>": n } },
      breathe: { sessions: { "<date>": n } },
      grass:   { touched: { "<week>": n } },
      mood:    { <date>: "<word>" },
      moment:  { <date>: "<word>" },
      ambient: { nudge: bool, quietHours: [start,end], lastNudge: date }
   } },
  groups: { <jid>: { optedOutOfRituals?: dates } },
  cooldowns: { <chatJid>: lastSendTs }        // ephemeral-ish, tiny
}
```

Growth path (only if memory pack outgrows JSON): `bun:sqlite` file beside
`state.json`; `state.ts` accessor signatures unchanged, so command handlers
never notice (plan.md § Technical Considerations).

## 5. Data-flow / persistence summary

```
chat msg        ephemeral         not stored
command logs    local JSON        counters only, no message text
mood/moment     local JSON        words only, wiped by !forget
metrics (§7!)   local JSON        never surfaced to users
media (v1.1)    NOT adopted       frozen feature list
anything clouds NEVER             no accounts, no sync, no export
```

## 6. Layer-of-risk summary (what will hurt when Baileys moves)

| Layer | Risk | Containment |
|---|---|---|
| connection.ts | RC churn, reconnect semantics, conflict | one file owns all of it |
| send.ts | API shape changes (7.x ESM import) | verified against installed typings, not blogs |
| messages.ts | payload shape drift in `messages.upsert` | pure + best-tested file |
| commands/*   | none — Baileys-agnostic by construction | module rules above |
