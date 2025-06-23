"use client";
import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import Link from "next/link";

export default function DropMenu({
  data,
}: {
  data: {
    name: string;
    icon: LucideIcon;
    isActive: boolean;
    items: {
      name: string;
      url: string;
      isActive: boolean;
      icon: LucideIcon;
    }[];
  };
}) {
  return (
    <SidebarGroup>
      <SidebarMenu className='-mb-4'>
        <Collapsible
          key={data.name}
          asChild
          defaultOpen={data.isActive}
          className='group/collapsible'
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={data.name}>
                {data.icon && <data.icon />}
                <span>{data.name}</span>
                <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent className='text-sm'>
              <SidebarMenuSub>
                {data.items.map(item => (
                  <SidebarMenuSubItem key={item.name}>
                    <SidebarMenuSubButton isActive={item.isActive} asChild>
                      <Link href={item.url}>
                        <div>
                          <div className='flex gap-1.5 items-center'>
                            <item.icon className='h-4 w-4' />
                            <span>{item.name}</span>
                          </div>
                        </div>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
