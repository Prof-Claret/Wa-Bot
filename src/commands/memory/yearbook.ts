import { config } from '../../config'
import { memoryCopy } from '../../copy/memory'
import { state } from '../../state'
import type { CommandDef } from '../index'

/** `!yearbook` — replays logged moments like year of vibes statements. */
const yearbook: CommandDef = {
  name: 'yearbook',
  pack: 'memory',
  help: 'your logged moments, back to back',
  handler: (msg) => {
    const user = state(config).user(msg.senderJid)
    const history = user.moment?.history ?? {}
    const entries = Object.entries(history).sort(([a], [b]) => a.localeCompare(b))
    if (entries.length === 0) return memoryCopy.yearbook.empty()
    const body = entries.map(([day, word]) => `${day}: ${word}`)
    return [memoryCopy.yearbook.intro(), ...body].join('\n')
  },
}

export default yearbook
