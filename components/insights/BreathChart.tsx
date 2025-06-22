'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Plugin,
} from 'chart.js'
import type { ChartOptions } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

export interface BreathDataPoint {
  timestamp: string // ISO string
  rate: number
}

export interface HRVDataPoint {
  timestamp: string
  hrv: number
}

interface BreathChartProps {
  data: BreathDataPoint[]
  hrvData?: HRVDataPoint[]
  sessionRanges?: { startIdx: number; endIdx: number }[]
  sleepRange?: { startIdx: number; endIdx: number } | null
  showSleepRange?: boolean
  dayLabel?: string
}

export default function BreathChart({ data, hrvData = [], sessionRanges = [], sleepRange = null, showSleepRange = true, dayLabel }: BreathChartProps) {
  const labels = data.map((d) => new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  const datasetData = data.map((d) => d.rate)

  const hrvSeries: (number | null)[] = data.map((d) => {
    const match = hrvData.find((h) => h.timestamp === d.timestamp)
    return match ? match.hrv : null
  })

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Respiration Rate (bpm)',
        data: datasetData,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.3,
        pointRadius: 0,
        yAxisID: 'y',
      },
      {
        label: 'HRV RMSSD (ms)',
        data: hrvSeries,
        borderColor: '#3b82f6',
        borderWidth: 2,
        backgroundColor: 'rgba(59,130,246,0.15)',
        tension: 0.2,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3b82f6',
        yAxisID: 'y1',
        spanGaps: true,
      },
    ],
  }

  // plugin to draw sleep background inside chart area
  const sleepPlugin: Plugin<'line'> = {
    id: 'sleepArea',
    beforeDatasetsDraw: (chart) => {
      if (!sleepRange || !showSleepRange) return
      const { ctx, chartArea } = chart
      const xScale = chart.scales.x
      const xStart = xScale.getPixelForValue(sleepRange.startIdx)
      const xEnd = xScale.getPixelForValue(sleepRange.endIdx)
      ctx.save()
      ctx.fillStyle = 'rgba(99,102,241,0.12)'
      ctx.fillRect(xStart, chartArea.top, xEnd - xStart, chartArea.bottom - chartArea.top)
      ctx.restore()
    },
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time of Day',
          color: '#475569',
        },
        ticks: {
          color: '#475569',
          callback: function (_value, index, ticks) {
            const step = Math.ceil(ticks.length / 8)
            return index % step === 0 ? labels[index] : ''
          },
          maxRotation: 0,
          autoSkip: false,
        },
      },
      y: {
        min: 10,
        max: 20,
        title: {
          display: true,
          text: 'Breaths per Minute',
          color: '#475569',
        },
        ticks: {
          stepSize: 2,
          color: '#475569',
        },
        grid: {
          color: 'rgba(203,213,225,0.3)',
        },
      },
      y1: {
        position: 'right',
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'HRV (ms)',
          color: '#475569',
        },
        ticks: {
          stepSize: 20,
          color: '#475569',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: dayLabel ? `Respiration Rate – ${dayLabel}` : 'Respiration Rate',
        font: {
          weight: 'bold',
          size: 16,
        },
        color: '#0f172a',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || ''
            if (context.dataset.yAxisID === 'y1') {
              return `${label}: ${context.parsed.y} ms`
            }
            return `${label}: ${context.parsed.y} bpm`
          },
        },
      },
      legend: {
        display: false,
      },
    },
  }

  return (
    <div className="w-full h-72 relative">
      {/* Pass the sleep plugin directly so it gets a fresh instance each render */}
      <Line data={chartData} options={options} plugins={[sleepPlugin]} />

      {/* mindful session highlights */}
      {sessionRanges.map((r, idx) => (
        <div
          key={idx}
          className="absolute top-0 left-0 h-full bg-primary/10 pointer-events-none"
          style={{
            width: `${((r.endIdx - r.startIdx + 1) / labels.length) * 100}%`,
            left: `${(r.startIdx / labels.length) * 100}%`,
          }}
        />
      ))}
    </div>
  )
} 