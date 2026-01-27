import vine from '@vinejs/vine'

export const submitValidator = vine.compile(
  vine.object({
    cpu_model: vine.string().trim().minLength(1).maxLength(255),
    cpu_cores: vine.number().min(1).max(256),
    cpu_threads: vine.number().min(1).max(512),
    ram_gb: vine.number().min(1).max(2048),
    disk_type: vine.enum(['ssd', 'hdd', 'nvme', 'unknown']),
    gpu_model: vine.string().trim().maxLength(255).optional(),
    cpu_score: vine.number().min(0).max(100),
    memory_score: vine.number().min(0).max(100),
    disk_read_score: vine.number().min(0).max(100),
    disk_write_score: vine.number().min(0).max(100),
    ai_tokens_per_second: vine.number().min(0).optional(),
    ai_time_to_first_token: vine.number().min(0).optional(),
    nomad_score: vine.number().min(0).max(100),
    nomad_version: vine.string().trim().minLength(1).maxLength(50),
    benchmark_version: vine.string().trim().minLength(1).maxLength(50),
    // Optional: older NOMAD versions won't send this field
    builder_tag: vine.string().trim().maxLength(100).optional(),
  })
)

export const leaderboardQueryValidator = vine.compile(
  vine.object({
    limit: vine.number().min(1).max(500).optional(),
    offset: vine.number().min(0).optional(),
    sort: vine.enum(['nomad_score', 'cpu_score', 'memory_score', 'ai_tokens_per_second']).optional(),
    order: vine.enum(['asc', 'desc']).optional(),
  })
)
