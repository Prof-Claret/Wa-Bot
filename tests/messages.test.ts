import { describe, expect, test } from 'bun:test'
import { extractText, extractMentions, forgetSeen, isStatus, normalize } from '../src/messages'
import type { RawMessage } from '../src/messages'

function raw(over: {
  id?: string
  jid?: string
  fromMe?: boolean
  participant?: string
  message?: unknown
  ts?: number
}): RawMessage {
  return {
    key: {
      id: over.id ?? 'MSG1',
      remoteJid: over.jid ?? '15551230000@s.whatsapp.net',
      fromMe: over.fromMe ?? false,
      participant: over.participant,
    },
    message: over.message ?? { conversation: 'hello there' },
    messageTimestamp: over.ts ?? 1761000000,
  } as unknown as RawMessage
}

describe('extractText', () => {
  test('conversation', () => {
    expect(extractText({ conversation: 'hi' } as never)).toBe('hi')
  })
  test('extendedText', () => {
    expect(extractText({ extendedTextMessage: { text: 'quoted reply' } } as never)).toBe('quoted reply')
  })
  test('image caption', () => {
    expect(extractText({ imageMessage: { caption: 'look' } } as never)).toBe('look')
  })
  test('empty for reactions/protocol frames', () => {
    expect(extractText({ reactionMessage: { key: {} } } as never)).toBe('')
    expect(extractText(undefined)).toBe('')
  })
})

describe('extractMentions', () => {
  test('reads mentionedJid from contextInfo', () => {
    const m = { extendedTextMessage: { text: 'x', contextInfo: { mentionedJid: ['a@s.whatsapp.net'] } } }
    expect(extractMentions(m as never)).toEqual(['a@s.whatsapp.net'])
  })
  test('empty when nothing mentioned', () => {
    expect(extractMentions({ conversation: 'x' } as never)).toEqual([])
  })
})

describe('normalize', () => {
  test('passes a normal DM through with tags', () => {
    forgetSeen()
    const msg = normalize(raw({}))
    expect(msg).not.toBeNull()
    expect(msg?.chatJid).toBe('15551230000@s.whatsapp.net')
    expect(msg?.isGroup).toBe(false)
    expect(msg?.senderJid).toBe('15551230000@s.whatsapp.net')
    expect(msg?.text).toBe('hello there')
    expect(msg?.ts).toBe(1761000000 * 1000)
  })

  test('tags group + sender from participant', () => {
    forgetSeen()
    const msg = normalize(raw({ jid: '1203605@g.us', participant: '15551234444@s.whatsapp.net' }))
    expect(msg?.isGroup).toBe(true)
    expect(msg?.senderJid).toBe('15551234444@s.whatsapp.net')
  })

  test('drops status broadcasts', () => {
    forgetSeen()
    expect(isStatus(raw({ jid: 'status@broadcast' }) as RawMessage)).toBe(true)
    expect(normalize(raw({ jid: 'status@broadcast' }))).toBeNull()
  })

  test('drops non-text protocol frames', () => {
    forgetSeen()
    expect(normalize(raw({ message: { reactionMessage: {} } }))).toBeNull()
    expect(normalize(raw({ message: undefined }))).toBeNull()
  })

  test('dedupes by key.id', () => {
    forgetSeen()
    expect(normalize(raw({ id: 'X1' }))).not.toBeNull()
    expect(normalize(raw({ id: 'X1' }))).toBeNull()
    expect(normalize(raw({ id: 'X2' }))).not.toBeNull()
  })
})
