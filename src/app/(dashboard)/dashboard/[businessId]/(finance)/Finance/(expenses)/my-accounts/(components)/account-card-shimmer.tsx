"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export function AccountCardShimmer() {
  return (
    <Card className='hover:shadow-md transition-shadow relative overflow-hidden'>
      <div className='absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent' />
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <div className='h-5 w-24 rounded bg-muted/70' />
        <div className='h-5 w-10 rounded bg-muted/70' />
      </CardHeader>
      <CardContent>
        <div className='h-8 w-32 rounded bg-muted/70 mb-1.5' />
        <div className='h-4 w-28 rounded bg-muted/70' />
      </CardContent>
      <CardFooter className='flex justify-between'>
        <div className='flex items-center'>
          <div className='h-4 w-4 rounded-full mr-1 bg-muted/70' />
          <div className='h-4 w-16 rounded bg-muted/70' />
        </div>
        <div className='flex items-center'>
          <div className='h-4 w-4 rounded-full mr-1 bg-muted/70' />
          <div className='h-4 w-16 rounded bg-muted/70' />
        </div>
      </CardFooter>
    </Card>
  );
}
