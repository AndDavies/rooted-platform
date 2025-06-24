'use client'

import { Button } from '@/components/ui/button'
import { RiArrowLeftSLine, RiArrowRightSLine, RiHome2Line } from '@remixicon/react'
import { useRouter } from 'next/navigation'

interface DateNavigationProps {
  currentDate: string // YYYY-MM-DD format
}

export default function DateNavigation({ currentDate }: DateNavigationProps) {
  const router = useRouter()

  const handleDateChange = (direction: 'prev' | 'next') => {
    // Parse the current date safely
    const dateParts = currentDate.split('-')
    const year = parseInt(dateParts[0], 10)
    const month = parseInt(dateParts[1], 10) - 1 // Month is 0-indexed
    const day = parseInt(dateParts[2], 10)
    
    const date = new Date(year, month, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (direction === 'prev') {
      date.setDate(date.getDate() - 1)
    } else {
      date.setDate(date.getDate() + 1)
      // Prevent navigation beyond current date
      if (date > today) {
        return
      }
    }

    // Format the new date as YYYY-MM-DD
    const newYear = date.getFullYear()
    const newMonth = String(date.getMonth() + 1).padStart(2, '0')
    const newDay = String(date.getDate()).padStart(2, '0')
    const newDateStr = `${newYear}-${newMonth}-${newDay}`
    
    router.push(`/dashboard/insights/${newDateStr}`)
  }

  const handleTodayClick = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const todayStr = `${year}-${month}-${day}`
    
    router.push(`/dashboard/insights/${todayStr}`)
  }

  // Parse the current date safely
  const dateParts = currentDate.split('-')
  const year = parseInt(dateParts[0], 10)
  const month = parseInt(dateParts[1], 10) - 1 // Month is 0-indexed
  const day = parseInt(dateParts[2], 10)
  
  const currentDateObj = new Date(year, month, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const isToday = currentDateObj.getTime() === today.getTime()
  const canGoNext = currentDateObj < today

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDateChange('prev')}
        className="h-8 w-8 p-0"
      >
        <RiArrowLeftSLine size={16} />
        <span className="sr-only">Previous day</span>
      </Button>
      
      <div className="text-sm font-medium text-muted-foreground min-w-[100px] text-center">
        {isToday ? 'Today' : currentDateObj.toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric' 
        })}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDateChange('next')}
        disabled={!canGoNext}
        className="h-8 w-8 p-0"
      >
        <RiArrowRightSLine size={16} />
        <span className="sr-only">Next day</span>
      </Button>

      {!isToday && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleTodayClick}
          className="h-8 px-3 ml-2"
        >
          <RiHome2Line size={14} className="mr-1" />
          Today
        </Button>
      )}
    </div>
  )
} 