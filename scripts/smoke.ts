// Task 1 smoke test: verifies Baileys 7.x loads under Bun (native deps:
// libsignal, whatsapp-rust-bridge). Import-only, no network. Exits 1 on fail.
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys'

const version = await fetchLatestBaileysVersion().catch(() => null)
console.log('[smoke] baileys import OK — makeWASocket:', typeof makeWASocket)
console.log('[smoke] fetchLatestBaileysVersion:', JSON.stringify(version))
console.log('[smoke] DisconnectReason.loggedOut:', DisconnectReason.loggedOut)
console.log('[smoke] Browsers.ubuntu keys:', Object.keys(Browsers).length)

if (typeof makeWASocket !== 'function') {
  console.error('[smoke] FAIL: unexpected import shape')
  process.exit(1)
}
process.exit(0)
