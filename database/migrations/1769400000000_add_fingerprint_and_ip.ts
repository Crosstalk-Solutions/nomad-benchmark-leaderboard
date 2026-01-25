import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'submissions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Hardware fingerprint for duplicate detection
      // Format: hash of (cpu_model|gpu_model|ram_gb|builder_tag)
      table.string('hardware_fingerprint', 64).nullable().index()

      // Store submitter IP for abuse tracking (NEVER expose publicly)
      table.string('submitter_ip', 45).nullable() // 45 chars to support IPv6
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('hardware_fingerprint')
      table.dropColumn('submitter_ip')
    })
  }
}
