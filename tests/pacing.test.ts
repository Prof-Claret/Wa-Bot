import { describe, expect, test } from 'bun:test'
import * as pacing from '../src/pacing'
import type { BotConfig } from '../src/config'

const cfg = { minSendIntervalMs: 40 } as unknown as BotConfig

describe('pacing.pulse (ban-safety)', () => {
  test('first send passes, fast repeats suppressed, later passes', async () => {
    pacing.clearAll()
    expect(pacing.pulse(cfg, 'chatA')).toBe(true)
    expect(pacing.pulse(cfg, 'chatA')).toBe(false)
    await new Promise((r) => setTimeout(r, 55))
    expect(pacing.pulse(cfg, 'chatA')).toBe(true)
  })

  test('chats are independent', () => {
    pacing.clearAll()
    expect(pacing.pulse(cfg, 'chatB')).toBe(true)
    expect(pacing.pulse(cfg, 'chatC')).toBe(true)
  })
})
