"use client";

import { ChevronRight, PieChart, type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import Link from "next/link";

export function AccountingOperations({
  data,
}: {
  data: {
    name: string;
    items: {
      name: string;
      url: string;
      isActive: boolean;
      icon: LucideIcon;
    }[];
  };
}) {
  return (
    <SidebarGroup className='group-data-[collapsible=icon]:hidden'>
      {/* <SidebarGroupLabel className='md:text-lg'>
        Accounting Operations
      </SidebarGroupLabel> */}
      <SidebarMenu>
        <Collapsible
          key={data.name}
          asChild
          //defaultOercel.com/pen={item.isActive}
          className='group/collapsible'
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton>
                <span className='md:text-md font-medium flex justify-center items-center gap-2'>
                  <PieChart />
                  {data.name}
                </span>
                <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
              </SidebarMenuButton>
            </CollapsibleTrigger>

            <CollapsibleContent className='text-sm'>
              {data.items.map(item => (
                <SidebarMenuButton
                  key={item.name}
                  isActive={item.isActive}
                  className=' justify-center'
                >
                  <SidebarMenuSubItem>
                    <Link href={item.url} className='flex items-center gap-2'>
                      <div className='flex h-5 w-5 items-center justify-center'>
                        <item.icon className='h-4 w-4' />
                      </div>
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuSubItem>
                </SidebarMenuButton>
              ))}
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
