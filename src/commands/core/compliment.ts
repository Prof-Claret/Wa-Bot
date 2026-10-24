import { coreCopy } from '../../copy/core'
import { state } from '../../state'
import { config } from '../../config'
import type { CommandDef } from '../index'

/**
 * `!compliment <text>` — you compliment yourself; the bot officiates
 * (PRD F4). The bot never authors the compliment (the user does), the bot
 * only records that it happened and takes it at face value.
 */
const compliment: CommandDef = {
  name: 'compliment',
  pack: 'core',
  help: 'write one about yourself; I take minutes',
  handler: (msg, args) => {
    const said = args.join(' ').trim()
    if (!said) {
      return "the compliment comes from you — I'm only the clerk. try `!compliment I finished the thing`."
    }
    if (said.length > 120) return coreCopy.compliment.tooLong()
    const user = state(config).user(msg.senderJid)
    user.compliment ??= { count: 0 }
    user.compliment.count += 1
    state(config).save()
    return `${coreCopy.compliment.officiated()} ${coreCopy.compliment.count(user.compliment.count)}`
  },
}

export default compliment
