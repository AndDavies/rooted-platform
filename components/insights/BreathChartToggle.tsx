'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import BreathChart from './BreathChart'
import type { BreathDataPoint, HRVDataPoint } from './BreathChart'

interface Props {
  data: BreathDataPoint[]
  hrvData: HRVDataPoint[]
  sessionRanges: { startIdx: number; endIdx: number }[]
  sleepRange: { startIdx: number; endIdx: number } | null
  dayLabel: string
}

export default function BreathChartToggle({ data, hrvData, sessionRanges, sleepRange, dayLabel }: Props) {
  const [showSleep, setShowSleep] = useState(true)

  return (
    <div className="w-full">
      <div className="flex justify-end mb-1">
        <Button
          size="sm"
          variant={showSleep ? 'default' : 'outline'}
          onClick={() => setShowSleep((s) => !s)}
        >
          {showSleep ? 'Hide Sleep' : 'Show Sleep'}
        </Button>
      </div>
      <BreathChart
        data={data}
        hrvData={hrvData}
        sessionRanges={sessionRanges}
        sleepRange={sleepRange}
        showSleepRange={showSleep}
        dayLabel={dayLabel}
      />
    </div>
  )
} 