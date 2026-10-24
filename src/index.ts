import { config } from './config'
import { startConnection } from './connection'
import { state } from './state'

/**
 * Wa-Bot entrypoint: validated config → durable state → Baileys connection.
 * All event wiring lives in connection.ts; commands never touch sockets.
 */

console.log(`[wa-bot] pairing mode: ${config.pairingMode}`)
if (config.pairingMode === 'code') console.log(`[wa-bot] requestPairingCode target: +${config.phoneNumber}`)

state(config) // open the local-only store up front; fail fast on a corrupt file
stringBanner()

void startConnection(config)

function stringBanner(): void {
  console.log(`
  Wa-Bot v0.1 — uselessly helpful, on purpose.
  charter: cannot be failed · nobody's watching · celebrates subtraction
`)
}
