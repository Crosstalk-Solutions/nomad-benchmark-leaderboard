import React from 'react'

interface Submission {
  rank: number
  repository_id: string
  cpu_model: string
  cpu_cores: number
  cpu_threads: number
  ram_gb: number
  disk_type: string
  gpu_model: string | null
  cpu_score: number
  memory_score: number
  disk_read_score: number
  disk_write_score: number
  ai_tokens_per_second: number | null
  nomad_score: number
  nomad_version: string
  created_at: string
}

interface LeaderboardTableProps {
  submissions: Submission[]
}

function getRankBadge(rank: number) {
  if (rank === 1) return 'bg-yellow-100 text-yellow-800'
  if (rank === 2) return 'bg-gray-100 text-gray-800'
  if (rank === 3) return 'bg-orange-100 text-orange-800'
  return 'bg-gray-50 text-gray-600'
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-green-600'
  if (score >= 40) return 'text-yellow-600'
  if (score >= 20) return 'text-orange-600'
  return 'text-red-600'
}

export default function LeaderboardTable({ submissions }: LeaderboardTableProps) {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No submissions yet. Be the first to submit your benchmark!
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              NOMAD Score
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CPU
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              GPU
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              RAM
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Disk
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              AI (tok/s)
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Version
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {submissions.map((submission) => (
            <tr key={submission.repository_id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${getRankBadge(submission.rank)}`}
                >
                  {submission.rank}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`text-lg font-bold ${getScoreColor(submission.nomad_score)}`}>
                  {submission.nomad_score.toFixed(1)}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="text-sm font-medium text-gray-900">{submission.cpu_model}</div>
                <div className="text-xs text-gray-500">
                  {submission.cpu_cores}C / {submission.cpu_threads}T
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {submission.gpu_model || <span className="text-gray-400">-</span>}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{submission.ram_gb} GB</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 uppercase">
                  {submission.disk_type}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {submission.ai_tokens_per_second?.toFixed(1) || <span className="text-gray-400">-</span>}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-xs text-gray-500">{submission.nomad_version}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
