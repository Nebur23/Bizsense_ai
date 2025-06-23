import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OrganizationCard } from "./(components)/organization-card";

const Page = async () => {
  const [session, organization] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),

    auth.api.getFullOrganization({
      headers: await headers(),
    }),
  ]).catch(e => {
    console.log(e);
    throw redirect("/sign-in");
  });
  return (
    <div className='w-full'>
      <div className='flex gap-4 flex-col mt-10'>
        <OrganizationCard
          session={JSON.parse(JSON.stringify(session))}
          activeOrganization={JSON.parse(JSON.stringify(organization))}
        />
      </div>
    </div>
  );
};

export default Page;
