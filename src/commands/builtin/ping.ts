import { coreCopy } from '../../copy/core'
import type { CommandDef } from '../index'
import { capReliable } from '../dates'

const ping: CommandDef = {
  name: 'ping',
  pack: 'builtin',
  help: 'is anything alive',
  handler: (msg) => {
    const ms = Math.max(0, Date.now() - capReliable(msg.ts))
    return coreCopy.ping(ms)
  },
}

export default ping
