import { BaseModel, column, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Submission extends BaseModel {
  static namingStrategy = new SnakeCaseNamingStrategy()

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare repository_id: string

  @column()
  declare cpu_model: string

  @column()
  declare cpu_cores: number

  @column()
  declare cpu_threads: number

  @column()
  declare ram_gb: number

  @column()
  declare disk_type: 'ssd' | 'hdd' | 'nvme' | 'unknown'

  @column()
  declare gpu_model: string | null

  @column()
  declare cpu_score: number

  @column()
  declare memory_score: number

  @column()
  declare disk_read_score: number

  @column()
  declare disk_write_score: number

  @column()
  declare ai_tokens_per_second: number | null

  @column()
  declare ai_time_to_first_token: number | null

  @column()
  declare nomad_score: number

  @column()
  declare nomad_version: string

  @column()
  declare benchmark_version: string

  @column()
  declare builder_tag: string | null

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime
}
