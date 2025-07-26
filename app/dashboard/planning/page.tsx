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
import { RiCalendarScheduleLine } from "@remixicon/react";

export const metadata: Metadata = {
  title: "Recovery Planning - Rooted Platform",
  description: "AI-generated personalized recovery plans and adjustments",
};

export default function PlanningPage() {
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
                  <RiCalendarScheduleLine size={22} aria-hidden="true" />
                  <span className="sr-only">Dashboard</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Planning</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col gap-6 py-6 lg:py-8 px-6">
        <div>
          <h1 className="text-2xl font-semibold">Recovery Planning</h1>
          <p className="text-sm text-muted-foreground max-w-prose">
            AI-generated personalized daily and weekly recovery plans with adjustment interface.
          </p>
        </div>

        <div className="flex-1 min-h-[60vh] rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">Recovery planning coming soon</p>
            <p className="text-sm text-muted-foreground">
              AI-powered personalized recovery plans based on your biometric data.
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 