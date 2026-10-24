import { config } from '../../config'
import { nothingCopy } from '../../copy/nothing'
import { state } from '../../state'
import { todayKey } from '../dates'
import type { CommandDef } from '../index'

/**
 * `!touched` — always accepted, never verified, immediately praised
 * (PRD §5.2 US-4 acceptance criteria). Counted per day for the later wrap.
 */
const touched: CommandDef = {
  name: 'touched',
  pack: 'nothing',
  help: 'report grass contact; always accepted',
  handler: (msg) => {
    const user = state(config).user(msg.senderJid)
    user.grass ??= { days: {} }
    const day = todayKey()
    user.grass.days[day] = (user.grass.days[day] ?? 0) + 1
    state(config).save()
    return nothingCopy.grass.touched()
  },
}

export default touched
