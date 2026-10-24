import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import type { BotConfig } from './config'

/**
 * All bot state lives in one JSON file under `DATA_DIR`, local-only (PRD §3):
 * counters and words, never chat text. Saved atomically (write-then-rename).
 * Growth path if this ever outgrows JSON (plan.md): swap internals for
 * bun:sqlite behind the same accessors.
 */

interface HydrateState {
  drank: Record<string, number> // day -> count
  lastPromptAt?: number
}

interface BreatheState {
  days: Record<string, number> // day -> sessions
}

export interface GrassState {
  days: Record<string, number> // day -> touches
}

interface ComplimentState {
  count: number
}

interface MoodState {
  history: Record<string, string> // day -> one word (<=6 chars), replaced same-day
}

interface MomentState {
  history: Record<string, string> // day -> one word
}

export interface UserState {
  hydrate?: HydrateState
  breathe?: BreatheState
  grass?: GrassState
  compliment?: ComplimentState
  mood?: MoodState
  moment?: MomentState
}

export interface GroupState {
  ritualsOff?: boolean
}

interface BotState {
  users: Record<string, UserState>
  groups: Record<string, GroupState>
}

// test-time seam: tests create their own StateStore in a temp dir
let sharedStore: BotStateStore | null = null

export class BotStateStore {
  private data: BotState
  private constructor(public readonly filePath: string) {
    try {
      this.data = JSON.parse(readFileSync(this.filePath, 'utf8')) as BotState
    } catch {
      this.data = { users: {}, groups: {} }
    }
  }

  static open(cfg?: Pick<BotConfig, 'dataDir'>): BotStateStore {
    const dataDir = cfg?.dataDir
    if (dataDir) mkdirSync(dataDir, { recursive: true })
    const file = dataDir ? path.join(dataDir, 'state.json') : path.join('data', 'state.json')
    return new BotStateStore(file)
  }

  static shared(cfg: BotConfig): BotStateStore {
    sharedStore ??= BotStateStore.open(cfg)
    return sharedStore
  }

  user(jid: string): UserState {
    this.data.users[jid] ??= {}
    return this.data.users[jid]
  }

  group(jid: string): GroupState {
    this.data.groups[jid] ??= {}
    return this.data.groups[jid]
  }

  clearUser(jid: string): void {
    delete this.data.users[jid]
  }

  save(): void {
    try {
      const tmp = `${this.filePath}.tmp`
      writeFileSync(tmp, JSON.stringify(this.data, null, 2))
      renameSync(tmp, this.filePath)
    } catch (err) {
      // state loss is acceptable and expected on some failures; never crash the
      // bot over a save, but leave a trace.
      try {
        unlinkSync(`${this.filePath}.tmp`)
      } catch {
        /* no tmp file to clean */
      }
      console.error('[state] save failed:', (err as Error).message)
    }
  }

  exists(stateFile: string): boolean {
    return existsSync(stateFile)
  }

  // test-only view
  peekRaw(): BotState {
    return JSON.parse(JSON.stringify(this.data))
  }
}

export function state(cfg: BotConfig): BotStateStore {
  return BotStateStore.shared(cfg)
}
