'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import type { ChartOptions } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface StepBarChartProps {
  steps: number
  calories: number | null
  dayLabel: string
}

export default function StepBarChart({ steps, calories, dayLabel }: StepBarChartProps) {
  const chartData = {
    labels: [dayLabel],
    datasets: [
      {
        label: 'Steps',
        data: [steps],
        backgroundColor: steps >= 5000 ? '#10B981' : '#AEC7E8',
        borderWidth: 0,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 10000,
        title: {
          display: true,
          text: 'Steps',
          color: '#475569',
        },
        ticks: {
          stepSize: 2000,
          color: '#475569',
        },
        grid: {
          color: 'rgba(203,213,225,0.3)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Day',
          color: '#475569',
        },
        ticks: {
          color: '#475569',
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: () => `${steps.toLocaleString()} steps${calories ? `, ${calories} kcal` : ''}`,
        },
      },
      legend: { display: false },
      title: {
        display: true,
        text: `Steps – ${dayLabel}`,
        font: { size: 16, weight: 'bold' },
        color: '#0f172a',
      },
    },
  }

  return (
    <div className="w-full h-72">
      <Bar data={chartData} options={options} />
    </div>
  )
} 