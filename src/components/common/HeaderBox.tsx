import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getFirstName } from "@/lib/utils";
import { headers } from "next/headers";

const HeaderBox = async ({
  type = "title",
  title,
  subtext,
}: HeaderBoxProps) => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  const userId = session?.user.id;
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  const userName = getFirstName(user?.name as string);
  return (
    <div className='flex flex-col gap-1'>
      <h1 className='text-[24px] leading-[30px] lg:text-30 font-semibold text-gray-900'>
        {title}
        {type === "greeting" && (
          <span className='text-[#0179FE] '>&nbsp;{userName}</span>
        )}
      </h1>
      <p className='text-14 lg:text-16 font-normal text-gray-600'>{subtext}</p>
    </div>
  );
};

export default HeaderBox;
