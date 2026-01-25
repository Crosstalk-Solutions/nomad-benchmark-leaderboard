import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

// Use DATABASE_PATH env var if set (for persistent storage on Render),
// otherwise fall back to tmp directory (for local development)
const dbPath = process.env.DATABASE_PATH || app.makePath('tmp/database.sqlite')
const dbDir = dirname(dbPath)
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true })
}

const dbConfig = defineConfig({
  connection: 'sqlite',
  connections: {
    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: dbPath,
      },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
