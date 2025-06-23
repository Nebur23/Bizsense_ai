import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | BizSense AI",
};

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session) redirect("/signin");

  const id = session?.user.id;

  const member = await prisma.member.findFirst({
    where: { userId: id },
    include: { organization: true },
  });

  if (!member?.organizationId) {
    redirect("/onboarding");
  } else {
    redirect(`/dashboard/${member?.organizationId}`);
  }
  return (
    <div className='flex h-screen flex-col items-center justify-center gap-4'>
      <Loader2 className='animate-spin' />
      <h1>Loading...</h1>
      <p>Please wait while we redirect you to your dashboard.</p>
    </div>
  );
};

export default Page;
