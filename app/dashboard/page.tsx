import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Rooted Platform",
  description: "Your wellness journey dashboard",
};

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import UserDropdown from "@/components/user-dropdown";
import FeedbackDialog from "@/components/feedback-dialog";
import { RiLeafLine } from "@remixicon/react";
import HRVWidget from "@/components/insights/HRVWidget";

export default function Page() {
  return (
    <>
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
                  <RiLeafLine size={22} aria-hidden="true" />
                  <span className="sr-only">Dashboard</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Wellness Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex gap-3 ml-auto">
          <FeedbackDialog />
          <UserDropdown />
        </div>
      </header>
      
      <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-6 lg:py-8 px-6">
        {/* Page intro */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Welcome to your wellness journey!</h1>
            <p className="text-sm text-muted-foreground">
              Track your progress across the 6 pillars of wellness: Breathing, Sleep, Nutrition, Movement, Mindset, and Relaxation.
            </p>
          </div>
          <Button className="px-3">Start Today&apos;s Session</Button>
        </div>
        
        {/* Analytics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <HRVWidget />
          {/* More analytics widgets will be added here */}
        </div>
        
        {/* Future content area */}
        <div className="flex-1 min-h-[40vh] rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">More insights and analytics coming soon</p>
            <p className="text-sm text-muted-foreground">
              Additional wellness metrics and personalized recommendations will appear here.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
 