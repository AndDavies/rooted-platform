import type { Metadata } from "next";
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

const insights = [
  {
    title: "Stress Management Recommendations",
    metric: "Heart Rate Variability (HRV)",
    insight:
      "Low HRV (<50 ms) indicates high stress or poor recovery. Suggest \“Release Series\” activities like breathwork or yoga to calm the nervous system.",
    example:
      "Your HRV is low today (45 ms). Try a 10-minute guided meditation from the content library.",
  },
  {
    title: "Sleep Quality Optimization",
    metric: "Sleep duration, sleep stages (deep, REM, light), sleep efficiency",
    insight:
      "Short sleep (<6 hours) or low deep sleep (<1.5 hours) suggests poor recovery. Recommend avoiding caffeine after 2 PM or joining a sleep workshop.",
    example:
      "You slept 5h 30m last night with minimal deep sleep. Watch the 'Sleep Optimization' video in the Release Series.",
  },
  {
    title: "Energy Level Guidance",
    metric: "Resting Heart Rate (RHR), daily activity (steps, calories burned)",
    insight:
      "Elevated RHR (>10 bpm above baseline) or low activity (<5 000 steps) signals fatigue. Suggest low-intensity activities like a nature walk or tai chi.",
    example:
      "Your RHR is up (72 bpm). Take a 20-minute walk in nature to boost energy gently.",
  },
  {
    title: "Activity Balance Suggestions",
    metric: "Active minutes, workout intensity, recovery score",
    insight:
      "High-intensity workouts with low recovery score (<50 %) indicate over-training risk. Recommend \“Unleash Series\” mobility sessions or rest days.",
    example:
      "Your recovery score is 40 %. Opt for a mobility session today instead of HIIT.",
  },
  {
    title: "Readiness for Leadership Tasks",
    metric: "Combined HRV, sleep quality, and activity",
    insight:
      "High HRV (>70 ms), good sleep (>7 hours), and moderate activity suggest peak readiness. Encourage tackling high-stakes decisions or joining a leadership discussion.",
    example:
      "You're in peak form (HRV 75 ms, 7 h sleep). Join the 'Embodied Leadership' virtual workshop today.",
  },
  {
    title: "Chronic Fatigue Alerts",
    metric: "Weekly trends in HRV, sleep, and RHR",
    insight:
      "Consistent low HRV (<50 ms) and poor sleep (<6 hours) over 7 days indicate burnout risk. Notify facilitators for 1:1 coaching.",
    example:
      "You've had low HRV and poor sleep this week. A facilitator will reach out to discuss stress management strategies.",
  },
  {
    title: "Movement Routine Consistency",
    metric: "Daily steps, active minutes",
    insight:
      "Irregular activity (e.g., <3 active days/week) suggests inconsistent routines. Suggest joining a community challenge or \"Unleash Series\" group workout.",
    example:
      "You've been active only 2 days this week. Join the 'Rooted Tribe™ Movement Challenge' in the community space.",
  },
  {
    title: "Post-Event Recovery Tracking",
    metric: "HRV, sleep, and activity post-event (e.g., after a retreat)",
    insight:
      "Drop in HRV or sleep quality after an event indicates recovery needs. Recommend post-event content like guided relaxation.",
    example:
      "Your HRV dropped after the Madeira Retreat. Access the 'Post-Retreat Recovery' meditation in the content library.",
  },
];

export default function InsightsPage() {
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
        <p className="text-sm text-muted-foreground max-w-prose">
          Below are suggestions generated from your recent biometrics, sleep, and activity
          data. Use them to guide today&apos;s wellness journey.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {insights.map((item) => (
            <article
              key={item.title}
              className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm"
            >
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Metric:</span> {item.metric}
              </p>
              <p className="text-sm">
                <span className="font-medium">Insight:</span> {item.insight}
              </p>
              <p className="text-sm italic text-muted-foreground">{item.example}</p>
            </article>
          ))}
        </div>
      </div>
    </>
  );
} 