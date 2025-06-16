import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Rooted Platform",
  description: "Your wellness journey dashboard",
};

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import UserDropdown from "@/components/user-dropdown";
import FeedbackDialog from "@/components/feedback-dialog";
import ContactsTable from "@/components/contacts-table";
import { RiLeafLine } from "@remixicon/react";
import { StatsGrid } from "@/components/stats-grid";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden px-4 md:px-6 lg:px-8">
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
        <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-4 lg:py-6">
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
          {/* Numbers */}
          <StatsGrid
            stats={[
              {
                title: "Daily Sessions",
                value: "12",
                change: {
                  value: "+3 today",
                  trend: "up",
                },
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                ),
              },
              {
                title: "Streak Days",
                value: "7",
                change: {
                  value: "Best: 14 days",
                  trend: "up",
                },
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={18}
                    height={19}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.28 2.97-.2 4.18-.74 1.89-2.39 4.66-4.01 4.66z"/>
                  </svg>
                ),
              },
              {
                title: "Mindfulness Score",
                value: "8.2/10",
                change: {
                  value: "+0.5 this week",
                  trend: "up",
                },
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l2.09 6.26L20 9l-5.91.74L12 22l-2.09-6.26L4 15l5.91-.74L12 2z"/>
                  </svg>
                ),
              },
              {
                title: "Community Rank",
                value: "#42",
                change: {
                  value: "↑5 this month",
                  trend: "up",
                },
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={21}
                    height={21}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16 4h4v16h-4V4zM10 8h4v12h-4V8zM4 12h4v8H4v-8z"/>
                  </svg>
                ),
              },
            ]}
          />
          {/* Table */}
          <div className="min-h-[100vh] flex-1 md:min-h-min">
            <ContactsTable />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
 