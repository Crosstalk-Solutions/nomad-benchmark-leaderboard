import { Head, Link } from '@inertiajs/react'
import React from 'react'

interface Props {
  stats: {
    totalSubmissions: number
    averageScore: number
    topScore: number
  }
  recentSubmissions: Array<{
    repository_id: string
    cpu_model: string
    gpu_model: string | null
    nomad_score: number
    builder_tag: string | null
    created_at: string
  }>
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-nomad-olive'
  if (score >= 60) return 'text-nomad-olive-mid'
  if (score >= 40) return 'text-yellow-600'
  if (score >= 20) return 'text-orange-600'
  return 'text-red-600'
}

export default function Home({ stats, recentSubmissions }: Props) {
  return (
    <>
      <Head title="Home" />

      <div className="min-h-screen bg-nomad-cream">
        {/* Header */}
        <header className="bg-nomad-cream border-b border-nomad-olive-mid/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="/project_nomad_logo.png"
                  alt="NOMAD Logo"
                  className="w-10 h-10 rounded-lg"
                />
                <div>
                  <h1 className="text-xl font-bold text-nomad-olive">NOMAD Benchmark</h1>
                  <p className="text-xs text-nomad-olive-mid">Community Leaderboard</p>
                </div>
              </div>
              <nav className="flex items-center space-x-4">
                <Link
                  href="/leaderboard"
                  className="text-sm font-medium text-nomad-olive-mid hover:text-nomad-olive"
                >
                  Leaderboard
                </Link>
                <a
                  href="https://github.com/Crosstalk-Solutions/project-nomad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-nomad-olive-mid hover:text-nomad-olive"
                >
                  GitHub
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-nomad-olive sm:text-5xl tracking-tight">
              Project N.O.M.A.D.
            </h2>
            <p className="mt-4 text-xl text-nomad-olive-mid max-w-2xl mx-auto">
              Community benchmark leaderboard for offline-first knowledge servers.
              See how your hardware stacks up.
            </p>
            <div className="mt-8">
              <Link
                href="/leaderboard"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-nomad-olive hover:bg-nomad-olive-dark transition-colors"
              >
                View Leaderboard
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-nomad-surface border border-nomad-olive-mid/20 rounded-xl p-8 text-center">
              <div className="text-5xl font-bold text-nomad-olive">{stats.totalSubmissions}</div>
              <div className="mt-2 text-sm text-nomad-olive-mid uppercase tracking-wider">Total Submissions</div>
            </div>
            <div className="bg-nomad-surface border border-nomad-olive-mid/20 rounded-xl p-8 text-center">
              <div className="text-5xl font-bold text-nomad-olive">{stats.averageScore || '-'}</div>
              <div className="mt-2 text-sm text-nomad-olive-mid uppercase tracking-wider">Average Score</div>
            </div>
            <div className="bg-nomad-surface border border-nomad-olive-mid/20 rounded-xl p-8 text-center">
              <div className="text-5xl font-bold text-nomad-rust">{stats.topScore || '-'}</div>
              <div className="mt-2 text-sm text-nomad-olive-mid uppercase tracking-wider">Top Score</div>
            </div>
          </div>

          {/* Recent Submissions */}
          {recentSubmissions.length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-nomad-olive mb-6 flex items-center">
                <span className="w-1 h-7 bg-nomad-olive rounded-full mr-3"></span>
                Recent Submissions
              </h3>
              <div className="bg-nomad-surface border border-nomad-olive-mid/20 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-nomad-olive-mid/15">
                  <thead>
                    <tr className="bg-nomad-olive text-nomad-surface">
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Builder
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        CPU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        GPU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Submitted
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-nomad-olive-mid/10">
                    {recentSubmissions.map((submission) => (
                      <tr key={submission.repository_id} className="hover:bg-nomad-olive-faint transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-lg font-bold ${getScoreColor(submission.nomad_score)}`}>
                            {submission.nomad_score.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {submission.builder_tag ? (
                            <span className="font-medium text-nomad-olive">{submission.builder_tag}</span>
                          ) : (
                            <span className="text-nomad-gray italic">Anonymous</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-nomad-text">
                          {submission.cpu_model}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-nomad-text-muted">
                          {submission.gpu_model || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-nomad-text-muted">
                          {new Date(submission.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 text-center">
            <p className="text-nomad-olive-mid mb-4">
              Want to submit your benchmark? Run the benchmark from your NOMAD installation.
            </p>
            <a
              href="https://github.com/Crosstalk-Solutions/project-nomad"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-nomad-rust hover:text-nomad-rust-dark font-medium"
            >
              Learn more about Project N.O.M.A.D.
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-nomad-olive-mid/20 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-nomad-olive-mid text-sm">
              <p>NOMAD Benchmark Leaderboard - A Project N.O.M.A.D. Community Resource</p>
              <p className="mt-2 flex items-center justify-center gap-1.5">
                Built by{' '}
                <a
                  href="https://crosstalksolutions.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center hover:opacity-80 transition-opacity"
                >
                  <img src="/crosstalk-solutions-logo.png" alt="Crosstalk Solutions" className="h-5" />
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
