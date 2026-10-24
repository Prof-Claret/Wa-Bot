import { chaosCopy } from '../../copy/chaos'
import type { CommandDef } from '../index'

/** `!excuse <thing>` — absurd excuse generator for not doing the thing. */
const excuse: CommandDef = {
  name: 'excuse',
  pack: 'chaos',
  help: 'instant absurd excuse for the thing you are avoiding',
  handler: (_msg, args) => {
    const thing = args.join(' ').trim().toLowerCase()
    if (!thing) return chaosCopy.excuse.missingThing()
    return `${chaosCopy.excuse.intro()}\n▸ ${chaosCopy.excuse.render(thing)}`
  },
}

export default excuse
