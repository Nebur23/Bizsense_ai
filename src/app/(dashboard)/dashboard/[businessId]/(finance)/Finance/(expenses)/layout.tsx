import UserDropdown from "@/app/(root)/(components)/UserButton";
import { AppSidebar } from "@/components/common/app-sidebar-expenses";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function DashBoardLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { businessId: string };
}>) {
  const businessId = params.businessId;
  //const { businessId } = await params;
  const [session] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    // auth.api.listSessions({
    //   headers: await headers(),
    // }),
    {
      /* <OrganizationCard
            session={JSON.parse(JSON.stringify(session))}
            activeOrganization={JSON.parse(JSON.stringify(organization))}
          /> */
    },
    // auth.api.listActiveSubscriptions({
    // 	headers: await headers(),
    // }),
  ]).catch(e => {
    console.log(e);
    throw redirect("/sign-in");
  });

  if (!session) redirect("/signin");

  // console.log("session", session);

  const id = session?.user.id;
  const name = session?.user.name;
  const email = session?.user.email;

  // const user = await prisma.user.findUnique({
  //   where: { id },
  // });

  const member = await prisma.member.findFirst({
    where: { userId: id },
    include: { organization: true },
  });

  if (!member?.organizationId) {
    redirect("/onboarding");
  }

  return (
    <SidebarProvider>
      <AppSidebar businessId={businessId} />
      <SidebarInset>
        <div className='flex size-full flex-col overflow-hidden'>
          <div className='flex items-end justify-end w-full px-4 py-1'>
            <UserDropdown
              businessId={businessId}
              session={JSON.parse(JSON.stringify(session))}
              name={name}
              email={email}
            />
          </div>

          <div className='flex h-16 items-center justify-between p-5 shadow-creditCard sm:p-8 md:hidden'>
            <Image src='/icons/logo.png' width={30} height={30} alt='logo' />
            <div>{/* <MobileNav user={user} /> */}</div>
          </div>

          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
