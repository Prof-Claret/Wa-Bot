import { chaosCopy } from '../../copy/chaos'
import type { CommandDef } from '../index'

const lament: CommandDef = {
  name: 'lament',
  pack: 'chaos',
  help: 'solidarity about nothing in particular',
  handler: () => chaosCopy.lament(),
}

export default lament
