import type { BotMessage } from '../messages'
import { acquire, releaseIf } from '../busy'
import { coreCopy, miscCopy } from '../copy/core'

export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/** a ceremony handler returns the deflection/confirmation text to reply with */
export type CeremonyReply = string

/**
 * Shared ceremony frame for the calm things (breathe / cocoon / nap /
 * nothing). Enforces one ceremony per chat, the right deflection voice,
 * label-safe release, and never crashes the bot on a stray rejection.
 * Run functions send their own messages via sendPhase.
 */
export function ceremony(
  msg: BotMessage,
  label: 'breathe' | 'cocoon' | 'nap' | 'nothing',
  run: () => Promise<void>,
): CeremonyReply | null {
  if (!acquire(msg.chatJid, label)) {
    return label === 'breathe' ? coreCopy.breathe.deflect() : miscCopy.busy()
  }
  void run()
    .catch((err: unknown) => {
      console.error(`[ceremony:${label}]`, err)
    })
    .finally(() => releaseIf(msg.chatJid, label))
  return null
}
