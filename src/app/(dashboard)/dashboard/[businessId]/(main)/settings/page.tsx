import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import UserCard from "./(components)/user-card";

const Page = async () => {
  const [session, activeSessions] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    auth.api.listSessions({
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
  return (
    <div className='w-full'>
      <div className='flex gap-4 flex-col mt-10 overflow-hidden'>
        <UserCard
          session={JSON.parse(JSON.stringify(session))}
          activeSessions={JSON.parse(JSON.stringify(activeSessions))}
        />
      </div>
    </div>
  );
};

export default Page;
