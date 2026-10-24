import { config } from '../../config'
import { memoryCopy } from '../../copy/memory'
import { state } from '../../state'
import type { CommandDef } from '../index'

/**
 * `!forget` — wipes your own logged data. No backup kept (memory copy:
 * "you owe this log nothing"). Owner could wipe others with jid args later;
 * v1 is self-service only.
 */
const forget: CommandDef = {
  name: 'forget',
  pack: 'memory',
  help: 'erase everything I logged about you',
  handler: (msg) => {
    state(config).clearUser(msg.senderJid)
    state(config).save()
    return memoryCopy.forget.done()
  },
}

export default forget
