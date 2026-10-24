// env must be set BEFORE any src module evaluates — side-effect import first
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

process.env.PAIRING_MODE = 'qrcode'
process.env.MIN_SEND_INTERVAL_MS = '0'
process.env.OWNER_SELF = 'false'
process.env.OWNER = '15557776666'
process.env.DATA_DIR = (globalThis as { __WABOT_TMP__?: string }).__WABOT_TMP__ ??=
  mkdtempSync(path.join(tmpdir(), 'wabot-dispatch-'))
process.env.AUTH_DIR = path.join(process.env.DATA_DIR, '.session')
