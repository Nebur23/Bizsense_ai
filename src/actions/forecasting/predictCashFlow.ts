/* eslint-disable @typescript-eslint/no-explicit-any */

"use server";

export async function predictCashFlow(data: any) {
  const response = await fetch("http://localhost:8060/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Prediction failed");
  }

  return await response.json(); // { prediction: float }
}
