import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

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

interface StatsChartsProps {
  stats: Stats
}

const DISTRIBUTION_COLORS = ['#ef4444', '#A84A12', '#eab308', '#6D7042', '#424420']

export default function StatsCharts({ stats }: StatsChartsProps) {
  const distributionData = [
    { range: '0-20', count: stats.score_distribution['0-20'], fill: DISTRIBUTION_COLORS[0] },
    { range: '20-40', count: stats.score_distribution['20-40'], fill: DISTRIBUTION_COLORS[1] },
    { range: '40-60', count: stats.score_distribution['40-60'], fill: DISTRIBUTION_COLORS[2] },
    { range: '60-80', count: stats.score_distribution['60-80'], fill: DISTRIBUTION_COLORS[3] },
    { range: '80-100', count: stats.score_distribution['80-100'], fill: DISTRIBUTION_COLORS[4] },
  ]

  const pieData = distributionData.filter((d) => d.count > 0)

  if (stats.total_submissions === 0) {
    return (
      <div className="text-center py-12 text-nomad-olive-mid">
        No data available yet. Statistics will appear once submissions are received.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-nomad-surface border border-nomad-olive-mid/20 rounded-lg p-6">
          <div className="text-3xl font-bold text-nomad-olive">{stats.total_submissions}</div>
          <div className="text-sm text-nomad-olive-mid uppercase tracking-wider">Total Submissions</div>
        </div>
        <div className="bg-nomad-surface border border-nomad-olive-mid/20 rounded-lg p-6">
          <div className="text-3xl font-bold text-nomad-olive">{stats.average_nomad_score}</div>
          <div className="text-sm text-nomad-olive-mid uppercase tracking-wider">Average Score</div>
        </div>
        <div className="bg-nomad-surface border border-nomad-olive-mid/20 rounded-lg p-6">
          <div className="text-3xl font-bold text-nomad-rust">{stats.median_nomad_score}</div>
          <div className="text-sm text-nomad-olive-mid uppercase tracking-wider">Median Score</div>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="bg-nomad-surface border border-nomad-olive-mid/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-nomad-olive mb-4 flex items-center">
          <span className="w-1 h-5 bg-nomad-olive rounded-full mr-2"></span>
          Score Distribution
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#6D704233" />
                <XAxis dataKey="range" tick={{ fill: '#6D7042' }} />
                <YAxis tick={{ fill: '#6D7042' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F6F6F4',
                    border: '1px solid #6D704233',
                    borderRadius: '8px',
                    color: '#424420',
                  }}
                />
                <Bar dataKey="count" name="Submissions" radius={[4, 4, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F6F6F4',
                    border: '1px solid #6D704233',
                    borderRadius: '8px',
                    color: '#424420',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Hardware */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top CPUs */}
        <div className="bg-nomad-surface border border-nomad-olive-mid/20 rounded-lg overflow-hidden">
          <div className="bg-nomad-olive px-6 py-3">
            <h3 className="text-sm font-semibold text-nomad-surface uppercase tracking-wider">Top CPU Models</h3>
          </div>
          <div className="p-6">
            {stats.top_cpu_models.length === 0 ? (
              <p className="text-nomad-olive-mid text-sm">No data available</p>
            ) : (
              <div className="space-y-3">
                {stats.top_cpu_models.slice(0, 5).map((cpu, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-nomad-text truncate">{cpu.model}</p>
                      <p className="text-xs text-nomad-text-muted">{cpu.count} submissions</p>
                    </div>
                    <div className="ml-4 text-sm font-semibold text-nomad-rust">
                      Avg: {cpu.avgScore}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top GPUs */}
        <div className="bg-nomad-surface border border-nomad-olive-mid/20 rounded-lg overflow-hidden">
          <div className="bg-nomad-olive px-6 py-3">
            <h3 className="text-sm font-semibold text-nomad-surface uppercase tracking-wider">Top GPU Models</h3>
          </div>
          <div className="p-6">
            {stats.top_gpu_models.length === 0 ? (
              <p className="text-nomad-olive-mid text-sm">No data available</p>
            ) : (
              <div className="space-y-3">
                {stats.top_gpu_models.slice(0, 5).map((gpu, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-nomad-text truncate">{gpu.model}</p>
                      <p className="text-xs text-nomad-text-muted">{gpu.count} submissions</p>
                    </div>
                    <div className="ml-4 text-sm font-semibold text-nomad-rust">
                      Avg: {gpu.avgScore}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
