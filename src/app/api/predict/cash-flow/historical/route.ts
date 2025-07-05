import { getCashInSeries } from "@/actions/ml/cashFlowProcessor";

export async function GET() {

  const series = await getCashInSeries();
  const last7Days = series.slice(-7);

  return Response.json(
    last7Days.map(day => ({
      date: day.date,
      cashIn: day.cashIn,
    }))
  );
}
