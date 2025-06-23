import UserDropdown from "@/app/(root)/(components)/UserButton";
import AppSheet from "@/components/common/AppSheet";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const LayoutBusiness = async ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ businessId: string }>;
}>) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    if (!session) redirect("/signin");
  }

  const name = session?.user.name;
  const email = session?.user.email;

  const { businessId } = await params;

  return (
    <div className='h-screen overflow-auto'>
      <div className='flex gap-5 justify-end items-center w-full px-4 fixed bg-white border-b py-2  z-30 top-0'>
        <UserDropdown
          session={JSON.parse(JSON.stringify(session))}
          name={name}
          email={email}
          businessId={businessId}
        />

        <AppSheet businessId={businessId} />
      </div>
      {children}
    </div>
  );
};

export default LayoutBusiness;
