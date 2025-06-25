import Logo from "@/components/common/Logo";
import MyForm from "./form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding | BizSense AI",
};

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session) redirect("/signin");
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='max-w-xl w-full flex flex-col mx-auto justify-center items-center pt-7'>
        <Logo />
        {/* <h1 className='font-geist-sans text-xl w-full font-semibold p-3 sm:p-0 mt-8 text-left'>
          Business Details
        </h1> */}

        <MyForm />
      </div>
    </div>
  );
};

export default Page;
