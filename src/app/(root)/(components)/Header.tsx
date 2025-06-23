import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import HeaderItems from "./HeaderItems";
import { Session } from "@/lib/auth-types";

const HeaderBox = async () => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  const name = session?.user.name;
  const email = session?.user.email;
  const id = session?.user.id ?? "";

  const member = await prisma.member.findFirst({
    where: { userId: id },
    include: { organization: true },
  });
  const businessId = member?.organizationId;

  const link = businessId ? `/dashboard/${businessId}` : "/onboarding";

  return (
    <header className='bg-white shadow-sm sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <HeaderItems
          link={link}
          session={session as Session}
          name={name as string}
          email={email as string}
        />
      </div>
    </header>
  );
};

export default HeaderBox;
