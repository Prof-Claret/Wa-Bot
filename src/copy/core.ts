/**
 * TONE CONTRACT (PRD §6): warm, never clever; ≤ 2 sentences (3 max for a
 * ceremony ending); no guilt, no "you should", ≤ 1 exclamation per moment.
 * These files import nothing. All copy is authored, never generated live.
 */

const pick = (list: string[]): string => list[Math.floor(Math.random() * list.length)]

export const miscCopy = {
  unknownCmd: () =>
    pick([
      'not one of mine. `!help` shows what is.',
      'never heard of it. no shame — `!help` has the list.',
      "that's either a typo or a philosophy. `!help` covers the first.",
    ]),
  hiccups: () =>
    pick([
      'hiccups over here. filed under: not your fault.',
      'that tripped me up. nothing broken where it counts.',
      'error, but a cozy one. someone will notice it eventually.',
    ]),
  greet: () =>
    pick([
      'hi. did you need something? `!help` is my whole range.',
      'here. reasonably calm. what do you need?',
      "present. that's the largest thing I do. meant to be small.",
    ]),
  busy: () =>
    pick(["we're mid-ceremony already. one at a time.", "can't stack these — calm doesn't multitask."]),
  paused: () => 'quiet mode is on. tell the owner to `!resume`.',
}

export const coreCopy = {
  ping: (ms: number) => `pong. round trip ±${ms}ms. you exist, the network exists.`,
  breathe: {
    started: (n: number) => `${n} cycles, box shape. nothing to hold or prove.`,
    deflect: () =>
      pick(['we are breathing already. one burst at a time.', 'mid-breathe. follow the last one out.']),
    in_: () => pick(['in — four counts', 'air in. slowly.', 'breathe in']),
    hold: () => pick(['hold — four counts', 'suspended. it is fine.', 'hold']),
    out: () => pick(['out — four counts', 'let it go. all of it.', 'breathe out']),
    rest: () => pick(['empty — four counts', 'nothing left, nothing owed.', 'rest']),
    done: (n: number) =>
      pick([
        `${n} cycles. zero tasks accomplished. exactly right.`,
        `${n} cycles done. nothing gained except a reset, which is the point.`,
        "done. no report, no score. nobody was grading.",
      ]),
  },
  hydrate: {
    prompt: () =>
      pick([
        'water. even a few sips count as an act.',
        "there's a glass somewhere in your periphery. go say hi.",
        'drink some water. you have done more for other things today.',
      ]),
    deflected: () => pick(['water does not do multiplication.', 'a glass is a glass. quantity negotiable.']),
    ceremony: () =>
      pick([
        'logged. one of the humans is properly hydrated.',
        'noted. this is the kind of content I keep.',
        'yes. that is the whole exchange, and it was enough.',
      ]),
    ceremonyBig: (n: number) => `${n} glasses today. hydrated to a suspicious degree.`,
  },
  compliment: {
    tooLong: () => 'a compliment should fit in one breath!',
    officiated: () =>
      pick([
        'noted. minutes taken. unanimous.',
        'on your word alone. the record now shows it happened.',
        'self-compliment logged. rare, but the record does not lie.',
      ]),
    count: (n: number) => `personal compliments on record: ${n}.`,
  },
}

/** deterministic daily forecasts — picked via hash(user+day), never random */
export const vibeForecasts: string[] = [
  'For you: overcast hints of coffee, clearing by evening. No umbrella needed.',
  'For you: scattered procrastination, partly restful. Nothing lobbed at you today.',
  'For you: gentle wind from a slightly better direction. Handle the day gently.',
  'For you: lingering pressure, lifting around lunch. Small chances of ordinary joy.',
  'For you: loud ambitions, small chance of follow-through. Dress in comfortable plans.',
  'For you: light flurries of small wins from the east. Sleeves optional.',
  'For you: a still atmosphere. Be one of the people who passes slowly through it.',
  'Forecast mostly useless, as is tradition. Some friendly fronts, no agenda attached.',
  'Highs of unpicked calls, lows of none at all. A thoroughly negligible forecast.',
  'For you: faint melodrama on the horizon, trailing off by night. Quiet skies behind it.',
]
