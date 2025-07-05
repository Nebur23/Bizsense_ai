"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Grip } from "lucide-react";
import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import { useState } from "react";

interface Props {
  businessId: string;
}

const AppSheet = ({ businessId }: Props) => {
  const segments = useSelectedLayoutSegments();
  const [isAppsOpen, setIsAppsOpen] = useState(false);

  const supplyChainApps = [
    {
      name: "Inventory",
      description: "Complete Inventory Management System",
      icon: "📦",
      color: "bg-blue-500",
      url: `/dashboard/${businessId}/inventory`,
    },
    // {
    //   name: "Invoice Generator",
    //   description: "Professional Invoice Management",
    //   icon: "🧾",
    //   color: "bg-orange-500",
    //   url: "inventory",
    // },
  ];
  const financeApps = [
    {
      name: "Accounting",
      description: "Full-featured Accounting Software",
      icon: "📊",
      color: "bg-green-500",
      url: `/dashboard/${businessId}/Finance/accounting`,
    },
    // {
    //   name: "Financial Reports",
    //   description: "Advanced Financial Reporting Tools",
    //   icon: "📈",
    //   color: "bg-purple-500",
    //   url: "inventory",
    // },
  ];

  const apps = segments.includes("Finance")
    ? supplyChainApps
    : segments.includes("inventory")
      ? financeApps
      : [...supplyChainApps, ...financeApps];
  return (
    <Sheet open={isAppsOpen} onOpenChange={setIsAppsOpen}>
      <SheetTrigger asChild>
        <Grip />
      </SheetTrigger>
      <SheetContent side='right'>
        <SheetHeader>
          <SheetTitle className='border-b pb-4'>All Bizsense Apps</SheetTitle>
        </SheetHeader>

        <div className='mt-2'>
          <h3 className='text-sm font-medium text-gray-500 uppercase pl-3 tracking-wide mb-4'>
            BUSINESS APPS
          </h3>
          <div className='space-y-3'>
            {apps.map((app, index) => (
              <Link
                onClick={() => setIsAppsOpen(false)}
                href={app.url}
                key={index}
                className='flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer'
              >
                <div
                  className={`w-10 h-10 ${app.color} rounded-lg flex items-center justify-center text-white text-lg`}
                >
                  {app.icon}
                </div>
                <div className='flex-1'>
                  <div className='font-medium text-gray-900'>{app.name}</div>
                  <div className='text-sm text-gray-500'>{app.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AppSheet;
