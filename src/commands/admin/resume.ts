import { setPaused } from './lock'
import type { CommandDef } from '../index'

const resume: CommandDef = {
  name: 'resume',
  pack: 'admin',
  help: 'undo !pause',
  ownerOnly: true,
  handler: () => {
    setPaused(false)
    return 'back, quietly.'
  },
}

export default resume
