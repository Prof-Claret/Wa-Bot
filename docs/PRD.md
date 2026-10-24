# PRD: Wa-Bot — The Most Uselessly Helpful Bot in Your Chats

**Status:** Draft v1 · **Date:** 2026-10-24 · **Owner:** repo owner (scarlet)
**Companion docs:** `tasks/plan.md` (v1 infrastructure),
[`FEATURES.md`](FEATURES.md) (full backlog),
[`STRUCTURE.md`](STRUCTURE.md) (directory + message-flow map)

> **One-liner:** A WhatsApp bot whose features are all — by design — forms of
> self-care that do absolutely nothing to make you productive. It breathes
> with you, reminds you to drink water, gives you homework instructions you
> cannot fail, and celebrates you for doing nothing.

---

## 1. Executive Summary

Self-care on the internet has been productified into guilt: streak counters,
mindfulness apps that notify you about your mindfulness score, wellness apps
that fight for your notifications like every other addiction. The space between
you and "I just sat outside for two minutes" is usually an app you have to open,
an account you have to make, and a leaderboard you quietly lost.

**Wa-Bot** takes the opposite approach. It lives in the one place people
actually check every day — WhatsApp — and does *useless* things there, gently.
Every feature is reactive (it never nags unless you invite it to, once), has no
metric attached to it, cannot be failed, and celebrates inaction. "Useless"
is the philosophy, not a joke: a feature is a success if using it changed
nothing measurable except how the rest of your next ten minutes felt.

This PRD covers the product feature set on top of the infrastructure plan in
`tasks/plan.md` (Baileys on Bun, pairing, command framework). Infra tasks 1–4
of that plan are unchanged by this document; this PRD replaces the
"commands beyond !ping/!help/!whoami" portion of the roadmap.

## 2. Problem Statement

- Self-care tools demand attention *to* themselves — another open-loop task.
- Streaks, badges and reminders convert rest into performance, which is the
  opposite of rest.
- People are already in WhatsApp all day; getting them into a dedicated calm
  app is the highest-friction step in every existing wellness product.
- Small friend groups want a low-stakes mascot: something to @ that does
  something warm, silly, and harmless. There is no good purpose-built tool.

## 3. Product Principles (the "Anti-Feature Charter")

Every feature must pass all six. The charter overrides feature enthusiasm.

1. **Cannot be failed.** No streaks, no scores that drop, no guilt states.
2. **Nobody's watching.** All state stays in the local JSON store on the bot
   host; nothing syncs, nothing uploads, nothing scores you.
3. **Nudging is opt-in and rare.** The bot speaks only when spoken to, except
   for the single ambient feature, which is off by default.
4. **Celebrates subtraction.** Features should reward doing less, not more.
5. **Warm, never clever.** Tone per §6. No snark at the user, ever.
6. **Reactive-only.** No bulk sends, no timeouts-as-features, ban-safe by
   design per `AGENTS.md`.

## 4. Target Users & Personas

| Persona | Description | Primary use |
|---|---|---|
| **The Decompresser** (primary) | Individual (likely the owner) who lives in their DMs, wants zero-friction micro-moments of doing nothing | Private chat: breathe, hydrate, vibe check |
| **The Group Comforter** | Friend group (5–30 people) that wants a shared, gentle mascot they can @ when anyone's having a day | Group chat: @Wa-Bot vibe, compliments, roommate peacekeeping rituals |
| **The Skeptical Bystander** | A friend in the group who thinks the bot is pointless | Their verdict matters: they are the stickiness test. If they use it "ironically" more than once a week, it's working |

## 5. Features & Priorities (MoSCoW)

### 5.1 Feature table

