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
import { RiLeafLine } from "@remixicon/react";

export const metadata: Metadata = {
  title: "Nutrition - Rooted Platform",
  description: "Food and supplement guidance from AI agent",
};

export default function NutritionPage() {
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
                  <RiLeafLine size={22} aria-hidden="true" />
                  <span className="sr-only">Dashboard</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Nutrition</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col gap-6 py-6 lg:py-8 px-6">
        <div>
          <h1 className="text-2xl font-semibold">Nutrition Guidance</h1>
          <p className="text-sm text-muted-foreground max-w-prose">
            Mood-food logs, hydration tracking, and AI-powered supplement timing recommendations.
          </p>
        </div>

        <div className="flex-1 min-h-[60vh] rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">Nutrition guidance coming soon</p>
            <p className="text-sm text-muted-foreground">
              Personalized nutrition insights and supplement recommendations.
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 