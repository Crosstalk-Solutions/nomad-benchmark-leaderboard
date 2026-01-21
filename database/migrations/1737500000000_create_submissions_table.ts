import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'submissions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('repository_id').unique().notNullable()
      table.string('cpu_model').notNullable()
      table.integer('cpu_cores').notNullable()
      table.integer('cpu_threads').notNullable()
      table.integer('ram_gb').notNullable()
      table.enum('disk_type', ['ssd', 'hdd', 'nvme', 'unknown']).notNullable()
      table.string('gpu_model').nullable()
      table.float('cpu_score').notNullable()
      table.float('memory_score').notNullable()
      table.float('disk_read_score').notNullable()
      table.float('disk_write_score').notNullable()
      table.float('ai_tokens_per_second').nullable()
      table.float('ai_time_to_first_token').nullable()
      table.float('nomad_score').notNullable()
      table.string('nomad_version').notNullable()
      table.string('benchmark_version').notNullable()
      table.timestamp('created_at')
    })

    // Index for faster leaderboard queries
    this.schema.raw('CREATE INDEX idx_submissions_nomad_score ON submissions(nomad_score DESC)')
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
