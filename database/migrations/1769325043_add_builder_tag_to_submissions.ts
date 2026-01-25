import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'submissions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Nullable for backward compatibility with existing submissions
      // and older NOMAD versions that don't send builder_tag
      table.string('builder_tag', 64).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('builder_tag')
    })
  }
}
