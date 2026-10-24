import type { proto, WAMessage } from '@whiskeysockets/baileys'

/**
 * PURE, unit-tested normalization layer (STRUCTURE.md module rules): touches
 * no socket, no state. Turns one raw Baileys `messages.upsert` item into a
 * BotMessage, or null when the bot should ignore it (status broadcasts,
 * protocol frames, non-text, already-seen ids).
 */

type IMessage = proto.IMessage
export type RawMessage = WAMessage

export interface BotMessage {
  id: string
  chatJid: string
  senderJid: string
  fromMe: boolean
  isGroup: boolean
  text: string
  mentions: string[]
  ts: number
  raw: RawMessage
}

const seenIds = new Set<string>()
const SEEN_CAP = 1000

export function extractText(message?: IMessage | null): string {
  if (!message) return ''
  return (
    message.conversation ??
    message.extendedTextMessage?.text ??
    message.imageMessage?.caption ??
    message.videoMessage?.caption ??
    message.documentMessage?.caption ??
    ''
  )
}

export function extractMentions(message?: IMessage | null): string[] {
  if (!message) return []
  for (const value of Object.values(message)) {
    if (!value || typeof value !== 'object') continue
    const info = (value as { contextInfo?: { mentionedJid?: string[] } }).contextInfo
    if (info?.mentionedJid?.length) return [...info.mentionedJid]
  }
  return []
}

export function isStatus(raw: RawMessage): boolean {
  return raw.key?.remoteJid === 'status@broadcast'
}

/** returns the BotMessage when this raw message deserves a look, else null */
export function normalize(raw: RawMessage): BotMessage | null {
  const key = raw.key
  if (!key || !key.id) return null
  const chatJid = key.remoteJid
  if (!chatJid || isStatus(raw)) return null

  // LRU-ish dedupe by message id (Baileys can emit the same id twice)
  if (seenIds.has(key.id)) return null
  seenIds.add(key.id)
  if (seenIds.size > SEEN_CAP) seenIds.delete(seenIds.keys().next().value as string)

  const text = extractText(raw.message)
  if (!text.trim()) return null

  const tsMs = Number(raw.messageTimestamp) * 1000
  const isGroup = chatJid.endsWith('@g.us')
  return {
    id: key.id,
    chatJid,
    senderJid: (isGroup ? key.participant : undefined) ?? chatJid,
    fromMe: key.fromMe === true,
    isGroup,
    text,
    mentions: extractMentions(raw.message),
    ts: Number.isFinite(tsMs) ? tsMs : Date.now(),
    raw,
  }
}

/** test seam */
export function forgetSeen(): void {
  seenIds.clear()
}
