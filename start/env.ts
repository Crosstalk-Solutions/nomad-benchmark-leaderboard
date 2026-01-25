import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number({ message: 'PORT must be defined' }),
  APP_KEY: Env.schema.string({ message: 'APP_KEY must be defined' }),
  HOST: Env.schema.string({ format: 'host', message: 'HOST must be defined' }),
  LOG_LEVEL: Env.schema.string.optional(),

  // Optional dev API key for bypassing rate limits during testing
  DEV_API_KEY: Env.schema.string.optional(),

  // HMAC secret for verifying submissions from NOMAD installations
  // Submissions without valid HMAC signature will be rejected
  HMAC_SECRET: Env.schema.string.optional(),
})
