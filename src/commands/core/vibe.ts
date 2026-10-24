import { vibeForecasts } from '../../copy/core'
import type { CommandDef } from '../index'
import { todayKey } from '../dates'

/**
 * `!vibe` — deterministic per (user, day): same output all day, changes by
 * day and person (PRD US-3). Pure hash, never random, never a bare word or
 * a numeric score.
 */
export function vibeFor(userJid: string, day = todayKey()): string {
  const basis = `${userJid}|${day}`
  let h = 2166136261
  for (let i = 0; i < basis.length; i++) {
    h ^= basis.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const index = Math.abs(h) % vibeForecasts.length
  return vibeForecasts[index]
}

const vibe: CommandDef = {
  name: 'vibe',
  pack: 'core',
  help: 'weather forecast of the soul; deterministic all day',
  handler: (msg) => vibeFor(msg.senderJid, todayKey()),
}

export default vibe
