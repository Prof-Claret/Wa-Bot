/** copy: the "doing nothing" pack (cocoon / nap / grass / nothing ceremony) */

function pick(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)]
}

export const nothingCopy = {
  cocoon: {
    enter: (min: number) =>
      `entering ${min} minutes of nothing. you are put away. the world is told not to miss you.`,
    wake: (min: number) =>
      pick([
        `${min} minutes. did nothing on purpose. proud of you.`,
        `wake up: you were away ${min} min and achieved nothing. that was the assignment.`,
        `${min} min of nothing. complete.`,
      ]),
  },
  grass: {
    assign: () =>
      pick([
        'homework: 2 minutes of grass-adjacent presence. balcony counts. shoes optional.',
        'go touch grass (small version). 120 seconds. I accept the report without evidence.',
        'grass homework deployed. two minutes. you will not be graded.',
      ]),
    touched: () =>
      pick([
        'accepted. report filed. grass status: touched.',
        'granted. one of the outside people now. welcome.',
        'on record. no further proof required or desired.',
      ]),
    count: (n: number) => `grass touches recently: ${n}. none of them graded.`,
  },
  nothing: {
    start: () => 'a sixty-second demo of doing nothing together. begun.',
    end: () => pick(['sixty seconds of nothing, complete.', 'nothing: done. repeat tomorrow, badly.']),
  },
}
