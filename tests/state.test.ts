import { describe, expect, test } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { join } from 'node:path'
import { BotStateStore } from '../src/state'

const dir = mkdtempSync(path.join(tmpdir(), 'wabot-state-'))

describe('BotStateStore (local-only JSON, atomic save)', () => {
  test('per-user namespaces default to empty objects', () => {
    const st = BotStateStore.open({ dataDir: dir })
    const u = st.user('a@x')
    expect(Object.keys(u).length).toBe(0)
    u.hydrate = { drank: {} }
    expect(st.user('b@x')).not.toBe(u)
  })

  test('save + reload keeps data', () => {
    const st = BotStateStore.open({ dataDir: dir })
    st.user('a@x').hydrate = { drank: { '2026-10-24': 2 } }
    st.save()
    const again = BotStateStore.open({ dataDir: dir })
    expect(again.user('a@x').hydrate?.drank['2026-10-24']).toBe(2)
  })

  test('corrupt file falls back to empty state', () => {
    const { writeFileSync } = require('node:fs') as typeof import('node:fs')
    writeFileSync(join(dir, 'state.json'), '{not json')
    const st = BotStateStore.open({ dataDir: dir })
    expect(Object.keys(st.peekRaw().users).length).toBe(0)
  })
})
