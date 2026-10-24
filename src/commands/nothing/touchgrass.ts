import { config } from '../../config'
import { nothingCopy } from '../../copy/nothing'
import { state } from '../../state'
import type { CommandDef } from '../index'

/** `!touchgrass` — assigns tiny, unverifiable outside homework (PRD US-4). */
const touchgrass: CommandDef = {
  name: 'touchgrass',
  pack: 'nothing',
  help: 'two minutes of outside. no evidence required',
  handler: () => nothingCopy.grass.assign(),
}

export default touchgrass
