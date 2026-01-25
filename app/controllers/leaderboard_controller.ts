import type { HttpContext } from '@adonisjs/core/http'
import Submission from '#models/submission'
import { StatsService } from '#services/stats_service'

export default class LeaderboardController {
  /**
   * GET /
   * Home page with stats overview
   */
  async home({ inertia }: HttpContext) {
    const quickStats = await StatsService.getQuickStats()
    const recentSubmissions = await Submission.query()
      .orderBy('created_at', 'desc')
      .limit(5)
      .select([
        'repository_id',
        'cpu_model',
        'gpu_model',
        'nomad_score',
        'created_at',
      ])

    return inertia.render('home', {
      stats: quickStats,
      recentSubmissions: recentSubmissions.map((s) => s.serialize()),
    })
  }

  /**
   * GET /leaderboard
   * Full leaderboard page with rankings and stats
   */
  async leaderboard({ inertia }: HttpContext) {
    // Get top 100 submissions
    const submissions = await Submission.query()
      .orderBy('nomad_score', 'desc')
      .limit(100)
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
        'nomad_score',
        'nomad_version',
        'builder_tag',
        'created_at',
      ])

    // Get full stats
    const stats = await StatsService.getStats()

    return inertia.render('leaderboard', {
      submissions: submissions.map((s, index) => ({
        rank: index + 1,
        ...s.serialize(),
      })),
      stats,
    })
  }
}
