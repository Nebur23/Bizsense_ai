import { AppSidebar } from "@/components/common/app-sidebar-accounting";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accounting | BizSense AI",
};

export default async function DashBoardLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ businessId: string }>;
}>) {
  const { businessId } = await params;
  const [session] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
  ]).catch(e => {
    console.log(e);
    throw redirect("/sign-in");
  });

  if (!session) redirect("/signin");


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
