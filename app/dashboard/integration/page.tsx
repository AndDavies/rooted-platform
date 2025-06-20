import type { Metadata } from "next";
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
import { RiLoginCircleLine } from "@remixicon/react";

export const metadata: Metadata = {
  title: "Integration - Rooted Platform",
  description: "Connect external services and tools to enhance your wellness journey",
};

export default function IntegrationPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger className="-ms-4" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  <RiLoginCircleLine size={22} aria-hidden="true" />
                  <span className="sr-only">Dashboard</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Integrations</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="py-8">
        <h1 className="text-2xl font-semibold mb-4">Integrations</h1>
        <p className="text-sm text-muted-foreground max-w-prose">
          Connect external services (e.g. wearables, calendar apps, or communication tools) to the Rooted Platform and unlock richer insights. This page is a placeholder – extend it with a list of integration providers and connection workflows.
        </p>
      </div>
    </>
  );
}
