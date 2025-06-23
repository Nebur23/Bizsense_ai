import { seedBusinessData } from "@/actions/____seed";

export async function GET() {
  const result = await seedBusinessData();
  return Response.json(result);
}
