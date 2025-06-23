"use client";
import { Button } from "@/components/ui/button";
import { Session } from "@/lib/auth-types";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import UserDropdown from "./UserButton";
import Link from "next/link";
import Logo from "@/components/common/Logo";

interface Props {
  link: string;
  session: Session;
  name: string;
  email: string;
}

const HeaderItems = ({ link, session, name, email }: Props) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact", href: "#contact" },
  ];
  return (
    <>
      <div className='flex justify-between items-center py-4'>
        <Logo />

        {/* Desktop Navigation */}
        <nav className='hidden md:flex space-x-8'>
          {navigation.map(item => (
            <a
              key={item.name}
              href={item.href}
              className='text-gray-600 hover:text-gray-900 font-medium transition-colors'
            >
              {item.name}
            </a>
          ))}
        </nav>

        <div className='hidden md:flex items-center gap-4'>
          {session ? (
            <div className='flex flex-row items-center gap-2'>
              <UserDropdown
                session={JSON.parse(JSON.stringify(session))}
                name={name}
                email={email}
              />

              <Link href={link}>
                <Button variant={"outline"}>
                  <LayoutDashboard />
                  <span className='hidden md:inline'>Dashboard</span>
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Link href='/signin'>
                <Button variant={"outline"}>Sign In</Button>
              </Link>
              <Button>Start Free Trial</Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className='md:hidden'
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className='w-6 h-6' />
          ) : (
            <Menu className='w-6 h-6' />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className='md:hidden py-4 border-t border-gray-200'>
          <nav className='flex flex-col space-y-4'>
            {navigation.map(item => (
              <a
                key={item.name}
                href={item.href}
                className='text-gray-600 hover:text-gray-900 font-medium'
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className='flex flex-col gap-2 pt-4'>
              {session ? (
                <div className='flex flex-row items-center gap-2'>
                  <UserDropdown
                    session={JSON.parse(JSON.stringify(session))}
                    name={name}
                    email={email}
                  />

                  <Link href={link}>
                    <Button variant={"outline"}>
                      <LayoutDashboard />
                      <span className='hidden md:inline'>Dashboard</span>
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Link href='/signin'>
                    <Button variant='outline' className='w-full'>
                      Sign In
                    </Button>
                  </Link>
                  <Button className='w-full'>Start Free Trial</Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default HeaderItems;
