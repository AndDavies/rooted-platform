/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { RiBardLine } from "@remixicon/react";
import BreathAwarenessWidget from '@/components/insights/BreathAwarenessWidget'
import StepSerenityWidget from '@/components/insights/StepSerenityWidget'
import DateNavigation from '@/components/insights/DateNavigation'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: "Insights - Rooted Platform",
  description: "Personalized wellness insights based on your biometrics and activity.",
};

interface PageProps {
  params: Promise<{ date: string }>
}

export default async function InsightsDatePage({ params }: PageProps) {
  const { date: selectedDate } = await params

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(selectedDate)) {
    redirect('/dashboard/insights')
  }

  // Parse the date more safely
  const dateParts = selectedDate.split('-')
  const year = parseInt(dateParts[0], 10)
  const month = parseInt(dateParts[1], 10) - 1 // Month is 0-indexed
  const day = parseInt(dateParts[2], 10)

  // Create date object in local timezone
  const targetDate = new Date(year, month, day)
  
  // Check if the date is valid
  if (isNaN(targetDate.getTime()) || 
      targetDate.getFullYear() !== year || 
      targetDate.getMonth() !== month || 
      targetDate.getDate() !== day) {
    redirect('/dashboard/insights')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Prevent navigation beyond current date
  if (targetDate > today) {
    redirect('/dashboard/insights')
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let connected = false;
  type MetricRow = { metric_type: string; value: number; unit: string | null; timestamp: string };
  let latestMetrics: MetricRow[] = [];

  function formatTimestamp(ts?: string | null): string {
    if (!ts) return ''
    // Convert Postgres 'YYYY-MM-DD HH:MI:SS.mmmuuu+TZ' to ISO the browser can parse
    let iso = ts.replace(' ', 'T')
    // Trim microseconds -> milliseconds for JS Date
    iso = iso.replace(/\.(\d{3})\d+/, '.$1')

    const d = new Date(iso)
    return isNaN(d.getTime()) ? ts : d.toLocaleString()
  }

  if (user) {
    const { data: conn } = await (supabase as any)
      .from('wearable_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('wearable_type', 'garmin')
      .maybeSingle();
    connected = !!conn;

    if (conn) {
      // Create UTC timestamps for database queries
      const startUTC = new Date(year, month, day).toISOString()
      const endUTC = new Date(year, month, day + 1).toISOString()
      
      const { data } = await (supabase as any)
        .from('wearable_data')
        .select('metric_type, value, unit, timestamp')
        .eq('connection_id', conn.id)
        .gte('timestamp', startUTC)
        .lt('timestamp', endUTC)
        .order('timestamp', { ascending: false });
      
      // Get latest value for each metric type
      const metricMap = new Map<string, MetricRow>();
      (data ?? []).forEach((row: any) => {
        if (!metricMap.has(row.metric_type)) {
          metricMap.set(row.metric_type, row);
        }
      });
      latestMetrics = Array.from(metricMap.values());
    }
  }

  return (
    <>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger className="-ms-4" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard/insights">
                  <RiBardLine size={22} aria-hidden="true" />
                  <span className="sr-only">Insights</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {targetDate.toLocaleDateString(undefined, { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col gap-6 py-6 lg:py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Personalized Insights</h1>
            <p className="text-sm text-muted-foreground max-w-prose">
              Viewing data for {targetDate.toLocaleDateString(undefined, { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <DateNavigation currentDate={selectedDate} />
        </div>

        {/* Breath Awareness line chart */}
        <BreathAwarenessWidget selectedDate={selectedDate} />

        {/* Step Serenity bar chart */}
        <StepSerenityWidget selectedDate={selectedDate} />

        {connected && latestMetrics.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {latestMetrics.map((m) => (
              <article
                key={m.metric_type}
                className="flex flex-col gap-1 rounded-lg border bg-card p-4 shadow-sm"
              >
                <h2 className="text-sm font-medium capitalize text-muted-foreground">
                  {m.metric_type.replace(/_/g, ' ')}
                </h2>
                <span className="text-2xl font-semibold">
                  {m.value}
                  {m.unit ? ` ${m.unit}` : ''}
                </span>
                <time className="text-xs text-muted-foreground">
                  {formatTimestamp(m.timestamp)}
                </time>
              </article>
            ))}
          </div>
        )}

        {connected && latestMetrics.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No data available for this date.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Data may not have been collected yet or the Garmin integration might be still syncing.
            </p>
          </div>
        )}
      </div>
    </>
  );
} 