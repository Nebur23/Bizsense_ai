import { ReactNode } from "react";


export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className='flex min-h-screen flex-col justify-center sm:px-6 lg:px-8'>
      {children}
    </div>
  );
}
