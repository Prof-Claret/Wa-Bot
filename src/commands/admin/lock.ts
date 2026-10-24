/**
 * owner corner: pause state lives in-process (a restart always un-pauses —
 * designed, since "pause" is a transient owner gesture, not durable policy).
 */

let paused = false

export function isPaused(): boolean {
  return paused
}

export function setPaused(on: boolean): void {
  paused = on
}
