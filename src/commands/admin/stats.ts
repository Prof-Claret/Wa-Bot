import { config } from '../../config'
import { state } from '../../state'
import { isPaused } from './lock'
import type { CommandDef } from '../index'

/**
 * `!stats` — the §7 metrics, visible to the owner only, never surfaced to
 * users. Presented as counts, deliberately un-impressive.
 */
const stats: CommandDef = {
  name: 'stats',
  pack: 'admin',
  help: 'the private counters (owner)',
  ownerOnly: true,
  handler: () => {
    const raw = state(config).peekRaw()
    const users = Object.entries(raw.users ?? {})
    const totalDrank = users.reduce((n, [, u]) => n + Object.values(u.hydrate?.drank ?? {}).reduce((a, b) => a + b, 0), 0)
    const totalBreathe = users.reduce(
      (n, [, u]) => n + Object.values(u.breathe?.days ?? {}).reduce((a, b) => a + b, 0),
      0,
    )
    const totalTouched = users.reduce((n, [, u]) => n + Object.values(u.grass?.days ?? {}).reduce((a, b) => a + b, 0), 0)
    const totalCompliments = users.reduce((n, [, u]) => n + (u.compliment?.count ?? 0), 0)
    const moods = users.reduce((n, [, u]) => n + Object.keys(u.mood?.history ?? {}).length, 0)
    const moments = users.reduce((n, [, u]) => n + Object.keys(u.moment?.history ?? {}).length, 0)
    return [
      'private counters (nobody sees this but you):',
      `users with any state: ${users.length}`,
      `drank: ${totalDrank}, breathe sessions: ${totalBreathe}, grass touched: ${totalTouched}`,
      `self-compliments: ${totalCompliments}, mood words: ${moods}, moments: ${moments}`,
      `paused: ${String(isPaused())}`,
    ].join('\n')
  },
}

export default stats
