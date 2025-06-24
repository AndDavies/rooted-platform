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
  title: "Burnout Analysis - Rooted Platform",
  description: "Burnout risk scoring, history, and wellness warnings",
};

export default function BurnoutPage() {
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
                <BreadcrumbLink href="/dashboard">
                  <RiBardLine size={22} aria-hidden="true" />
                  <span className="sr-only">Dashboard</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/insights">Insights</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Burnout Analysis</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col gap-6 py-6 lg:py-8">
        <div>
          <h1 className="text-2xl font-semibold">Burnout Risk Analysis</h1>
          <p className="text-sm text-muted-foreground max-w-prose">
            Burnout scoring, rolling stress analysis, and resilience metrics.
          </p>
        </div>

        <div className="flex-1 min-h-[60vh] rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">Burnout analysis coming soon</p>
            <p className="text-sm text-muted-foreground">
              Comprehensive burnout risk assessment and prevention strategies.
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 