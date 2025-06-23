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
import {
  BaggageClaim,
  BookCheck,
  BookCopy,
  BookOpen,
  Calculator,
  CircleDollarSignIcon,
  CircleEllipsis,
  CreditCard,
  DollarSign,
  DollarSignIcon,
  HandCoins,
  Handshake,
  Home,
  HomeIcon,
  LayoutDashboard,
  PersonStanding,
  Settings,
  Settings2,
  Wallet,
} from "lucide-react";
import DropMenu from "./nav-dropmenu";
import { useSelectedLayoutSegments } from "next/navigation";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  businessId: string;
}

export function AppSidebar({ businessId, ...props }: AppSidebarProps) {
  const segments = useSelectedLayoutSegments();
  // Navigation data
  const navigationItems = [
    {
      icon: Wallet,
      url: `/dashboard/${businessId}/Finance/accounting/payments`,
      title: "Payments",
      isActive: segments.includes("payments"),
    },

    {
      icon: Calculator,
      url: `/dashboard/${businessId}/Finance/accounting/taxes`,
      title: "Tax Settings",
      isActive: segments.includes("taxes"),
    },
    {
      icon: BookCopy,
      url: `/dashboard/${businessId}/Finance/accounting/reports`,
      title: "Financial Reports",
      isActive: segments.includes("reports"),
    },
  ];

  const navigationLinks = {
    AccountingOperations: {
      name: "Accounting Operations",
      icon: CircleEllipsis,
      isActive: segments.includes("accounts,journal"),
      items: [
        {
          name: "Chart of Accounts",
          url: `/dashboard/${businessId}/Finance/accounting/accounts`,
          isActive: segments.includes("accounts"),
          icon: BookOpen,
        },
        {
          name: "Journal Entries",
          url: `/dashboard/${businessId}/Finance/accounting/journal`,
          isActive: segments.includes("journal"),
          icon: BookCheck,
        },
        {
          name: "Fiscal Periods",
          url: `/dashboard/${businessId}/Finance/accounting/fiscal-periods`,
          isActive: segments.includes("fiscal-periods"),
          icon: BookCopy,
        },
      ],
    },
    Sale: {
      name: "Sales ",
      icon: HandCoins,
      isActive: segments.includes("invoices,customers"),
      items: [
        {
          name: "Invoices",
          url: `/dashboard/${businessId}/Finance/accounting/invoices`,
          isActive: segments.includes("invoices"),
          icon: CreditCard,
        },
        {
          name: "Customers",
          url: `/dashboard/${businessId}/Finance/accounting/customers`,
          isActive: segments.includes("customers"),
          icon: PersonStanding,
        },
      ],
    },
    Purchase: {
      name: "Purchases ",
      icon: BaggageClaim,
      isActive: segments.includes("vendor-bills,vendors,expenses"),
      items: [
        {
          name: "Vendor Bills",
          url: `/dashboard/${businessId}/Finance/accounting/purchase-invoices`,
          isActive: segments.includes("vendor-bills"),
          icon: DollarSignIcon,
        },
        {
          name: "Vendors",
          url: `/dashboard/${businessId}/Finance/accounting/vendors`,
          isActive: segments.includes("vendors"),
          icon: Handshake,
        },
        {
          name: "Expenses",
          url: `/dashboard/${businessId}/Finance/accounting/expenses`,
          isActive: segments.includes("expenses"),
          icon: CircleDollarSignIcon,
        },
      ],
    },
    BankCash: {
      name: " Bank & Cash",
      icon: HomeIcon,
      isActive: segments.includes("bank-accounts,cash-registers"),
      items: [
        {
          name: "Bank Accounts",
          url: `/dashboard/${businessId}/Finance/accounting/bank-accounts`,
          isActive: segments.includes("bank-accounts"),
          icon: Home,
        },
        {
          name: "Cash Registers",
          url: `/dashboard/${businessId}/Finance/accounting/cash-registers`,
          isActive: segments.includes("cash-registers"),
          icon: DollarSign,
        },
      ],
    },
    Configuration: {
      name: " Configuration",
      icon: Settings2,
      isActive: segments.includes("settings,user-roles"),
      items: [
        {
          name: "Accounting Settings",
          url: `/dashboard/${businessId}/Finance/accounting/settings`,
          isActive: segments.includes("settings"),
          icon: Settings,
        },
        {
          name: "User Roles & Permissions",
          url: `/dashboard/${businessId}/Finance/accounting/user-roles`,
          isActive: segments.includes("user-roles"),
          icon: DollarSign,
        },
      ],
    },
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader className='pb-4'>
        <div className='flex flex-col justify-center items-start'>
          <Logo />
          <span className='font-geist-mono  text-cyan-500 self-center font-bold'>
            Accounting
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className='bg-white text-gray-700 font-medium'>
        <SidebarGroup>
          <SidebarMenu className='-mb-4'>
            <SidebarMenuItem className='flex items-center justify-center'>
              <SidebarMenuButton isActive={segments.length === 0} asChild>
                <Link
                  href={`/dashboard/${businessId}/Finance/accounting`}
                  className='flex items-center gap-3'
                >
                  <div className='flex h-5 w-5 items-center justify-center'>
                    <LayoutDashboard />
                  </div>
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <DropMenu data={navigationLinks.AccountingOperations} />
        <DropMenu data={navigationLinks.Sale} />
        <DropMenu data={navigationLinks.Purchase} />
        <DropMenu data={navigationLinks.BankCash} />
        <DropMenu data={navigationLinks.Configuration} />
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
                      <item.icon className='w-4 h-4' />
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
