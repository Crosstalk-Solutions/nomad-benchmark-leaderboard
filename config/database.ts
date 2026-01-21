import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

// Ensure database directory exists
const dbPath = app.makePath('tmp/database.sqlite')
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
