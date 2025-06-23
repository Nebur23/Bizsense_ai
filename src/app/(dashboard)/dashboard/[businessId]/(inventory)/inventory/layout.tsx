import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { AppSidebar } from "@/components/common/app-sidebar-inventory";

export const metadata: Metadata = {
  title: "Inventory | BizSense AI",
};

export default async function DashBoardLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { businessId: string };
}>) {
  const { businessId } = await params;
  const [session] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
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

  console.log("session", session);

  const id = session?.user.id;

  const member = await prisma.member.findFirst({
    where: { userId: id },
    include: { organization: true },
  });

  if (!member?.organizationId) {
    redirect("/onboarding");
  }

  return (
    <SidebarProvider>
      <AppSidebar className='z-50' businessId={businessId} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