| # | Feature (command) | What happens | Pack | Priority |
|---|---|---|---|---|
| F1 | **!breathe [cycles]** | Bot sends a paced guided-breathing sequence (box / 4-7-8), one message per phase with real typing-style delays | Core | **Must** |
| F2 | **!hydrate / !drank** | `!hydrate` tells you to drink water. `!drank` declares it done — reply is ceremonial, warm, disproportionate to the effort required | Core | **Must** |
| F3 | **!vibe** | Bot reports your vibe like a weather forecast of the soul ("For you: overcast hints of coffee, clearing by evening. No umbrella needed.") — deterministic per person per day in v1 | Core | **Must** |
| F4 | **!compliment** | You write a self-compliment; the bot officiates it ("Noted. Minutes taken. Unanimous.") and logs that it happened once | Core | **Must** |
| F5 | **!cocoon [minutes]** | Flagship anti-product: bot "puts you away" for 5–30 min, then emerges to say you did nothing, and is proud. No timer spam during the window | Core | **Should** |
| F6 | **!touchgrass / !touched** | Bot assigns low-stakes outside-touching homework ("2 min on the balcony counts"). `!touched` is always accepted, no verification, immediately praised | Core | **Should** |
| F7 | **!mood <word> / !moods** | One-word mood log per user; `!moods` renders that month as a tiny ASCII wall ("cloudy mid-week") | Memory | **Should** |
| F8 | **!moment <word> / !yearbook** | `!moment` records one word about today; `!yearbook` replays your logged moments like a school yearbook of vibes | Memory | Could |
| F9 | **!excuse** | Absurd excuse generator for not doing any given thing ("Ast Visa status: pending.") | Chaos | Could |
| F10 | **!yell / !whisper** | `!yell <text>`: bot absorbs your shouting, melts it down, whispers back one calm word. You shout; void comes out softer | Chaos | Could |
| F11 | **Ambient nudge** (opt-in) | Off-key default: at most 1/day, random gentle time from the user's quiet hours: "hi. nothing's wrong. that's it." | Ambient | Could |
| F12 | **!wrap** | Weekly "un-recap": counts of hydrates, breathes, touched-grass, cocoons — framed as proof you existed, never as performance | Memory | Won't (v1.1) |

### 5.2 User stories (Must-pack, full acceptance criteria)

**US-1: !breathe**
As the Decompresser,
I want a guided breathing sequence in my DMs,
so that I can do a breath-work moment of no new information.

Acceptance criteria:
- [ ] `!breathe` runs a default 4-cycle box-breathing sequence: `in 4s → hold
      4s → out 4s → hold 4s`, each phase sent as its own short message.
- [ ] Inter-message delay is real wall-clock delay; no more than 1 message
      per phase (ban-safe pacing per AGENTS.md).
- [ ] `!breathe 8` (range 1–8) is honored; plain `!breathe` = 4.
- [ ] A second `!breathe` while one is running replies "already breathing
      with you. one at a time." and merges into the same sequence.
