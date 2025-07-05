
import { runDailyCashFlowPredictions } from "@/actions/ml/predictions";

export async function GET() {
  console.log("Running daily cash flow predictions...");

  const result = await runDailyCashFlowPredictions();

  if (!result.success) {
    return Response.json(
      { success: false, message: result.message },
      { status: 500 }
    );
  }

  return Response.json({
    success: true,
    prediction: result.prediction,
    currency: "XAF",
    confidence: result.confidence,
  });
}
