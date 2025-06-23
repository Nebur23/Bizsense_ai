"use client";
import type * as React from "react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Logo from "./Logo";
import { Users, Settings, Box } from "lucide-react";
import { useSelectedLayoutSegments } from "next/navigation";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  businessId: string;
}

export function AppSidebar({ businessId, ...props }: AppSidebarProps) {
  const segments = useSelectedLayoutSegments();

  // Navigation data
  const navigationItems = [
    // {
    //   icon: LayoutDashboard,
    //   url: `/dashboard/${businessId}`,
    //   title: "Dashboard",
    // },
    {
      icon: Box,
      url: `/dashboard/${businessId}/modules`,
      title: "My Modules",
      isActive: segments.includes("modules"),
    },
    {
      icon: Users,
      url: `/dashboard/${businessId}/users`,
      title: "Users",
      isActive: segments.includes("users"),
    },
    {
      icon: Settings,
      url: `/dashboard/${businessId}/settings`,
      title: "Settings",
      isActive: segments.includes("settings"),
    },
  ];

  return (
    <Sidebar {...props}>
      <SidebarHeader className=''>
        <div className='flex flex-col'>
          <Logo />
        </div>
      </SidebarHeader>

      <SidebarContent className='bg-white text-gray-700 font-medium'>
        <SidebarGroup>
          <SidebarMenu className=' '>
            {navigationItems.map(item => (
              <SidebarMenuItem
                key={item.title}
                className='flex items-center justify-center'
              >
                <SidebarMenuButton isActive={item.isActive} asChild>
                  <Link href={item.url} className='flex items-center gap-3'>
                    <div className='flex h-5 w-5 items-center justify-center'>
                      <item.icon />
                    </div>
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
