import type { HttpContext } from '@adonisjs/core/http'
import Submission from '#models/submission'
import { submitValidator, leaderboardQueryValidator } from '#validators/submission_validator'
import { StatsService } from '#services/stats_service'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'node:crypto'
import db from '@adonisjs/lucid/services/db'

// Plausibility bounds - generous limits for future hardware
// If you believe your result was incorrectly rejected, open an issue:
// https://github.com/Crosstalk-Solutions/nomad-benchmark-leaderboard/issues
const PLAUSIBILITY_LIMITS = {
  ai_tokens_per_second: { max: 500 }, // Even high-end GPUs rarely exceed 200
  ai_time_to_first_token: { min: 0.01 }, // Can't be essentially instant
  cpu_cores: { max: 256 },
  cpu_threads: { max: 512 },
  ram_gb: { max: 2048 },
}

/**
 * Generate a hardware fingerprint for duplicate detection
 * Format: SHA256 hash of "cpu_model|gpu_model|ram_gb|builder_tag"
 */
function generateFingerprint(
  cpuModel: string,
  gpuModel: string | null,
  ramGb: number,
  builderTag: string | null
): string {
  const components = [
    cpuModel.toLowerCase().trim(),
    (gpuModel || 'none').toLowerCase().trim(),
    ramGb.toString(),
    (builderTag || 'anonymous').toLowerCase().trim(),
  ]
  return crypto.createHash('sha256').update(components.join('|')).digest('hex')
}

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

    // Plausibility checks - reject obviously impossible values
    if (data.ai_tokens_per_second && data.ai_tokens_per_second > PLAUSIBILITY_LIMITS.ai_tokens_per_second.max) {
      return response.status(400).json({
        success: false,
        error: `AI tokens per second (${data.ai_tokens_per_second}) exceeds plausible maximum (${PLAUSIBILITY_LIMITS.ai_tokens_per_second.max}). If you believe this is a valid result, please open an issue: https://github.com/Crosstalk-Solutions/nomad-benchmark-leaderboard/issues`,
      })
    }

    if (data.ai_time_to_first_token && data.ai_time_to_first_token < PLAUSIBILITY_LIMITS.ai_time_to_first_token.min) {
      return response.status(400).json({
        success: false,
        error: `AI time to first token (${data.ai_time_to_first_token}s) is below plausible minimum (${PLAUSIBILITY_LIMITS.ai_time_to_first_token.min}s). If you believe this is a valid result, please open an issue: https://github.com/Crosstalk-Solutions/nomad-benchmark-leaderboard/issues`,
      })
    }

    // Generate hardware fingerprint for duplicate detection
    const fingerprint = generateFingerprint(
      data.cpu_model,
      data.gpu_model || null,
      data.ram_gb,
      data.builder_tag || null
    )

    // Get submitter IP for abuse tracking (never exposed publicly)
    const submitterIp = request.ip()

    // Use a transaction to prevent race conditions in duplicate detection
    const result = await db.transaction(async (trx) => {
      const existingSubmission = await Submission.query({ client: trx })
        .where('hardware_fingerprint', fingerprint)
        .first()

      if (existingSubmission) {
        // Duplicate detected - check if new score is higher
        if (data.nomad_score <= existingSubmission.nomad_score) {
          return {
            status: 409,
            body: {
              success: false,
              error: `A submission with this hardware configuration and Builder Tag already exists with a higher or equal score (${existingSubmission.nomad_score.toFixed(1)} vs your ${data.nomad_score.toFixed(1)}). Run another benchmark to try for a higher score.`,
              existing_score: existingSubmission.nomad_score,
              existing_repository_id: existingSubmission.repository_id,
            },
          }
        }

        // New score is higher - update existing entry
        existingSubmission.useTransaction(trx)
        existingSubmission.merge({
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
          builder_tag: data.builder_tag || null,
          submitter_ip: submitterIp,
        })
        await existingSubmission.save()

        return {
          status: 200,
          repositoryId: existingSubmission.repository_id,
          nomadScore: existingSubmission.nomad_score,
          updated: true,
        }
      }

      // No duplicate - create new submission
      const repositoryId = uuidv4()
      const submission = new Submission()
      submission.useTransaction(trx)
      submission.fill({
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
        builder_tag: data.builder_tag || null,
        hardware_fingerprint: fingerprint,
        submitter_ip: submitterIp,
      })
      await submission.save()

      return {
        status: 201,
        repositoryId,
        nomadScore: submission.nomad_score,
        updated: false,
      }
    })

    // Handle rejection (duplicate with lower score)
    if (result.status === 409) {
      return response.status(409).json(result.body)
    }

    // Calculate percentile outside the transaction to minimize lock duration
    const percentile = await StatsService.calculatePercentile(result.nomadScore!)

    if (result.updated) {
      return response.status(200).json({
        success: true,
        repository_id: result.repositoryId,
        percentile,
        updated: true,
        message: 'Your previous submission has been updated with your new higher score.',
      })
    }

    return response.status(201).json({
      success: true,
      repository_id: result.repositoryId,
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
