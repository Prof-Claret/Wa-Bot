import { config } from '../../config'
import type { CommandDef } from '../index'

const whoami: CommandDef = {
  name: 'whoami',
  pack: 'builtin',
  help: 'who you are to me (debug-flavored)',
  handler: (msg) => {
    const lines = [
      `chat: ${msg.isGroup ? 'a group' : 'a DM'}`,
      `chat jid: ${msg.chatJid}`,
      msg.isGroup ? `sender: ${msg.senderJid}` : `you: ${msg.senderJid}`,
      `mentions: ${msg.mentions.length ? msg.mentions.join(', ') : 'none'}`,
    ]
    if (msg.senderJid === config.ownerJid) lines.push('status: owner of this little ship')
    return lines.join('\n')
  },
}

export default whoami
