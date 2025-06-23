import { redirect } from "next/navigation";

const HomeDashBoard = async ({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) => {
  //set loader

  const { businessId } = await params;
  redirect(`/dashboard/${businessId}/modules`);
};

export default HomeDashBoard;
