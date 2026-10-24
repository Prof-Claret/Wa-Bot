import { config } from '../../config'
import { coreCopy } from '../../copy/core'
import { state } from '../../state'
import { todayKey } from '../dates'
import type { CommandDef } from '../index'

const drank: CommandDef = {
  name: 'drank',
  aliases: ['water'],
  pack: 'core',
  help: 'declare water achievement; instantly celebrated',
  handler: (msg) => {
    const user = state(config).user(msg.senderJid)
    const day = todayKey()
    user.hydrate ??= { drank: {} }
    user.hydrate.drank[day] = (user.hydrate.drank[day] ?? 0) + 1
    const count = user.hydrate.drank[day] ?? 1
    state(config).save()
    if (count >= 8) return coreCopy.hydrate.ceremonyBig(count)
    return `${coreCopy.hydrate.ceremony()} (${count})`
  },
}

export default drank
