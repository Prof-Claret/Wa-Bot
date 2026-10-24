import { nothingCopy } from '../../copy/nothing'
import { sendPhase } from '../../send'
import { ceremony, sleep } from '../util'
import type { CommandDef } from '../index'

const MIN = 60_000

function cocoonHandler(label: 'cocoon' | 'nap') {
  return (msg: Parameters<NonNullable<CommandDef['handler']>>[0], args: string[]): string | null => {
    const n = clampMinutes(Number(args[0] ?? '10'))
    const run = async (): Promise<void> => {
      await sleep(n * MIN)
      await sendPhase(msg.chatJid, nothingCopy.cocoon.wake(n))
    }
    const deflection = ceremony(msg, label, run)
    return deflection ?? nothingCopy.cocoon.enter(n)
  }
}

function clampMinutes(n: number): number {
  if (!Number.isFinite(n) || n < 1) return 10
  return Math.min(30, Math.floor(n))
}

const cocoon: CommandDef = {
  name: 'cocoon',
  pack: 'nothing',
  help: 'put-away minutes of nothing (5–30 default 10)',
  handler: cocoonHandler('cocoon'),
}

const nap: CommandDef = {
  name: 'nap',
  aliases: ['sleep'],
  pack: 'nothing',
  help: 'cocoon, but with a pillow metaphor',
  handler: cocoonHandler('nap'),
}

export default cocoon
export { nap }
