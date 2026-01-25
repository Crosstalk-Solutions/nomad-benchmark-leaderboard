import type { HttpContext } from '@adonisjs/core/http'
import Submission from '#models/submission'
import { submitValidator, leaderboardQueryValidator } from '#validators/submission_validator'
import { StatsService } from '#services/stats_service'
import { v4 as uuidv4 } from 'uuid'

export default class SubmissionsController {
  /**
   * POST /api/v1/submit
   * Receive benchmark submission from NOMAD installations
   */
  async submit({ request, response }: HttpContext) {
    const data = await request.validateUsing(submitValidator)

    // Additional validation: threads must be >= cores
    if (data.cpu_threads < data.cpu_cores) {
      return response.status(400).json({
        success: false,
        error: 'cpu_threads must be greater than or equal to cpu_cores',
      })
    }

    // Generate unique repository ID
    const repositoryId = uuidv4()

    // Create submission
    const submission = await Submission.create({
      repository_id: repositoryId,
      cpu_model: data.cpu_model,
      cpu_cores: data.cpu_cores,
      cpu_threads: data.cpu_threads,
      ram_gb: data.ram_gb,
      disk_type: data.disk_type,
      gpu_model: data.gpu_model || null,
      cpu_score: data.cpu_score,
      memory_score: data.memory_score,
      disk_read_score: data.disk_read_score,
      disk_write_score: data.disk_write_score,
      ai_tokens_per_second: data.ai_tokens_per_second || null,
      ai_time_to_first_token: data.ai_time_to_first_token || null,
      nomad_score: data.nomad_score,
      nomad_version: data.nomad_version,
      benchmark_version: data.benchmark_version,
      // Optional: older NOMAD versions won't send this, defaults to null (anonymous)
      builder_tag: data.builder_tag || null,
    })

    // Calculate percentile
    const percentile = await StatsService.calculatePercentile(submission.nomad_score)

    return response.status(201).json({
      success: true,
      repository_id: repositoryId,
      percentile,
    })
  }

  /**
   * GET /api/v1/leaderboard
   * Get ranked list of all submissions
   */
  async leaderboard({ request, response }: HttpContext) {
    const query = await request.validateUsing(leaderboardQueryValidator)

    const limit = query.limit || 100
    const offset = query.offset || 0
    const sortBy = query.sort || 'nomad_score'
    const order = query.order || 'desc'

    const submissions = await Submission.query()
      .orderBy(sortBy, order)
      .limit(limit)
      .offset(offset)
      .select([
        'id',
        'repository_id',
        'cpu_model',
        'cpu_cores',
        'cpu_threads',
        'ram_gb',
        'disk_type',
        'gpu_model',
        'cpu_score',
        'memory_score',
        'disk_read_score',
        'disk_write_score',
        'ai_tokens_per_second',
        'ai_time_to_first_token',
        'nomad_score',
        'nomad_version',
        'benchmark_version',
        'builder_tag',
        'created_at',
      ])

    const totalResult = await Submission.query().count('* as total')
    const total = Number(totalResult[0].$extras.total)

    return response.json({
      submissions: submissions.map((s, index) => ({
        rank: offset + index + 1,
        ...s.serialize(),
      })),
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
    })
  }

  /**
   * GET /api/v1/stats
   * Get aggregate statistics
   */
  async stats({ response }: HttpContext) {
    const stats = await StatsService.getStats()
    return response.json(stats)
  }

  /**
   * GET /api/v1/submission/:id
   * Get a specific submission by repository_id
   */
  async show({ params, response }: HttpContext) {
    const submission = await Submission.query()
      .where('repository_id', params.id)
      .first()

    if (!submission) {
      return response.status(404).json({
        success: false,
        error: 'Submission not found',
      })
    }

    // Calculate percentile for this submission
    const percentile = await StatsService.calculatePercentile(submission.nomad_score)

    // Get rank
    const rankResult = await Submission.query()
      .where('nomad_score', '>', submission.nomad_score)
      .count('* as rank')
    const rank = Number(rankResult[0].$extras.rank) + 1

    return response.json({
      ...submission.serialize(),
      rank,
      percentile,
    })
  }
}
