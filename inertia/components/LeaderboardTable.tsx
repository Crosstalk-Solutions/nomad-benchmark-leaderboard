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
  builder_tag: string | null
  created_at: string
}

interface LeaderboardTableProps {
  submissions: Submission[]
}

function getRankBadge(rank: number) {
  if (rank === 1) return 'bg-yellow-500 text-white'
  if (rank === 2) return 'bg-gray-400 text-white'
  if (rank === 3) return 'bg-amber-700 text-white'
  return 'bg-nomad-olive-mid/15 text-nomad-olive-mid'
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-nomad-olive'
  if (score >= 60) return 'text-nomad-olive-mid'
  if (score >= 40) return 'text-yellow-600'
  if (score >= 20) return 'text-orange-600'
  return 'text-red-600'
}

export default function LeaderboardTable({ submissions }: LeaderboardTableProps) {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 text-nomad-olive-mid">
        No submissions yet. Be the first to submit your benchmark!
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-nomad-olive-mid/15">
        <thead>
          <tr className="bg-nomad-olive text-nomad-surface">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Builder
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              NOMAD Score
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              CPU
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              GPU
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              RAM
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Disk
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              AI (tok/s)
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Version
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-nomad-olive-mid/10">
          {submissions.map((submission) => (
            <tr
              key={submission.repository_id}
              className={`hover:bg-nomad-olive-faint transition-colors ${submission.rank === 1 ? 'bg-yellow-50/50' : ''}`}
            >
              <td className="px-4 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${getRankBadge(submission.rank)}`}
                >
                  {submission.rank}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {submission.builder_tag ? (
                  <span className="font-mono text-sm font-medium text-nomad-olive">
                    {submission.builder_tag}
                  </span>
                ) : (
                  <span className="text-sm text-nomad-gray italic">Anonymous</span>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`text-lg font-bold ${getScoreColor(submission.nomad_score)}`}>
                  {submission.nomad_score.toFixed(1)}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="text-sm font-medium text-nomad-text">{submission.cpu_model}</div>
                <div className="text-xs text-nomad-text-muted">
                  {submission.cpu_cores}C / {submission.cpu_threads}T
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-nomad-text">
                  {submission.gpu_model || <span className="text-nomad-gray">-</span>}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-nomad-text">{submission.ram_gb} GB</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-nomad-olive-mid/15 text-nomad-olive uppercase">
                  {submission.disk_type}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-nomad-text">
                  {submission.ai_tokens_per_second?.toFixed(1) || <span className="text-nomad-gray">-</span>}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-xs text-nomad-text-muted">{submission.nomad_version}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
