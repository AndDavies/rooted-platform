/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'
import StepBarChart from '@/components/insights/StepBarChart'
import { Suspense } from 'react'

interface StepSerenityWidgetProps {
  selectedDate?: string // YYYY-MM-DD format, optional
}

export default async function StepSerenityWidget({ selectedDate }: StepSerenityWidgetProps = {}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: conn } = await (supabase as any)
    .from('wearable_connections')
    .select('id')
    .eq('user_id', user.id)
    .eq('wearable_type', 'garmin')
    .maybeSingle()
  if (!conn) return null

  let targetDate: Date

  if (selectedDate) {
    // Use provided date
    targetDate = new Date(selectedDate + 'T00:00:00.000Z')
  } else {
    // Get most recent day available
    const { data: latest } = await (supabase as any)
      .from('wearable_data')
      .select('timestamp')
      .eq('connection_id', conn.id)
      .eq('metric_type', 'steps')
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (!latest) {
      return (
        <Card className="bg-card border shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-primary">
              <Link href="/integrations/step-serenity" className="hover:underline">
                Step Serenity
              </Link>
            </CardTitle>
            <p className="text-sm text-muted-foreground">Daily Steps</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No steps data yet.</p>
          </CardContent>
        </Card>
      )
    }

    targetDate = new Date(latest.timestamp)
  }

  targetDate.setHours(0, 0, 0, 0)
  const start = targetDate.toISOString()
  const end = new Date(targetDate.getTime() + 86400000).toISOString()

  const { data: rows } = await (supabase as any)
    .from('wearable_data')
    .select('metric_type, value')
    .eq('connection_id', conn.id)
    .in('metric_type', ['steps', 'active_calories'])
    .gte('timestamp', start)
    .lt('timestamp', end)
  let steps = 0
  let calories: number | null = null
  rows?.forEach((r: any) => {
    if (r.metric_type === 'steps') steps = Number(r.value)
    if (r.metric_type === 'active_calories') calories = Number(r.value)
  })

  return (
    <Card className="bg-card border shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-primary">
          <Link href="/integrations/step-serenity" className="hover:underline">
            Step Serenity
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Daily Steps</p>
      </CardHeader>
      <CardContent>
        {steps ? (
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading graph…</p>}>
            <StepBarChart steps={steps} calories={calories} dayLabel={targetDate.toLocaleDateString()} />
          </Suspense>
        ) : (
          <p className="text-sm text-muted-foreground">No steps data for selected day.</p>
        )}
      </CardContent>
    </Card>
  )
} 