import { config } from '../../config'
import { listCommands } from '../index'
import type { CommandDef } from '../index'

const PACK_TITLES: Record<string, string> = {
  builtin: 'shoulders',
  core: 'tiny comforts',
  nothing: 'doing nothing',
  memory: 'tiny memory',
  chaos: 'strange comfort',
  admin: 'owner corner',
}

function renderHelp(owner: boolean): string {
  const groups = new Map<string, Array<{ name: string; help: string }>>()
  for (const cmd of listCommands()) {
    if (cmd.ownerOnly && !owner) continue
    const list = groups.get(cmd.pack) ?? []
    list.push({ name: cmd.name, help: cmd.help })
    groups.set(cmd.pack, list)
  }
  let out = `use \`${config.prefix}\` (in groups that, or a mention)\n`
  for (const [pack, list] of groups) {
    out += `\n*${PACK_TITLES[pack] ?? pack}*\n`
    out += list.map((c) => `- \`${config.prefix}${c.name}\` — ${c.help}`).join('\n')
    out += '\n'
  }
  out += 'no streaks, no scoring. nothing to win or lose.'
  return out
}

const help: CommandDef = {
  name: 'help',
  pack: 'builtin',
  help: 'the whole range of me',
  handler: () => renderHelp(true),
}

export default help
