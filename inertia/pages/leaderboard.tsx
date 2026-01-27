import { Head, Link } from '@inertiajs/react'
import React, { useState } from 'react'
import ViewToggle from '~/components/ViewToggle'
import LeaderboardTable from '~/components/LeaderboardTable'
import StatsCharts from '~/components/StatsCharts'

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

interface Stats {
  total_submissions: number
  average_nomad_score: number
  median_nomad_score: number
  score_distribution: {
    '0-20': number
    '20-40': number
    '40-60': number
    '60-80': number
    '80-100': number
  }
  top_cpu_models: Array<{ model: string; count: number; avgScore: number }>
  top_gpu_models: Array<{ model: string; count: number; avgScore: number }>
}

interface Props {
  submissions: Submission[]
  stats: Stats
}

export default function Leaderboard({ submissions, stats }: Props) {
  const [view, setView] = useState<'rankings' | 'statistics'>('rankings')

  return (
    <>
      <Head title="Leaderboard" />

      <div className="min-h-screen bg-nomad-cream">
        {/* Header */}
        <header className="bg-nomad-cream border-b border-nomad-olive-mid/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-3">
                  <img
                    src="/project_nomad_logo.png"
                    alt="NOMAD Logo"
                    className="w-10 h-10 rounded-lg"
                  />
                  <div>
                    <h1 className="text-xl font-bold text-nomad-olive">NOMAD Benchmark</h1>
                    <p className="text-xs text-nomad-olive-mid">Community Leaderboard</p>
                  </div>
                </Link>
              </div>
              <nav className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="text-sm font-medium text-nomad-olive-mid hover:text-nomad-olive"
                >
                  Home
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

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-nomad-olive flex items-center">
                <span className="w-1 h-8 bg-nomad-olive rounded-full mr-3"></span>
                Leaderboard
              </h2>
              <p className="mt-1 text-nomad-olive-mid ml-4">
                {stats.total_submissions} systems benchmarked
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </div>

          {/* Content */}
          <div className="bg-nomad-surface border border-nomad-olive-mid/20 rounded-xl overflow-hidden">
            {view === 'rankings' ? (
              <LeaderboardTable submissions={submissions} />
            ) : (
              <div className="p-6">
                <StatsCharts stats={stats} />
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-nomad-olive-light border border-nomad-olive-mid/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-nomad-olive mb-2">
              How to Submit Your Benchmark
            </h3>
            <p className="text-nomad-olive-mid">
              Run the System Benchmark from your NOMAD installation's Settings page.
              Once complete, you can submit your results to this community leaderboard
              to see how your hardware compares.
            </p>
            <div className="mt-4">
              <a
                href="https://github.com/Crosstalk-Solutions/project-nomad"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-nomad-rust hover:text-nomad-rust-dark font-medium"
              >
                Get Project N.O.M.A.D.
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </main>

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
