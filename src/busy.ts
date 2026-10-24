/**
 * Per-chat ceremony guard so calm things (breathe / cocoon / nap / nothing)
 * never overlap in the same chat (PRD §5.2 US-1). Pacing gates themselves
 * live in send.ts.
 */

const running = new Map<string, string>() // chatJid -> label

export function isBusy(chatJid: string): string | undefined {
  return running.get(chatJid)
}

/** acquire the per-chat ceremony slot; false if something else is running */
export function acquire(chatJid: string, label: string): boolean {
  if (running.has(chatJid)) return false
  running.set(chatJid, label)
  return true
}

export function release(chatJid: string): void {
  running.delete(chatJid)
}

/** label-safe release: a finished cocoon must not evict a breathe that started later */
export function releaseIf(chatJid: string, label: string): void {
  if (running.get(chatJid) === label) release(chatJid)
}

/** test seam */
export function clearAll(): void {
  running.clear()
}
