"use client";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: {
    totalProducts: number;
    totalCategories: number;
    lowStockCount: number;
    inventoryValue: number;
    stockByCategory: {
      categoryName: string;
      stockQuantity: number;
    }[];
    topSellingProducts: {
      name: string;
      unitsSold: number;
      salesValue: number;
    }[];
    lowStockItems: {
      product: {
        name: string;
        stockQuantity: number;
      };
      threshold: number | null;
      message: string;
    }[];
    aiRecommendations: {
      message: string;
      confidence: number | null;
    }[];
  };
}
const Dashboard = ({ data }: Props) => {
  return (
    <div className='p-6 space-y-8 mt-10'>
      <h1 className='text-2xl font-bold'>Inventory Dashboard</h1>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
        <Card className='p-6 shadow-sm'>
          <h3 className='text-sm text-muted-foreground'>Total Products</h3>
          <p className='text-2xl font-bold'>{data.totalProducts}</p>
        </Card>

        <Card className='p-6 shadow-sm'>
          <h3 className='text-sm text-muted-foreground'>Categories</h3>
          <p className='text-2xl font-bold'>{data.totalCategories}</p>
        </Card>

        <Card className='p-6 shadow-sm'>
          <h3 className='text-sm text-muted-foreground'>Low Stock Items</h3>
          <p className='text-2xl font-bold text-red-500'>
            {data.lowStockCount}
          </p>
        </Card>

        <Card className='p-6 shadow-sm'>
          <h3 className='text-sm text-muted-foreground'>Inventory Value</h3>
          <p className='text-2xl font-bold'>
            {formatCurrency(data.inventoryValue)} 
          </p>
        </Card>
      </div>

      {/* Stock by Category Chart */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='p-6'>
          <h2 className='font-semibold mb-4'>Stock Distribution by Category</h2>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={data.stockByCategory}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='categoryName' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey='stockQuantity' fill='#3B82F6' />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Selling Products */}
        <Card className='p-6'>
          <h2 className='font-semibold mb-4'>Top Selling Products</h2>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead>
              <tr>
                <th className='px-4 py-2 text-left'>Product</th>
                <th className='px-4 py-2 text-right'>Units Sold</th>
                <th className='px-4 py-2 text-right'>Sales Value</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {data.topSellingProducts.map((prod, i) => (
                <tr key={i}>
                  <td className='px-4 py-2'>{prod.name}</td>
                  <td className='px-4 py-2 text-right'>{prod.unitsSold}</td>
                  <td className='px-4 py-2 text-right'>
                    {formatCurrency(prod.salesValue)} 
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      <Card className='p-6'>
        <h2 className='font-semibold mb-4'>Low Stock Alerts</h2>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead>
            <tr>
              <th className='px-4 py-2 text-left'>Product</th>
              <th className='px-4 py-2 text-right'>Current Stock</th>
              <th className='px-4 py-2 text-right'>Reorder Level</th>
              <th className='px-4 py-2 text-right'>Status</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {data.lowStockItems.map((item, i) => (
              <tr key={i} className='hover:bg-gray-50'>
                <td className='px-4 py-2'>{item.product.name}</td>
                <td className='px-4 py-2 text-right'>{item.product.stockQuantity}</td>
                <td className='px-4 py-2 text-right'>{item.threshold}</td>
                <td className='px-4 py-2 text-right'>
                  <span className='text-red-600 font-medium'>Low Stock</span>
                </td>
              </tr>
            ))}

            {data.lowStockItems.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className='px-4 py-2 text-center text-sm text-muted-foreground'
                >
                  No low stock alerts
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default Dashboard;
