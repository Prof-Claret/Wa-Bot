import type { BotConfig } from './config'

/**
 * Ban-safety pacing (plan.md Task 6 + PRD §3): a minimum interval between
 * paces sends to the same chat. Long ceremonies (breathe/cocoon) bypass this
 * deliberately via send.sendPhase — they are the pacing (one message per phase).
 */

const lastSend = new Map<string, number>()

export function pulse(cfg: BotConfig, chatJid: string): boolean {
  const now = Date.now()
  const last = lastSend.get(chatJid) ?? 0
  if (now - last < cfg.minSendIntervalMs) return false
  lastSend.set(chatJid, now)
  return true
}

export function resetForChat(chatJid: string): void {
  lastSend.delete(chatJid)
}

/** internal clock seam for tests */
export function clearAll(): void {
  lastSend.clear()
}
