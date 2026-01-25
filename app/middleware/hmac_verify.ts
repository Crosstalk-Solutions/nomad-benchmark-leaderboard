import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'
import crypto from 'node:crypto'

// Maximum age of request timestamp (5 minutes)
const MAX_TIMESTAMP_AGE_MS = 5 * 60 * 1000

// Default HMAC secret - must match the one embedded in NOMAD
// Can be overridden via HMAC_SECRET env var for additional security
const DEFAULT_HMAC_SECRET = 'nomad-benchmark-v1-2026'

export default class HmacVerifyMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Use configured secret or default
    const hmacSecret = env.get('HMAC_SECRET') || DEFAULT_HMAC_SECRET

    const signature = ctx.request.header('X-NOMAD-Signature')
    const timestamp = ctx.request.header('X-NOMAD-Timestamp')

    // Check for required headers
    if (!signature || !timestamp) {
      return ctx.response.status(401).json({
        success: false,
        error: 'Missing HMAC signature. Please update to the latest version of NOMAD.',
      })
    }

    // Verify timestamp is recent (prevent replay attacks)
    const requestTime = parseInt(timestamp, 10)
    const now = Date.now()

    if (isNaN(requestTime)) {
      return ctx.response.status(401).json({
        success: false,
        error: 'Invalid timestamp format.',
      })
    }

    if (Math.abs(now - requestTime) > MAX_TIMESTAMP_AGE_MS) {
      return ctx.response.status(401).json({
        success: false,
        error: 'Request timestamp is too old. Please try again.',
      })
    }

    // Get the raw body for signature verification
    // Note: We need to use the raw JSON string, not the parsed object
    const rawBody = JSON.stringify(ctx.request.body())

    // Calculate expected signature: HMAC-SHA256(secret, timestamp + body)
    const payload = timestamp + rawBody
    const expectedSignature = crypto
      .createHmac('sha256', hmacSecret)
      .update(payload)
      .digest('hex')

    // Constant-time comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature, 'hex')
    const expectedBuffer = Buffer.from(expectedSignature, 'hex')

    if (signatureBuffer.length !== expectedBuffer.length) {
      return ctx.response.status(401).json({
        success: false,
        error: 'Invalid HMAC signature.',
      })
    }

    if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return ctx.response.status(401).json({
        success: false,
        error: 'Invalid HMAC signature.',
      })
    }

    await next()
  }
}
