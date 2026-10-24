import './helpers/env'
import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import type { WASocket } from '@whiskeysockets/baileys'
import type { BotConfig } from '../src/config'
import type { BotMessage } from '../src/messages'

const BOT_JID = '15550001111@s.whatsapp.net'
const STRANGER = '15551230000@s.whatsapp.net'
const OWNER = '15557776666@s.whatsapp.net'

const sent: { jid: string; text: string }[] = []

const mockSock = {
  user: { id: BOT_JID },
  sendMessage: async (jid: string, content: { text?: string }) => {
    sent.push({ jid, text: content.text ?? '' })
    return { key: { id: 'fake', remoteJid: jid } }
  },
} as unknown as WASocket

const { config } = await import('../src/config')
const { setSocket } = await import('../src/send')
const { dispatch } = await import('../src/dispatcher')
const { setPaused } = await import('../src/commands/admin/lock')

function msg(over: Partial<BotMessage> & { text: string }): BotMessage {
  return {
    id: String(sent.length + Math.random()),
    chatJid: STRANGER,
    senderJid: STRANGER,
    fromMe: false,
    isGroup: false,
    mentions: over.mentions ?? [],
    ts: Date.now(),
    raw: {} as never,
    ...over,
  }
}

describe('dispatcher behavior', () => {
  beforeEach(() => {
    setSocket(config, mockSock)
    setPaused(false)
    sent.length = 0
  })

  afterEach(() => {
    setSocket(config, null)
  })

  test('unknown command → gentle deflection, no crash', async () => {
    await dispatch(config, msg({ text: '!frobnicate' }))
    expect(sent.length).toBe(1)
    expect(sent[0].text).toContain('!help')
  })

  test('!ping replies with pong', async () => {
    await dispatch(config, msg({ text: '!ping' }))
    expect(sent.length).toBe(1)
    expect(sent[0].text).toContain('pong')
  })

  test('prefix-less text in a DM is ignored', async () => {
    await dispatch(config, msg({ text: 'just chatting' }))
    expect(sent.length).toBe(0)
  })

  test('group: no prefix and no bot mention → silence', async () => {
    await dispatch(
      config,
      msg({ text: 'anyone know?', isGroup: true, chatJid: 'g@g.us', senderJid: STRANGER }),
    )
    expect(sent.length).toBe(0)
  })

  test('group: prefix alone is enough', async () => {
    await dispatch(config, msg({ text: '!whoami', isGroup: true, chatJid: 'g@g.us', senderJid: STRANGER }))
    expect(sent.length).toBe(1)
    expect(sent[0].text).toContain('a group')
  })

  test('group: mention of the bot without prefix → hello, not an error', async () => {
    await dispatch(
      config,
      msg({
        text: `@bot how are you`,
        isGroup: true,
        chatJid: 'g@g.us',
        mentions: [BOT_JID],
      }),
    )
    expect(sent.length).toBe(1)
    expect(sent[0].text).not.toMatch(/not one of mine|never heard/)
    expect(sent[0].text.length).toBeGreaterThan(5)
  })

  test('owner corner: !pause blocked for outsiders, works for owner', async () => {
    await dispatch(config, msg({ text: '!pause', senderJid: STRANGER }))
    expect(sent.length).toBe(0)

    await dispatch(config, msg({ text: '!pause', senderJid: OWNER }))
    expect(sent.length).toBe(1)
    expect(sent[0].text).toContain('quiet')
  })

  test('while paused, non-owner chatter is ignored; owner still gets through', async () => {
    await dispatch(config, msg({ text: '!pause', senderJid: OWNER }))
    sent.length = 0

    await dispatch(config, msg({ text: '!ping', senderJid: STRANGER }))
    expect(sent.length).toBe(0)

    await dispatch(config, msg({ text: '!resume', senderJid: OWNER }))
    expect(sent.length).toBe(1)
  })
})
