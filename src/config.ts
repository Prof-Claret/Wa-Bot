import type { PairingMode, GroupResponsePolicy } from './types'

export interface BotConfig {
  pairingMode: PairingMode
  phoneNumber: string
  prefix: string
  ownerJid?: string
  selfIsOwner: boolean
  groupResponse: GroupResponsePolicy
  minSendIntervalMs: number
  logLevel: string
  baileysLogLevel: string
  dataDir: string
  authDir: string
}

function fail(message: string): never {
  console.error(`[config] ${message}`)
  console.error('[config] fix .env (see .env.example) and restart.')
  process.exit(1)
}

function digits(s: string): string {
  return s.replace(/\D/g, '')
}

function toJid(s: string): string {
  const d = digits(s)
  if (s.includes('@')) return s // assume caller passed a full jid
  if (d.length < 5) fail(`OWNER="${s}" does not look like a phone number or jid`)
  return `${d}@s.whatsapp.net`
}

const pairingMode = (process.env.PAIRING_MODE ?? 'qrcode') as PairingMode
if (pairingMode !== 'qrcode' && pairingMode !== 'code') {
  fail(`PAIRING_MODE must be "qrcode" or "code", got "${pairingMode}"`)
}

const phoneNumber = digits(process.env.PHONE_NUMBER ?? '')
if (pairingMode === 'code' && !phoneNumber) {
  fail('PAIRING_MODE=code requires PHONE_NUMBER (digits, with country code)')

}

const groupResponse = (process.env.GROUP_RESPONSE ?? 'mention-or-prefix') as GroupResponsePolicy
if (groupResponse !== 'mention-or-prefix' && groupResponse !== 'prefix-only') {
  fail(`GROUP_RESPONSE must be "mention-or-prefix" or "prefix-only", got "${groupResponse}"`)
}

const minSendIntervalMs = Number(process.env.MIN_SEND_INTERVAL_MS ?? '1200')
if (!Number.isFinite(minSendIntervalMs) || minSendIntervalMs < 0) {
  fail(`MIN_SEND_INTERVAL_MS must be a non-negative number, got "${process.env.MIN_SEND_INTERVAL_MS}"`)
}

const ownerRaw = process.env.OWNER?.trim()

export const config: BotConfig = {
  pairingMode,
  phoneNumber,
  prefix: process.env.WABOT_PREFIX?.trim() || '!',
  ownerJid: ownerRaw ? toJid(ownerRaw) : undefined,
  selfIsOwner: (process.env.OWNER_SELF ?? 'true') !== 'false',
  groupResponse,
  minSendIntervalMs,
  logLevel: process.env.LOG_LEVEL?.trim() || 'info',
  baileysLogLevel: process.env.BAILEYS_LOG_LEVEL?.trim() || 'warn',
  dataDir: process.env.DATA_DIR?.trim() || 'data',
  authDir: process.env.AUTH_DIR?.trim() || '.session',
}
