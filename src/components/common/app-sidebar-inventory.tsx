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
import { Calculator, LayoutDashboard, NotebookIcon } from "lucide-react";
import { useSelectedLayoutSegments } from "next/navigation";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  businessId: string;
}

export function AppSidebar({ businessId, ...props }: AppSidebarProps) {
  const segments = useSelectedLayoutSegments();

  const navigationItems = [
    {
      icon: LayoutDashboard,
      url: `/dashboard/${businessId}/inventory`,
      title: "Dashboard",
      isActive: segments.length === 0,
    },
    {
      icon: NotebookIcon,
      url: `/dashboard/${businessId}/inventory/products`,
      title: "Products",
      isActive: segments.includes("products"),
    },
    {
      icon: NotebookIcon,
      url: `/dashboard/${businessId}/inventory/categories`,
      title: "Categories",
      isActive: segments.includes("categories"),
    },

    {
      icon: Calculator,
      url: `/dashboard/${businessId}/inventory/physical-count`,
      title: "Physical Count",
      isActive: segments.includes("physical-count"),
    },
  ];

  return (
    <Sidebar {...props}>
      <SidebarHeader className='pb-4 '>
        <div className='flex flex-col justify-center items-start'>
          <Logo />
          <span className='font-geist-mono self-center text-cyan-500 font-bold'>
            Inventory
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className='bg-white text-gray-700 font-medium'>
        <SidebarGroup>
          {navigationItems.map(item => (
            <SidebarMenu
              key={item.title}
              //className={item.title.includes("Dashboard") ? "-mb-4" : "mb-0"}
            >
              <SidebarMenuItem className='flex items-center justify-center'>
                <SidebarMenuButton isActive={item.isActive} asChild>
                  <Link href={item.url} className='flex items-center gap-3'>
                    <div className='flex h-5 w-5 items-center justify-center'>
                      <item.icon />
                    </div>
                    <span>{item.title} </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          ))}
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
