import { config } from '../../config'
import { coreCopy } from '../../copy/core'
import { state } from '../../state'
import { todayKey } from '../dates'
import type { CommandDef } from '../index'

const PROMPT_COOLDOWN_MS = 5 * 60_000 // PRD US-2: repeats within 5 min deflect

const hydrate: CommandDef = {
  name: 'hydrate',
  pack: 'core',
  help: 'there is a glass somewhere. this nudges you toward it',
  handler: (msg) => {
    const user = state(config).user(msg.senderJid)
    const now = Date.now()
    if (user.hydrate?.lastPromptAt && now - user.hydrate.lastPromptAt < PROMPT_COOLDOWN_MS) {
      return coreCopy.hydrate.deflected()
    }
    user.hydrate ??= { drank: {} }
    user.hydrate.lastPromptAt = now
    state(config).save()
    return coreCopy.hydrate.prompt()
  },
}

export default hydrate
