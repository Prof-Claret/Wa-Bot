import { config } from '../../config'
import { memoryCopy } from '../../copy/memory'
import { state } from '../../state'
import { todayKey } from '../dates'
import type { CommandDef } from '../index'

/** `!moment <word>` — one word about today, for the future. */
const moment: CommandDef = {
  name: 'moment',
  pack: 'memory',
  help: 'one word about today, saved for later-you',
  handler: (msg, args) => {
    const word = (args[0] ?? '').trim().toLowerCase()
    if (!word) return memoryCopy.mood.empty()
    if (word.length > 12) return 'one word, twelve letters max. keep it a moment, not an essay.'
    const user = state(config).user(msg.senderJid)
    user.moment ??= { history: {} }
    user.moment.history[todayKey()] = word
    state(config).save()
    return memoryCopy.moment.saved(word)
  },
}

export default moment
