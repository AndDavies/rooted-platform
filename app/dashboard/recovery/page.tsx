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
import { RiHeartPulseLine } from "@remixicon/react";

export const metadata: Metadata = {
  title: "Recovery - Rooted Platform",
  description: "HRV, sleep, RHR, and stress analysis for recovery optimization",
};

export default function RecoveryPage() {
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
                  <RiHeartPulseLine size={22} aria-hidden="true" />
                  <span className="sr-only">Dashboard</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Recovery</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col gap-6 py-6 lg:py-8">
        <div>
          <h1 className="text-2xl font-semibold">Recovery Analysis</h1>
          <p className="text-sm text-muted-foreground max-w-prose">
            HRV, sleep, RHR, and stress analysis for today and rolling performance metrics.
          </p>
        </div>

        <div className="flex-1 min-h-[60vh] rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">Recovery analytics coming soon</p>
            <p className="text-sm text-muted-foreground">
              Comprehensive biometrics analysis and recovery optimization insights.
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 