"use client";

import { Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Session } from "@/lib/auth-types";
import Link from "next/link";

export default function UserDropdown({
  name,
  email,
  session,
  businessId,
}: {
  name?: string;
  email?: string;
  session: Session | null;
  businessId: string;
}) {
  return (
    <div className='relative'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className='hidden h-9 w-9 sm:flex cursor-pointer border-2 animate-pulse'>
            <AvatarImage
              src={session?.user.image || undefined}
              alt='Avatar'
              className='object-cover'
            />
            <AvatarFallback className=''>
              {session?.user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-80 p-0 mr-4 rounded-lg' align='end'>
          <div className='p-4 flex items-center gap-3'>
            <Avatar className='hidden h-9 w-9 sm:flex border-2'>
              <AvatarImage
                src={session?.user.image || undefined}
                alt='Avatar'
                className='object-cover'
              />
              <AvatarFallback>{session?.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className='font-medium text-gray-800'> {name} </h3>
              <p className='text-sm text-gray-500'>{email} </p>
            </div>
          </div>

          <Link href={`/dashboard/${businessId}/settings`}>
            <DropdownMenuItem className='px-4 py-2 cursor-pointer'>
              <Settings className='w-5 h-5 text-gray-400 mr-3' />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>

          <DropdownMenuItem
            onClick={() => {
              authClient.signOut();
              redirect("/signin");
            }}
            className='px-4 py-2 cursor-pointer'
          >
            <LogOut className='w-5 h-5 text-gray-400 mr-3' />
            <span>Sign Out</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <div className='p-4 flex items-center justify-center text-xs text-gray-400'>
            <span className='ml-1 font-medium'>BizSense AI</span>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
