import { describe, expect, test } from 'bun:test'
import { vibeFor } from '../src/commands/core/vibe'
import { vibeForecasts } from '../src/copy/core'

describe('vibeFor determinism (PRD US-3)', () => {
  test('same user + day = same forecast', () => {
    const day = '2026-10-24'
    expect(vibeFor('a@x', day)).toBe(vibeFor('a@x', day))
  })

  test('day change follows the calendar, not luck', () => {
    const a = vibeFor('a@x', '2026-10-24')
    const b = vibeFor('a@x', '2026-10-25')
    expect(a).not.toBe(b)
  })

  test('output is always a full authored sentence', () => {
    for (const f of vibeForecasts) {
      expect(f.length).toBeGreaterThan(30)
      expect(f.endsWith('.')).toBe(true)
    }
  })
})