- [ ] Ending message is celebratory and point-free ("4 cycles. zero tasks
      accomplished. exactly right.")

**US-2: !hydrate / !drank**
As the Decompresser,
I want a judgment-free water prompt and an equal-judgment-free "done",
so that drinking water feels like attending, not scoring.

Acceptance criteria:
- [ ] `!hydrate` sends exactly one warm prompt per invocation; repeats within
      5 min are gently deflected ("water doesn't do multiplication.").
- [ ] `!drank` always succeeds ("✦ logged. hydration: yes.") regardless of
      whether `!hydrate` was previously invoked.
- [ ] Counts are stored per user, day-local to the *bot's* timezone; retrievable
      in the later `!wrap` feature; invisible in chat otherwise.

**US-3: !vibe**
As the Group Comforter,
I want to @ the bot and get a group vibe forecast,
so that the group has a shared, silly on-ramp to checking in.

Acceptance criteria:
- [ ] Deterministic per (user, day): same output all day, changes by day/person.
- [ ] In groups, requires a mention (per group-response policy in
      `tasks/plan.md`); in DMs plain `!vibe` works.
- [ ] Output is full sentences, never a bare adjective or a numeric score.

**US-4 (Should): !touchgrass / !touched — AC:** assignment is small and
time-bounded ("2 min will do"), `!touched` always accepted, log is count-only
per week, no participation comparison between group members, ever.

**US-5 (Should): !mood — AC:** stores ≤ 6-char word per user per day (later
words same day = replace); `!moods` shows ≤ 31-char rows, reads out words not
judgments; empty mouth states render as blank, never as an empty-dot nag.

### 5.3 What Wa-Bot will never do (non-goals / explicit out of scope)

- **No health, medical, or therapy claims.** If a user is in real distress the
  bot's `!breathe` copy must never imply clinical help; docs include a line:
  "this is a toy, not treatment."
- **No streaks, badges, leagues, or social comparison** in any pack.
- **No productivity features** — no to-do lists, timers for work, reminders to
  summer plans. The bot is the opposite of that.
- **No proactive bulk messaging**; ambient nudge is opt-in, 1/day, per user.
- **No cloud/AI services** in v1 (copy is authored, not generated live).
- **No data export/upload; no third-party integrations.**

## 6. Voice & Tone (contract for all copy)

- Warm, calm, lowercase-ish; but never:
  - sarcastic, passive-aggressive, or "congrats, you did the minimum" flavored;
  - longer than two sentences, ever (three for F1 ending);
  - referencing guilt, obligation, or "you should" constructions;
  - exclamation overuse. One per moment maximum. Softness over effort.
- Competition characteristic: if a sentence would fit in a productivity app's
  onboarding, it's wrong for Wa-Bot and must be rewritten.
- All copy lives in one authored strings file (`src/copy/`), so tone is
  reviewable and consistent without a code change.

## 7. Success Metrics (playful, but real)

| Metric | Definition | v1 target | Source |
|---|---|---|---|
| **Fun per user** | Commands/user/week across Must pack | ≥ 3 | log counts |
| **Return trek** | % of group members using bot in week 4 vs week 1 | ≥ 40% | log counts |
| **Gratitude Coefficient** | Reactions+thanks received by bot ÷ total bot messages | ≥ 0.20 | Baileys `messages.reaction` + text heuristics, logged locally |
| **Zero-guilt guard** | Unsubscribes / hostile-message rate stays near zero | < 2% of reactions | same source |
| **Nudge budget compliance** | Ambient nudges ≤ 1/user/day, 0 when off | 100% | log counts |

None of these are surfaced to users. They exist in a tiny local stats file to
answer: "did anyone actually want this?" If `Fun per user` < 1 by week 4,
kill features, don't add them (per Open Questions Q3).

## 8. Technical Considerations

- **Runs on v1 infra (`tasks/plan.md`):** Bun + TS + ESM, Baileys
  `@whiskeysockets/baileys@7.0.0-rc14` pinned, pairing via QR/pairing code,
  persistent `.session/`, command framework, group-mention/prefix policy.
- **State:** single JSON file (`data/state.json`) written via
  atomic-rename pattern (write-then-rename); small enough to reload in memory.
  v1.1 may need SQLite via `bun:sqlite` if `!wrap`/history grows — not v1.
- **Pacing engine (F1/F5):** one simple scheduler (plain `setTimeout` chains
  guarded by a per-chat mutex, `async-mutex` is already a Baileys dep);
  cancel state must survive… nothing — if process dies mid-breathe, the
  breathe is over. Acceptable on purpose.
- **Ephemera:** F1/F5/F6 log only counters; mood/moment log words. Deleting a
  user's data = `!forget` (v1.1), wipe file otherwise.
- **Ban-safety integrations:** per-chat cooldown already specced in
  `tasks/plan.md` Task 6; this PRD adds a hard 1 msg/phase ceiling for F1.

## 9. Rollout & Milestones

| Wave | Content | Gate |
|---|---|---|
| **Wave 0** | v1 infra (Tasks 1–4, `tasks/plan.md`) | checkpoints 1–2 pass |
| **Wave 1 (Core Must pack)** | F1–F4 + persona `!help` rewrite | one real group + owner DM, 1 week of odd use |
| **Wave 2 (Should)** | F5, F6, F7 | owner adoption only, no group push |
| **Wave 3 (Could)** | F8–F10, ambient F11 | Gratitude Coefficient ≥ 0.20 gate |
| **Wave 4 (v1.1)** | F12 `!wrap`, `!forget` | retro against §7 |

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Baileys maintenance wind-down (Whisockets fork winding down per repo issues) and RC-region breakage | High | pinned dep, WAL-resistant simple features, abstract `send(msg)` in a thin transport layer so a future library swap is one file |
| Feature creep into "helpful" (to-dos, AI chat) | High | §3 charter is a PRD-level veto; new features must pass it |
| Ambient nudge becomes annoying (ban risk / social backlash) | Medium | off by default, ≤1/day, easy `!wand off`, hard-coded budget |
| Mood/moment data feels sensitive | Medium | local-only store, words-only, `!forget`; no export feature |
| Well-meaning person in group asks bot for real help | Medium | warm refusal copy: "I'm seasonal. here's a breath instead." + suggested real help wording in docs |

## 11. Dependencies & Assumptions

- Infra from `tasks/plan.md` (pairing, message normalize, command dispatcher).
- No external API keys; no DB required at any listed wave, except v1.1 SQLite
  if history features ship (assumption: JSON file suffices for ≤ 3 groups).
- Assumes group-mention path works reliably on Baileys RC14 (validated in
  plan.md Checkpoint 2).

## 12. Open Questions

1. **Naming/persona:** Does the bot have a name users type (e.g. `!breathe`
   vs `@Wa-Bot breathe`)? Affects parser UX. **Owner to decide by Wave 1.**
2. **Local time zone:** owner's fixed TZ in v1, or per-chat TZ detection?
   (Affects `!hydrate`/`!mood` day boundaries.)
3. **Kill criteria snap-check:** if `Fun per user` < 1 for 2 consecutive
   weeks after Wave 2, we stop adding features and ask *who uses this and
   why* before Wave 3. Owner must be willing to delete the project's reason
   for being.
4. **Sticker pack** ("touched grass" sticker, "you're valid" animated glb) —
   cheap and delightful on WhatsApp, but pushes media pipeline into v1.
   Verdict: deferred to Wave 4.
