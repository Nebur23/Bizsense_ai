import type * as React from "react";
import Image from "next/image";
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

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  businessId: string;
}

export function AppSidebar({ businessId, ...props }: AppSidebarProps) {
  // Navigation data
  const navigationItems = [
    {
      icon: "/icons/home.svg",
      url: `/dashboard/${businessId}/Finance`,
      title: "Dashboard",
    },
    {
      icon: "/icons/dollar-circle.svg",
      url: `/dashboard/${businessId}/Finance/my-accounts`,
      title: "My Accounts",
    },
    {
      icon: "/icons/transaction.svg",
      url: `/dashboard/${businessId}/Finance/transaction-history`,
      title: "Transaction History",
    },
    {
      icon: "/icons/money-send.svg",
      url: `/dashboard/${businessId}/Finance/add-transaction`,
      title: "Add Transaction",
    },
  ];

  return (
    <Sidebar {...props}>
      <SidebarHeader className='pb-6'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link href={`/dashboard/${businessId}`}>
                <span className='text-xl font-bold text-wrap font-geist-sans'>
                  Finance & Accounting
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className=' '>
            {navigationItems.map(item => (
              <SidebarMenuItem
                key={item.title}
                className='flex items-center justify-center'
              >
                <SidebarMenuButton asChild>
                  <Link href={item.url} className='flex items-center gap-3'>
                    <div className='flex h-5 w-5 items-center justify-center'>
                      <Image
                        src={item.icon || "/placeholder.svg"}
                        width={20}
                        height={20}
                        alt={`${item.title} icon`}
                      />
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
