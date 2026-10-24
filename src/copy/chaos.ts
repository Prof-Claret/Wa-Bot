/** copy: chaos comfort pack (excuse / yell / whisper / lament) */

function pick(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)]
}

export const chaosCopy = {
  excuse: {
    intro: () =>
      pick(['excuse deployed:', 'here, and defensible in a court of other people:', 'use this and never look back:']),
    missingThing: () => 'tell me the thing you are avoiding, and I will excuse it properly.',
    items: [
      (thing: string) => `${thing} — status: unexplained. Do not remind.`,
      (thing: string) => `the paperwork for ${thing} was lost in the post. all post. lost for everybody.`,
      (thing: string) => `the week for ${thing} was quietly renamed. Several of us agreed.`,
      (thing: string) => `you already paid for ${thing} in spirit. Currency rules say that counts.`,
      (thing: string) => `${thing} requires your whole self. It is reserved for later.`,
    ],
    render: (thing: string): string =>
      chaosCopy.excuse.items[Math.floor(Math.random() * chaosCopy.excuse.items.length)](thing),
  },
  yell: {
    intro: () => pick(['shout received. absorbing.', 'collected your shout. processing.']),
    whisper: () =>
      pick([
        'it heard you and dissolved into something calmer.',
        'the shout went somewhere warm and came back as: fine.',
        'we ran cold water on it. it shrank to: ok.',
      ]),
    whisperQuiet: () =>
      pick(['(quietly) received. quietly back: everything is okay.', '(softly) heard. kept. not echoed.']),
  },
  lament: () =>
    pick([
      'solidarity. wordless and continuous.',
      'yes. we both know.',
      'I have no advice, and I have cleared space for that.',
      'agreeing atmospherically.',
      'the mood has been acknowledged in the general ledger.',
      'sitting with it, together, wrongness and all.',
    ]),
}
