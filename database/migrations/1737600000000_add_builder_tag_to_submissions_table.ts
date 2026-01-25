import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'submissions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Builder tag for community bragging rights (e.g., "Tactical-Llama-1234")
      // Nullable for backward compatibility with existing submissions
      table.string('builder_tag', 100).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('builder_tag')
    })
  }
}
