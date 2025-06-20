/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import Link from "next/link";
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

export const metadata: Metadata = {
  title: "Insights - Rooted Platform",
  description: "Personalized wellness insights based on your biometrics and activity.",
};

export default async function InsightsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let connected = false;
  let latestMetrics: { metric_type: string; value: number; unit: string | null; timestamp: string }[] = [];

  if (user) {
    const { data: conn } = await (supabase as any)
      .from('wearable_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('wearable_type', 'garmin')
      .maybeSingle();
    connected = !!conn;

    if (conn) {
      // Fetch the latest value for each metric_type
      const { data } = await (supabase as any)
        .rpc('get_latest_metrics', { p_connection_id: conn.id });
      latestMetrics = data ?? [];
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
                <BreadcrumbLink href="#">
                  <RiBardLine size={22} aria-hidden="true" />
                  <span className="sr-only">Dashboard</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Insights</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col gap-6 py-6 lg:py-8">
        <h1 className="text-2xl font-semibold">Personalized Insights</h1>
        <p className="text-sm text-muted-foreground max-w-prose mb-4">
          Below is a live glimpse of your most recent Garmin data.
        </p>

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
                  {new Date(m.timestamp).toLocaleString()}
                </time>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
} 