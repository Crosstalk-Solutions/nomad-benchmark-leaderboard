import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'

// In-memory rate limit store (no IP persistence)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

// Clean up expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now()
    for (const [key, value] of rateLimitStore) {
      if (value.resetAt < now) {
        rateLimitStore.delete(key)
      }
    }
  },
  5 * 60 * 1000
)

export default class RateLimitMiddleware {
  // 1 submission per hour per IP
  private readonly maxRequests = 1
  private readonly windowMs = 60 * 60 * 1000 // 1 hour

  async handle(ctx: HttpContext, next: NextFn) {
    // Dev mode bypass - check for valid dev API key
    const devKey = ctx.request.header('X-Dev-Key')
    const configuredDevKey = env.get('DEV_API_KEY')
    if (devKey && configuredDevKey && devKey === configuredDevKey) {
      // Dev mode - skip rate limiting
      return next()
    }

    const ip = ctx.request.ip()
    const now = Date.now()

    let record = rateLimitStore.get(ip)

    if (!record || record.resetAt < now) {
      // Create new record
      record = { count: 1, resetAt: now + this.windowMs }
      rateLimitStore.set(ip, record)
    } else {
      record.count++
    }

    // Set rate limit headers
    ctx.response.header('X-RateLimit-Limit', this.maxRequests.toString())
    ctx.response.header('X-RateLimit-Remaining', Math.max(0, this.maxRequests - record.count).toString())
    ctx.response.header('X-RateLimit-Reset', Math.ceil(record.resetAt / 1000).toString())

    if (record.count > this.maxRequests) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000)
      ctx.response.header('Retry-After', retryAfter.toString())
      return ctx.response.status(429).json({
        success: false,
        error: 'Rate limit exceeded. You may submit one benchmark per hour.',
        retryAfter,
      })
    }

    await next()
  }
}
