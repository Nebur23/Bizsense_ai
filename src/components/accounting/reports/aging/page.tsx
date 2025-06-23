import { getAgingReport } from "@/actions/accounting/report";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default async function AgingReportPage() {
  const data = await getAgingReport();

  return (
    <div className='space-y-6 p-6'>
      <h1 className='text-2xl font-bold'>Aging Report</h1>

      <Card>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-4 py-3 text-left'>Customer</th>
                <th className='px-4 py-3 text-right'>Total Due</th>
                <th className='px-4 py-3 text-right'>Current</th>
                <th className='px-4 py-3 text-right'>1–30 Days</th>
                <th className='px-4 py-3 text-right'>31–60 Days</th>
                <th className='px-4 py-3 text-right'>61+ Days</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {data.map((row, i) => (
                <tr key={i}>
                  <td className='px-4 py-3'>{row.customer}</td>
                  <td className='px-4 py-3 text-right'>
                    {formatCurrency(row.totalDue)}
                  </td>
                  <td className='px-4 py-3 text-right'>
                    {formatCurrency(row.current)}
                  </td>
                  <td className='px-4 py-3 text-right'>
                    {formatCurrency(row.days1To30)}
                  </td>
                  <td className='px-4 py-3 text-right'>
                    {formatCurrency(row.days31To60)}
                  </td>
                  <td className='px-4 py-3 text-right'>
                    {formatCurrency(row.days61Plus)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
