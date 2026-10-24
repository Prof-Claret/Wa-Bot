import { config } from '../../config'
import { memoryCopy } from '../../copy/memory'
import { state } from '../../state'
import { daysInMonth } from '../dates'
import type { CommandDef } from '../index'

/** `!moods` — tiny ASCII wall of this month's one-word moods. */
const moods: CommandDef = {
  name: 'moods',
  pack: 'memory',
  help: 'tiny wall of this month (a mark, not a chart)',
  handler: (msg) => {
    const user = state(config).user(msg.senderJid)
    const history = user.mood?.history ?? {}
    const days = daysInMonth()
    const now = new Date()
    const title = now.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    const wall = days
      .map(({ key, day }) => {
        const has = Boolean(history[key])
        const isToday = todayIs(key)
        return has ? (isToday ? '◉' : '▓') : isToday ? '◉' : '·'
      })
      .join('')
    const words: string[] = []
    for (const { key } of days) {
      const word = history[key]
      if (word) words.push(`${key.slice(8)}: ${word}`)
    }
    const body = [
      memoryCopy.moods.intro(title),
      wall,
      memoryCopy.moods.legend,
      ...(words.length ? ['', ...words] : []),
    ]
    if (words.length === 0 && Object.keys(history).length === 0) return memoryCopy.moods.empty()
    return body.join('\n')
  },
}

function todayIs(key: string): boolean {
  const now = new Date()
  const key2 = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return key === key2
}

export default moods
