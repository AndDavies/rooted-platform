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
import { RiChatSmile3Line } from "@remixicon/react";

export const metadata: Metadata = {
  title: "AI Coach - Rooted Platform",
  description: "Conversational AI coach with memory and biometric context",
};

export default function ChatPage() {
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
                  <RiChatSmile3Line size={22} aria-hidden="true" />
                  <span className="sr-only">Dashboard</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>AI Coach</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col gap-6 py-6 lg:py-8">
        <div>
          <h1 className="text-2xl font-semibold">AI Wellness Coach</h1>
          <p className="text-sm text-muted-foreground max-w-prose">
            Chat with your personalized AI coach that understands your biometric data and wellness history.
          </p>
        </div>

        <div className="flex-1 min-h-[60vh] rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">AI Coach coming soon</p>
            <p className="text-sm text-muted-foreground">
              Conversational AI with memory and biometric context awareness.
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 