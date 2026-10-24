import type { BotMessage } from '../messages'
import type { CommandPack } from '../types'

export interface CommandDef {
  name: string
  aliases?: string[]
  pack: CommandPack
  help: string
  ownerOnly?: boolean
  handler: (msg: BotMessage, args: string[]) => string | null | Promise<string | null>
}

import { commands } from './registry'

export function lookup(name: string): CommandDef | undefined {
  const n = name.toLowerCase()
  return commands.find((c) => c.name === n || c.aliases?.includes(n))
}

export function listCommands(): CommandDef[] {
  return commands
}
