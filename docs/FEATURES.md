# Wa-Bot — Feature List

Complete backlog of every feature considered for Wa-Bot. Two will not survive
contact with the [Anti-Feature Charter](PRD.md#3-product-principles-the-anti-feature-charter)
unless they pass all six rules: cannot be failed · nobody's watching · nudging
is opt-in & rare · celebrates subtraction · warm, never clever · reactive-only.

Status legend: ✅ Planned (PRD Must) · 🔜 Next (Should) · 💭 Later (Could) ·
🧊 Frozen (v1.1+) · 🚫 Rejected (charter violation)

Related: [PRD](PRD.md) · [Structure map](STRUCTURE.md) · [Infra tasks](../tasks/todo.md)

## Core Comfort ✅ — on top of infra (`!ping` `!help` `!whoami` from tasks/plan.md)

| Command | What it does |
|---|---|
| `!ping` | Infra health check; measures reply latency |
| `!breathe [1–8]` | Paced box-breathing sequence, one message per phase, celebratory no-points ending |
| `!hydrate` | One warm water prompt (5-min deflection on repeat) |
| `!drank` | Daily water logged; always succeeds; reply is disproportionate ceremony |
| `!vibe` | Deterministic daily soul-forecast, full sentences, per person/day |
| `!compliment <text>` | Bot officiates your self-compliment, logs that it happened |

## Doing Nothing 🔜 — flagship pack

| Command | What it does |
|---|---|
| `!cocoon [5–30]` | Bot "puts you away" for N minutes of protected nothing; no messages during; emerges proud |
| `!touchgrass` | Assigns 2-min-low-stakes outside-touch homework |
| `!touched` | Always accepted, never verified, immediately praised |
| `!nothing` | 60-second demo of doing nothing together. One message in, one out |
| `!nap` | `!cocoon` but with a pillow metaphor and a hand-drawn zZZ ASCII on wake |
| `!silent <topic>` | Bot declares 5 min of group silence about an over-discussed topic ("we are done with the THING,") |

## Tiny Memory 💭 — local JSON only, ≤ 1 line/day/user

| Command | What it does |
|---|---|
| `!mood <word>` | One 6-char-or-less word per day, later same-day words replace |
| `!moods` | Month view rendered as ASCII mood wall ("cloudy mid-week") |
| `!moment <word>` | One word about today, for later |
| `!yearbook` | Replays your logged moments as a vibes yearbook |
| `!countgrass` | Weekly count of touched grass, framed as "proof you existed" |
| `!wrap` | Weekend un-recap: counts of hydrate/breathe/cocoon/touched (v1.1) |
| `!forget` | Wipes your logged data. No backup kept. |

## Chaos Comfort 💭 — the joke pack

| Command | What it does |
|---|---|
| `!excuse [thing]` | Absurd excuse generator for not doing the thing |
| `!yell <text>` | Bot absorbs your shout, melts it, whispers one calm word back |
| `!whisper <text>` | The quiet variant for when even shouting is too much |
| `!lament` | Bot laments *with* you about absolutely nothing specific. Solidarity is non-verbal |
| `!paradox` | Tells you to relax, twice, in an escalating unhelpful spiral, then just breathes with you |
| `!songify <text>` | Renders your sentence as dramatic lyrics with one wrong rhyme (no audio in v1) |

## Ambient 💭 — bounded, gentle, off by default

| Command | What it does |
|---|---|
| `!nudge on` / `!nudge off` | Opt-in: ≤ 1/day at a random gentle time, "hi. nothing's wrong. that's it." Hard-capped budget |
| `!quiet <start> <end>` | Personal quiet hours the bot obeys absolutely, even in groups |

## Group Rituals 💭 — mention-only, group opt-in

| Command | What it does |
|---|---|
| `!vibe @group` | Group-wide vibe forecast: one forecast for everyone, no per-person ranking |
| `!peace` | Declares the group chat "peaceful" for the rest of the hour. It is non-binding |
| `!buddy @user` | Pairs you with the other person the bot is also bothering — mutually, rarely, kindly |

## Admin 🚧 owner-only — housekeeping, not features

| Command | What it does |
|---|---|
| `!reconnect` | Graceful socket reconnect without full restart |
| `!pause` / `!resume` | Mute the bot in all chats; sessions structure stays warm |
| `!stats` | Owner's view of the §7 metrics locally, not shown to users |

## Rejected by charter 🚫 — listed so we don't relitigate

- **Streaks / badges / leaderboards** — converts rest to performance (US-2 rule 1)
- **Mood analytics charts with trends** — points at you with a laser (rule 2)
- **AI chat companion** — needs cloud, becomes another open loop (rule 3)
- **Deployment of good habits with punishments** — whole premise is no-fail
- **Auto-replies to work messages ("send on my behalf")** — productivity feature; out
- **Smart reminders to do tasks** — the bot is the *opposite* of a reminder app

## Frozen / speculative 🧊

- Sticker pack ("touchgrass you've been deployed", "you're valid" glb) — needs media pipeline, deferred to Wave 4
- Voice-note mode for `!breathe` — cheap on Bandwidth, expensive on tone review
- `!soundtrack` — weekly moment playlist card from `!moment` logs; cute, needs design pass
- Vacation mode (`!vacation`) — bot replies "message received, vibe accepted, not now" to everything
