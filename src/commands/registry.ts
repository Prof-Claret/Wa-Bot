import type { CommandDef } from './index'
import ping from './builtin/ping'
import help from './builtin/help'
import whoami from './builtin/whoami'
import breathe from './core/breathe'
import hydrate from './core/hydrate'
import drank from './core/drank'
import vibe from './core/vibe'
import compliment from './core/compliment'
import cocoon, { nap } from './nothing/cocoon'
import touchgrass from './nothing/touchgrass'
import touched from './nothing/touched'
import mood from './memory/mood'
import moods from './memory/moods'
import moment from './memory/moment'
import yearbook from './memory/yearbook'
import countgrass from './memory/countgrass'
import forget from './memory/forget'
import excuse from './chaos/excuse'
import yell from './chaos/yell'
import whisper from './chaos/whisper'
import lament from './chaos/lament'
import pause from './admin/pause'
import resume from './admin/resume'
import stats from './admin/stats'

export const commands: CommandDef[] = [
  ping,
  help,
  whoami,
  breathe,
  hydrate,
  drank,
  vibe,
  compliment,
  cocoon,
  nap,
  touchgrass,
  touched,
  mood,
  moods,
  moment,
  yearbook,
  countgrass,
  forget,
  excuse,
  yell,
  whisper,
  lament,
  pause,
  resume,
  stats,
]
