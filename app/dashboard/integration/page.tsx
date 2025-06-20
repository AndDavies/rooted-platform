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
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { RiLoginCircleLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Integration - Rooted Platform",
  description: "Connect external services and tools to enhance your wellness journey",
};

export default async function IntegrationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let connected = false;
  if (user) {
    const { data } = await (supabase as any)
      .from('wearable_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('wearable_type', 'garmin')
      .maybeSingle();
    connected = !!data;
  }

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
        <p className="text-sm text-muted-foreground max-w-prose mb-4">
          Connect your wellness wearables to unlock richer insights.
        </p>

        {connected ? (
          <div className="flex items-center gap-3">
            <span className="text-green-600 font-medium">Garmin Connected</span>
            <Button variant="outline" disabled>
              Disconnect (coming soon)
            </Button>
          </div>
        ) : (
          <Button asChild>
            <Link href="/dashboard/integration/garmin-connect">Connect Garmin</Link>
          </Button>
        )}
      </div>
    </>
  );
}
