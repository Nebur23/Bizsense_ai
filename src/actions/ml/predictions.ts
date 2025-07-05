"use server";
//import { prepareCashFlowSequence } from "@/actions/ml/cashFlowProcessor";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function runDailyCashFlowPredictions() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });
    const userId = session?.user.id;

    if (!userId) throw new Error("Unauthorized");

    const user = await prisma.member.findFirst({
      where: { userId: userId },
    });

    if (!user) throw new Error("User not found");

    if (!user.organizationId) throw new Error("User businessId not found");

    // if (!["user", "ADMIN"].includes(user.role)) {
    //   throw new Error(
    //     "Unauthorized: Insufficient permissions to create accounts"
    //   );
    // }

    const businessId = user.organizationId;
    // const sequences = await prepareCashFlowSequence();
    // const latestSequence = sequences.slice(-7); // Take last 7 days

    // if (latestSequence.length < 7) {
    //   throw new Error("Insufficient data for prediction");
    // }

    // console.log("Latest cash flow sequence:", latestSequence);

    console.log("Running prediction for businessId:", businessId);

    //dummy data for testing
    const latestSequence = [
      [205000, 145000, 200000, 140000, 195000, 135000],
      [208000, 148000, 205000, 145000, 198000, 138000],
      [210000, 150000, 208000, 148000, 200000, 140000],
      [212000, 152000, 210000, 150000, 202000, 142000],
      [215000, 155000, 212000, 152000, 204000, 144000],
      [218000, 158000, 215000, 155000, 206000, 146000],
      [220000, 160000, 218000, 158000, 208000, 148000],
    ];

    const response = await fetch("http://localhost:8060/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sequence: latestSequence }),
    });

    if (!response.ok) throw new Error("FastAPI prediction failed");

    const result = await response.json();
    const prediction = result.predicted_net_cashflow;
    console.log("Prediction result:", prediction);

    // Save prediction
    // const calculateConfidence = (prediction: number[]): number => {
    //   // Simple confidence calculation based on prediction variance
    //   const mean = prediction.reduce((a, b) => a + b, 0) / prediction.length;
    //   const variance =
    //     prediction.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
    //     prediction.length;
    //   return 1 - Math.sqrt(variance) / mean; // Confidence score between 0 and 1
    // };

    let model = await prisma.aiModel.findFirst({
      where: {
        id: "cf-forecast-model-001",
        businessId: businessId,
      },
    });
    if (!model) {
      model = await prisma.aiModel.create({
        data: {
          businessId: businessId,
          modelName: "Cash Flow Forecast Model",
          version: "1.0",
          modelType: "Forecasting", // Forecasting/Classification/Anomaly Detection
          modelStatus: "Active",
          lastTrained: new Date(),
          trainingDataSize: 365,
          deploymentStatus: "PRODUCTION",
        },
      });
    }
    await prisma.aiPrediction.create({
      data: {
        businessId,
        modelId: model.id,
        predictionType: "CASH_FLOW_FORECAST",
        inputData: JSON.stringify(latestSequence),
        predictionResult: JSON.stringify(prediction),
        confidenceScore: 0.8, // Default confidence if calculation fails
        createdAt: new Date(),
      },
    });

    revalidatePath("/accounting/dashboard");
    return {
      success: true,
      prediction: prediction,
      confidence: 0.8, // Default confidence if calculation fails
      message: "Cash flow forecast generated successfully",
    };
  } catch (error) {
    console.error("Error running prediction:", error);
    return {
      success: false,
      message: "Failed to generate cash flow forecast",
    };
  }
}
