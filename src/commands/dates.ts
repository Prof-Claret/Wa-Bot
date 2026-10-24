/** small date-key helpers used by state-ful commands */

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** rough ISO-ish week key "YYYY-Www" — used for grass counts only */
export function weekKey(d: Date = new Date()): string {
  const first = new Date(d.getFullYear(), 0, 1)
  const dayOfYear = Math.floor((d.getTime() - first.getTime()) / 86400000) + 1
  const week = Math.ceil(dayOfYear / 7)
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
}

export function daysInMonth(d: Date = new Date()): { key: string; day: number }[] {
  const year = d.getFullYear()
  const month = d.getMonth()
  const last = new Date(year, month + 1, 0).getDate()
  const out: { key: string; day: number }[] = []
  for (let day = 1; day <= last; day++) {
    out.push({ key: todayKey(new Date(year, month, day)), day })
  }
  return out
}

export function capReliable(ts?: number): number {
  return ts && ts > 0 && ts <= Date.now() + 60_000 ? ts : Date.now()
}
