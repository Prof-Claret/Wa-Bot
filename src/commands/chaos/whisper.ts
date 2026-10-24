import { chaosCopy } from '../../copy/chaos'
import type { CommandDef } from '../index'

const whisper: CommandDef = {
  name: 'whisper',
  pack: 'chaos',
  help: 'for when even shouting is too much',
  handler: (_msg, args) => {
    const said = args.join(' ').trim()
    if (!said) return '(nothing needed saying, apparently. also fine.)'
    return chaosCopy.yell.whisperQuiet()
  },
}

export default whisper
