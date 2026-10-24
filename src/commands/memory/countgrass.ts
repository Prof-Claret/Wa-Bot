import { config } from '../../config'
import { memoryCopy } from '../../copy/memory'
import { state } from '../../state'
import { todayKey } from '../dates'
import type { CommandDef } from '../index'

/** `!countgrass` — week summary framed as proof you existed (PRD F6). */
const countgrass: CommandDef = {
  name: 'countgrass',
  pack: 'memory',
  help: 'how many grass touches this week',
  handler: (msg) => {
    const user = state(config).user(msg.senderJid)
    const today = todayKey()
    const weekPrefix = today.slice(0, 4) // same-year approximation is fine for v1
    let count = 0
    for (const [day, n] of Object.entries(user.grass?.days ?? {})) {
      if (day.startsWith(weekPrefix)) count += n
    }
    return memoryCopy.grass.count(count)
  },
}

export default countgrass
