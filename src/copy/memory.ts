/** copy: memory pack (mood / moment / yearbook / wrap / forget) */

export const memoryCopy = {
  mood: {
    saved: (word: string) => `logged: ${word}. one of them days.`,
    tooLong: () => 'one word, six letters max. brevity is the whole mechanic.',
    empty: () => 'drop a word after the command — the word IS the day.',
  },
  moods: {
    empty: () => pick2([
      'the month wall is blank. that is allowed too.',
      'no words logged yet. (also fine.)',
    ]),
    intro: (month: string) => `mood wall, ${month}:`,
    legend: '· nothing logged   ▓ something   ◉ today',
  },
  moment: {
    saved: (word: string) => pick2([
      `stored: ${word}. filed for yearbook review.`,
      `${word} — saved under today's date. someday-you will see this.`,
    ]),
  },
  yearbook: {
    empty: () => 'an empty yearbook. louder than most, actually.',
    intro: () => 'your moment yearbook:',
  },
  grass: {
    count: (n: number) => `grass touches this week: ${n}.`
  },
  forget: {
    done: () => 'gone. no backup, no farewell. you owe this log nothing.',
  },
}

/** tiny local pick helper (copy files must not import) */
function pick2(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)]
}
