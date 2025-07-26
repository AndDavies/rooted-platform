"use client";

import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { RiExpandUpDownLine, RiAddLine } from "@remixicon/react";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: string;
  }[];
}) {
  const [activeTeam, setActiveTeam] = React.useState(teams[0] ?? null);

  if (!teams.length) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-emerald-green/10 data-[state=open]:text-emerald-green gap-3 [&>svg]:size-auto"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-md overflow-hidden bg-gradient-to-br from-emerald-green to-herbal-olive text-white shadow-sm">
                {activeTeam && (
                  <img
                    src={activeTeam.logo}
                    width={36}
                    height={36}
                    alt={activeTeam.name}
                  />
                )}
              </div>
              <div className="grid flex-1 text-left text-base leading-tight">
                <span className="truncate font-medium text-white">
                  {activeTeam?.name ?? "Select a Team"}
                </span>
                {activeTeam?.name === "The ROOTED Way" && (
                  <span className="text-xs text-white/80 truncate">
                    The future of hybrid AI-Human wellness coaching
                  </span>
                )}
              </div>
              <RiExpandUpDownLine
                className="ms-auto text-white/60"
                size={20}
                aria-hidden="true"
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-md bg-papaya-whip border-emerald-green/20"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="uppercase text-misty-sage/60 text-xs">
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2 hover:bg-emerald-green/10 hover:text-emerald-green transition-colors duration-200"
              >
                <div className="flex size-6 items-center justify-center rounded-md overflow-hidden bg-gradient-to-br from-emerald-green to-herbal-olive">
                  <img src={team.logo} width={36} height={36} alt={team.name} />
                </div>
                <span className="text-charcoal-ash">{team.name}</span>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-emerald-green/20" />
            <DropdownMenuItem className="gap-2 p-2 hover:bg-emerald-green/10 hover:text-emerald-green transition-colors duration-200">
              <RiAddLine className="opacity-60" size={16} aria-hidden="true" />
              <div className="font-medium text-charcoal-ash">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
