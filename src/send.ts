import type { BotMessage } from './messages'
import { pulse } from './pacing'
import type { BotConfig } from './config'
import type { WASocket } from '@whiskeysockets/baileys'

/**
 * THE THIN SEND LAYER (STRUCTURE.md module rules): the only module that talks
 * to the Baileys socket. If the library API changes, this file changes, and
 * nothing else does.
 */

let sock: WASocket | null = null

export function setSocket(config: BotConfig, socket: WASocket | null): void {
  void config
  sock = socket
}

export function socket(): WASocket {
  if (!sock) throw new Error('send() called before connection is up')
  return sock
}

export function botJid(): string | null {
  return sock?.user?.id ?? null
}

/** Pace-gated reply quoting the source message. Returns false if suppressed. */
export async function reply(cfg: BotConfig, msg: BotMessage, text: string): Promise<boolean> {
  if (!pulse(cfg, msg.chatJid)) return false
  await sendText(msg.chatJid, text, msg.raw)
  return true
}

/** Pace-gated plain message to a chat. Returns false if suppressed. */
export async function send(cfg: BotConfig, chatJid: string, text: string): Promise<boolean> {
  if (!pulse(cfg, chatJid)) return false
  await sendText(chatJid, text)
  return true
}

/** Unpaced send for ceremonies (breathe phases, cocoon wake) — the phase
 *  spacing ITSELF is the pacing. Keep messages short and sparse. */
export async function sendPhase(chatJid: string, text: string): Promise<void> {
  await sendText(chatJid, text)
}

async function sendText(chatJid: string, text: string, quoted?: unknown): Promise<void> {
  await socket().sendMessage(chatJid, { text, ...(quoted ? { quoted: quoted as never } : {}) })
}
