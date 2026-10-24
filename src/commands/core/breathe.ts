import { config } from '../../config'
import { coreCopy } from '../../copy/core'
import { sendPhase } from '../../send'
import { ceremony, sleep } from '../util'
import type { CommandDef } from '../index'

const PHASE_MS = 4000 // box breathing: in / hold / out / rest — PRD US-1

const breathe: CommandDef = {
  name: 'breathe',
  pack: 'core',
  help: 'a few paced cycles of nothing to gain except a reset',
  handler: (msg, args) => {
    const n = clampCycles(Number(args[0] ?? '4'))
    const run = async (): Promise<void> => {
      await sendPhase(msg.chatJid, coreCopy.breathe.started(n))
      for (let cycle = 1; cycle <= n; cycle++) {
        await sleep(PHASE_MS)
        await sendPhase(msg.chatJid, coreCopy.breathe.in_())
        await sleep(PHASE_MS)
        await sendPhase(msg.chatJid, coreCopy.breathe.hold())
        await sleep(PHASE_MS)
        await sendPhase(msg.chatJid, coreCopy.breathe.out())
        await sleep(PHASE_MS)
        await sendPhase(msg.chatJid, coreCopy.breathe.rest())
      }
      await sleep(PHASE_MS)
      await sendPhase(msg.chatJid, coreCopy.breathe.done(n))
    }
    return ceremony(msg, 'breathe', run) // null if a deflect was sent instead
  },
}

function clampCycles(n: number): number {
  if (!Number.isFinite(n) || n < 1) return 4
  return Math.min(8, Math.floor(n))
}

export default breathe
