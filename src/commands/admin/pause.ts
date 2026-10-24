import { setPaused } from './lock'
import type { CommandDef } from '../index'

const pause: CommandDef = {
  name: 'pause',
  pack: 'admin',
  help: 'mute me everywhere except your commands',
  ownerOnly: true,
  handler: () => {
    setPaused(true)
    return 'going quiet. your commands still get through.'
  },
}

export default pause
