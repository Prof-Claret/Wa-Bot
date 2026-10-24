import { config } from './config'
import type { BotConfig } from './config'
import type { BotMessage } from './messages'
import { lookup } from './commands'
import { botJid, reply } from './send'
import { miscCopy } from './copy/core'
import { isPaused } from './commands/admin/lock'

/**
 * Dispatch pipeline (STRUCTURE.md flow): group policy → pause gate → fromMe
 * gate → prefix/mention parse → owner gate → per-chat mutex → handler →
 * paced reply. Handler return value (string) is the reply; null = already
 * handled (ceremonies).
 */

const mutexes = new Map<string, Promise<unknown>>()

export async function dispatch(cfg: BotConfig, msg: BotMessage): Promise<void> {
  // The bot's own outgoing messages: never normal commands (fromMe), except
  // owner corner typed directly on the bot's phone (self-owner rule).
  if (msg.fromMe) {
    if (!cfg.selfIsOwner) return
    const [first, ...rest] = tokens(stripPrefix(cfg, msg.text))
    const cmd = first ? lookup(first) : undefined
    if (cmd?.ownerOnly) {
      await runGated(cfg, msg, cmd, rest)
    }
    return
  }

  if (isPaused() && !isOwner(cfg, msg)) return

  // group response policy (plan.md Task 6, PRD US-3)
  const hadPrefix = msg.text.trimStart().startsWith(cfg.prefix)
  if (msg.isGroup && !groupAllowed(cfg, msg)) return

  // The bot answers only prefixed commands in DMs — unprefixed chatter is
  // never responded to (reactive-only charter, PRD §3).
  if (!msg.isGroup && !hadPrefix) return

  // group mention without a command prefix → gentle hello, nothing else
  const stripped = stripPrefix(cfg, msg.text)
  if (!stripped && msg.isGroup) {
    void reply(cfg, msg, miscCopy.greet())
    return
  }

  const [first, ...rest] = tokens(stripped)
  if (!first) return

  // casual mention in a group ("@bot how are you") → hello, not an error
  if (msg.isGroup && !hadPrefix && !lookup(first)) {
    void reply(cfg, msg, miscCopy.greet())
    return
  }

  const cmd = lookup(first)
  if (!cmd) {
    void reply(cfg, msg, miscCopy.unknownCmd())
    return
  }

  if (cmd.ownerOnly && !isOwner(cfg, msg)) return

  await runGated(cfg, msg, cmd, rest)
}

/** chain guard: normal commands run one at a time per chat (ceremony handlers
 * fire-and-forget their own pacing inside busy.ts) */
function chain(chatJid: string, task: () => Promise<void>): Promise<void> {
  const tail = mutexes.get(chatJid) ?? Promise.resolve()
  const next = tail.then(task, task)
  mutexes.set(
    chatJid,
    next.catch(() => undefined),
  )
  return next
}

async function runGated(cfg: BotConfig, msg: BotMessage, cmd: NonNullable<ReturnType<typeof lookup>>, args: string[]) {
  await chain(msg.chatJid, async () => {
    try {
      const out = await cmd.handler(msg, args)
      if (typeof out === 'string' && out.trim()) await reply(cfg, msg, out)
    } catch (err) {
      console.error(`[dispatch] !${cmd.name} failed:`, (err as Error).stack ?? err)
      void reply(cfg, msg, miscCopy.hiccups())
    }
  })
}

function stripPrefix(cfg: BotConfig, text: string): string {
  const t = text.trim()
  if (t.startsWith(cfg.prefix)) return t.slice(cfg.prefix.length).trim()
  return t.trim()
}

function tokens(s: string): string[] {
  return s.length ? s.split(/\s+/) : []
}

function groupAllowed(cfg: BotConfig, msg: BotMessage): boolean {
  if (msg.text.trimStart().startsWith(cfg.prefix)) return true
  if (cfg.groupResponse === 'prefix-only') return false
  const me = botJid()
  return Boolean(me) && msg.mentions.includes(me as string)
}

function isOwner(cfg: BotConfig, msg: BotMessage): boolean {
  if (msg.fromMe) return Boolean(cfg.selfIsOwner)
  return Boolean(cfg.ownerJid) && msg.senderJid === cfg.ownerJid
}
