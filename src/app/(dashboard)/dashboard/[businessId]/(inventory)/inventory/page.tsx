import { getInventoryDashboardData } from "@/actions/inventory/dashboard";

import Dashboard from "./dashboard";

export default async function InventoryDashboardPage() {
  const products = await getInventoryDashboardData();
  const data = products.data;

  return <Dashboard data={data} />;
}
