import Submission from '#models/submission'
import db from '@adonisjs/lucid/services/db'

export class StatsService {
  /**
   * Calculate the percentile rank for a given NOMAD score
   */
  static async calculatePercentile(nomadScore: number): Promise<number> {
    const totalCount = await Submission.query().count('* as total')
    const total = Number(totalCount[0].$extras.total)

    if (total === 0) return 100

    const belowCount = await Submission.query()
      .where('nomad_score', '<', nomadScore)
      .count('* as count')
    const below = Number(belowCount[0].$extras.count)

    return Math.round((below / total) * 1000) / 10 // One decimal place
  }

  /**
   * Get aggregate statistics
   */
  static async getStats() {
    // Get total count
    const totalResult = await Submission.query().count('* as total')
    const totalSubmissions = Number(totalResult[0].$extras.total)

    if (totalSubmissions === 0) {
      return {
        total_submissions: 0,
        average_nomad_score: 0,
        median_nomad_score: 0,
        score_distribution: {
          '0-20': 0,
          '20-40': 0,
          '40-60': 0,
          '60-80': 0,
          '80-100': 0,
        },
        top_cpu_models: [],
        top_gpu_models: [],
      }
    }

    // Get average score
    const avgResult = await Submission.query().avg('nomad_score as avg')
    const averageNomadScore = Math.round(Number(avgResult[0].$extras.avg) * 10) / 10

    // Get median score
    const medianResult = await db.rawQuery(`
      SELECT nomad_score FROM submissions
      ORDER BY nomad_score
      LIMIT 1 OFFSET ?
    `, [Math.floor(totalSubmissions / 2)])
    const medianNomadScore = medianResult[0]?.nomad_score || 0

    // Get score distribution
    const distributionResult = await db.rawQuery(`
      SELECT
        SUM(CASE WHEN nomad_score >= 0 AND nomad_score < 20 THEN 1 ELSE 0 END) as "0-20",
        SUM(CASE WHEN nomad_score >= 20 AND nomad_score < 40 THEN 1 ELSE 0 END) as "20-40",
        SUM(CASE WHEN nomad_score >= 40 AND nomad_score < 60 THEN 1 ELSE 0 END) as "40-60",
        SUM(CASE WHEN nomad_score >= 60 AND nomad_score < 80 THEN 1 ELSE 0 END) as "60-80",
        SUM(CASE WHEN nomad_score >= 80 AND nomad_score <= 100 THEN 1 ELSE 0 END) as "80-100"
      FROM submissions
    `)
    const dist = distributionResult[0] || {}
    const scoreDistribution = {
      '0-20': Number(dist['0-20']) || 0,
      '20-40': Number(dist['20-40']) || 0,
      '40-60': Number(dist['40-60']) || 0,
      '60-80': Number(dist['60-80']) || 0,
      '80-100': Number(dist['80-100']) || 0,
    }

    // Get top CPU models
    const topCpuModels = await db.rawQuery(`
      SELECT cpu_model, COUNT(*) as count, AVG(nomad_score) as avg_score
      FROM submissions
      GROUP BY cpu_model
      ORDER BY count DESC
      LIMIT 10
    `)

    // Get top GPU models
    const topGpuModels = await db.rawQuery(`
      SELECT gpu_model, COUNT(*) as count, AVG(nomad_score) as avg_score
      FROM submissions
      WHERE gpu_model IS NOT NULL
      GROUP BY gpu_model
      ORDER BY count DESC
      LIMIT 10
    `)

    return {
      total_submissions: totalSubmissions,
      average_nomad_score: averageNomadScore,
      median_nomad_score: Math.round(medianNomadScore * 10) / 10,
      score_distribution: scoreDistribution,
      top_cpu_models: topCpuModels.map((row: any) => ({
        model: row.cpu_model,
        count: Number(row.count),
        avgScore: Math.round(Number(row.avg_score) * 10) / 10,
      })),
      top_gpu_models: topGpuModels.map((row: any) => ({
        model: row.gpu_model,
        count: Number(row.count),
        avgScore: Math.round(Number(row.avg_score) * 10) / 10,
      })),
    }
  }

  /**
   * Get quick stats for home page
   */
  static async getQuickStats() {
    const totalResult = await Submission.query().count('* as total')
    const total = Number(totalResult[0].$extras.total)

    if (total === 0) {
      return {
        totalSubmissions: 0,
        averageScore: 0,
        topScore: 0,
      }
    }

    const avgResult = await Submission.query().avg('nomad_score as avg')
    const maxResult = await Submission.query().max('nomad_score as max')

    return {
      totalSubmissions: total,
      averageScore: Math.round(Number(avgResult[0].$extras.avg) * 10) / 10,
      topScore: Math.round(Number(maxResult[0].$extras.max) * 10) / 10,
    }
  }
}
