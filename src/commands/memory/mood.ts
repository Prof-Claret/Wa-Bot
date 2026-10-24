import { config } from '../../config'
import { memoryCopy } from '../../copy/memory'
import { state } from '../../state'
import { todayKey } from '../dates'
import type { CommandDef } from '../index'

/**
 * `!mood <word>` — one word (≤6 chars) per day; same-day later words
 * replace (PRD §5.2). Words only, never judgments.
 */
const mood: CommandDef = {
  name: 'mood',
  pack: 'memory',
  help: 'log the day as one word (6 letters max)',
  handler: (msg, args) => {
    const word = (args[0] ?? '').trim().toLowerCase()
    if (!word) return memoryCopy.mood.empty()
    if (word.length > 6) return memoryCopy.mood.tooLong()
    const day = todayKey()
    const user = state(config).user(msg.senderJid)
    user.mood ??= { history: {} }
    user.mood.history[day] = word
    state(config).save()
    return memoryCopy.mood.saved(word)
  },
}

export default mood
