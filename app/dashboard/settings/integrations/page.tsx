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
import { RiSettings3Line, RiCheckLine, RiCloseLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { disconnectGarmin } from "./actions";

export const metadata: Metadata = {
  title: "Integrations - Rooted Platform",
  description: "Connect external services and tools to enhance your wellness journey",
};

export default async function IntegrationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let connected = false;
  let connectionInfo = null;
  
  if (user) {
    const { data } = await (supabase as any)
      .from('wearable_connections')
      .select('id, wearable_user_id, created_at, scopes')
      .eq('user_id', user.id)
      .eq('wearable_type', 'garmin')
      .maybeSingle();
    
    connected = !!data;
    connectionInfo = data;
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
                <BreadcrumbLink href="/dashboard">
                  <RiSettings3Line size={22} aria-hidden="true" />
                  <span className="sr-only">Dashboard</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/settings">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Integrations</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      <div className="flex flex-col gap-6 py-6 lg:py-8">
        <div>
          <h1 className="text-2xl font-semibold">Device Integrations</h1>
          <p className="text-sm text-muted-foreground max-w-prose">
            Connect your wellness wearables to unlock richer insights and AI-powered recommendations.
          </p>
        </div>

        {/* Garmin Integration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <img 
                src="/garmin_branding_assets/connect_logo_blue@2x.png" 
                alt="Garmin Connect" 
                className="h-8 w-auto"
              />
              Garmin Connect
              {connected && (
                <div className="flex items-center gap-1 text-green-600">
                  <RiCheckLine size={20} />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              )}
            </CardTitle>
            <CardDescription>
              Sync your heart rate variability, sleep, stress, and respiration data from Garmin devices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {connected && connectionInfo ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Garmin User ID:</strong> {connectionInfo.wearable_user_id}</p>
                  <p><strong>Connected:</strong> {new Date(connectionInfo.created_at).toLocaleDateString()}</p>
                  {connectionInfo.scopes && (
                    <p><strong>Permissions:</strong> {connectionInfo.scopes.join(', ')}</p>
                  )}
                </div>
                
                <form action={disconnectGarmin}>
                  <Button 
                    type="submit" 
                    variant="outline" 
                    className="flex items-center gap-2"
                  >
                    <RiCloseLine size={16} />
                    Disconnect Garmin
                  </Button>
                </form>
              </div>
            ) : (
              <Button asChild>
                <Link href="/dashboard/settings/integrations/garmin-connect">
                  Connect Garmin
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Future Integrations */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="text-lg">Whoop</CardTitle>
              <CardDescription>
                Connect your Whoop device for advanced recovery insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled variant="outline">
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="text-lg">Oura Ring</CardTitle>
              <CardDescription>
                Sync sleep and readiness data from your Oura Ring.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled variant="outline">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
} 