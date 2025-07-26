import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SearchForm } from "@/components/search-form";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  RiLeafLine,
  RiChatSmile3Line,
  RiHeartPulseLine,
  RiBardLine,
  RiAlarmWarningLine,
  RiCalendarScheduleLine,
  RiFridgeLine,
  RiSettings3Line,
  RiUserSettingsLine,
  RiLoginCircleLine,
  RiLogoutBoxLine,
} from "@remixicon/react";

// Navigation data following the new structure
const data = {
  teams: [
    {
      name: "The ROOTED Way",
      logo: "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/logo-01_kp2j8x.png",
    },
  ],
  navMain: [
    {
      title: "Overview",
      url: "#",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: RiLeafLine,
        },
        {
          title: "AI Coach",
          url: "/dashboard/chat",
          icon: RiChatSmile3Line,
        },
      ],
    },
    {
      title: "Biometrics",
      url: "#",
      items: [
        {
          title: "Recovery",
          url: "/dashboard/recovery",
          icon: RiHeartPulseLine,
        },
        {
          title: "Burnout",
          url: "/dashboard/burnout",
          icon: RiAlarmWarningLine,
        },
        {
          title: "Insights",
          url: "/dashboard/insights",
          icon: RiBardLine,
        },
      ],
    },
    {
      title: "Guidance",
      url: "#",
      items: [
        {
          title: "Planning",
          url: "/dashboard/planning",
          icon: RiCalendarScheduleLine,
        },
        {
          title: "Nutrition",
          url: "/dashboard/nutrition",
          icon: RiFridgeLine,
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      items: [
        {
          title: "Preferences",
          url: "/dashboard/settings/preferences",
          icon: RiUserSettingsLine,
        },
        {
          title: "Integrations",
          url: "/dashboard/settings/integrations",
          icon: RiLoginCircleLine,
        },
        {
          title: "Account",
          url: "/dashboard/settings/account",
          icon: RiSettings3Line,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  return (
    <Sidebar {...props}>
      <div className="h-full flex flex-col" style={{ backgroundColor: 'hsl(var(--sidebar-background))' }}>
        <SidebarHeader>
          <TeamSwitcher teams={data.teams} />
          <hr className="border-t border-emerald-green/20 mx-2 -mt-px" />
          <SearchForm className="mt-3" />
        </SidebarHeader>
        <SidebarContent>
          {/* We create a SidebarGroup for each parent. */}
          {data.navMain.map((item) => (
            <SidebarGroup key={item.title}>
              <SidebarGroupLabel className="uppercase text-white/80 font-medium tracking-wider px-2">
                {item.title}
              </SidebarGroupLabel>
              <SidebarGroupContent className="px-2">
                <SidebarMenu>
                  {item.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className="group/menu-button font-medium gap-3 h-9 rounded-lg transition-all duration-200 hover:bg-emerald-green/10 hover:text-emerald-green data-[active=true]:bg-emerald-green/15 data-[active=true]:border-emerald-green/20 data-[active=true]:border data-[active=true]:text-emerald-green [&>svg]:size-auto"
                        isActive={pathname.startsWith(item.url)}
                      >
                        <Link href={item.url} prefetch>
                          {item.icon && (
                            <item.icon
                              className="text-white/70 group-data-[active=true]/menu-button:text-emerald-green transition-colors duration-200"
                              size={22}
                              aria-hidden="true"
                            />
                          )}
                          <span className="group-data-[active=true]/menu-button:text-emerald-green group-data-[active=true]/menu-button:font-semibold text-white">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <hr className="border-t border-emerald-green/20 mx-2 -mt-px" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="font-medium gap-3 h-9 rounded-lg transition-all duration-200 hover:bg-dark-pastel-red/10 hover:text-dark-pastel-red [&>svg]:size-auto group/menu-button">
                <RiLogoutBoxLine
                  className="text-white/70 group-hover/menu-button:text-dark-pastel-red transition-colors duration-200"
                  size={22}
                  aria-hidden="true"
                />
                <span className="group-hover/menu-button:text-dark-pastel-red text-white">Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </div>
    </Sidebar>
  );
}
