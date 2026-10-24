import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys'
import QRCode from 'qrcode-terminal'
import type { WASocket } from '@whiskeysockets/baileys'
import pino from 'pino'
import type { BotConfig } from './config'
import { normalize } from './messages'
import { dispatch } from './dispatcher'
import { setSocket } from './send'

/**
 * Connection lifecycle owns every Baileys quirk in one file (STRUCTURE.md):
 * pairing (QR in terminal OR pairing code), single-client-per-auth-state rule,
 * reconnect with capped backoff, wipe-on-loggedOut.
 */

export async function startConnection(cfg: BotConfig): Promise<WASocket> {
  let attempt = 0
  let pairingCodeRequested = false
  let qrPrinted = false

  const logger = pino({ level: cfg.baileysLogLevel })

  const cleanAuth = async () => {
    try {
      await (await import('node:fs/promises')).rm(cfg.authDir, { recursive: true, force: true })
    } catch {
      /* nothing to clean */
    }
  }

  const connect = async (): Promise<WASocket> => {
    const [{ state, saveCreds }] = await Promise.all([useMultiFileAuthState(cfg.authDir)])
    const fetched = await fetchLatestBaileysVersion().catch((err) => {
      console.error('[connection] version fetch failed, using bundled default:', (err as Error).message)
      return null
    })

    const sock = makeWASocket({
      version: fetched?.version,
      auth: state,
      logger,
      browser: Browsers.macOS('Chrome'),
      markOnlineOnConnect: false,
      printQRInTerminal: false, // 7.x: we render QR ourselves below
      syncFullHistory: false,
    })

    setSocket(cfg, sock)
    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        if (cfg.pairingMode === 'qrcode' && !qrPrinted) {
          qrPrinted = true
          QRCode.generate(qr, { small: true }, (out) => {
            console.log('\nScan this QR in WhatsApp → Settings → Linked devices → Link a device:')
            console.log(out)
          })
        }
        // QR present means this client is unpaired; pairing-code mode requests here.
        if (cfg.pairingMode === 'code' && !pairingCodeRequested) {
          pairingCodeRequested = true
          console.log(`\nRequesting pairing code for +${cfg.phoneNumber}…`)
          const code = await sock.requestPairingCode(cfg.phoneNumber).catch((err) => {
            console.error('[connection] pairing code request failed:', (err as Error).message)
            return null
          })
          if (code) {
            console.log(`\n>>> PAIRING CODE: ${code}`)
            console.log('Enter it in WhatsApp → Settings → Linked devices → Link with phone number.\n')
          }
        }
      }

      if (connection === 'open') {
        console.log(`[connection] connected as ${sock.user?.name ?? sock.user?.id ?? '(unknown)'}`)
        attempt = 0
      }

      if (connection === 'close') {
        setSocket(cfg, null) // dispatcher and commands now become no-ops
        const err = lastDisconnect?.error as { output?: { statusCode?: number } } | undefined
        const code = err?.output?.statusCode
        if (code === DisconnectReason.loggedOut) {
          console.error('[connection] logged out from the phone. Wiping auth state so the next run can pair again.')
          await cleanAuth()
          process.exit(1)
        }
        if (code === DisconnectReason.connectionReplaced || code === DisconnectReason.connectionClosed) {
          console.error('[connection] session replaced or conflicted.')
          console.error('[connection] Two clients on one auth state log both out (401/440). Stop the other Wa-Bot process (or stale WhatsApp Web session) and retry.')
          process.exit(1)
        }
        attempt += 1
        const delaySec = Math.min(2 ** Math.min(attempt, 6), 120)
        console.warn(`[connection] closed (code ${code ?? 'unknown'}). Reconnecting in ${delaySec}s (attempt ${attempt})`)
        setTimeout(() => {
          void connect()
        }, delaySec * 1000)
      }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const raw of messages) {
        const msg = normalize(raw)
        if (msg) {
          try {
            await dispatch(cfg, msg)
          } catch (err) {
            console.error('[connection] dispatch error:', (err as Error).stack ?? err)
          }
        }
      }
    })

    return sock
  }

  return connect()
}
