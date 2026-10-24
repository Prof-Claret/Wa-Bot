import { chaosCopy } from '../../copy/chaos'
import type { CommandDef } from '../index'

/**
 * `!yell <text>` / `!whisper <text>` — you shout; the void comes back
 * softer (PRD F10). The bot never echoes the shout back.
 */
const yell: CommandDef = {
  name: 'yell',
  pack: 'chaos',
  help: 'shout into it; it comes back softer',
  handler: (_msg, args) => {
    const shout = args.join(' ').trim()
    if (!shout) return 'you have to shout something. let us have it.'
    if (shout.length > 200) return 'that is a lot of shout. take the first 200 next time, keep the rest.'
    return `${chaosCopy.yell.intro()}\n▸ ${chaosCopy.yell.whisper()}`
  },
}

export default yell
