import { PhysicalCountForm } from "@/components/inventory/PhysicalCountForm";
import { Card } from "@/components/ui/card";

export default function PhysicalCountPage() {
  return (
    <div className='p-6 space-y-6'>
      <h1 className='text-2xl font-bold'>Physical Count</h1>
      <Card className='p-6'>
        <PhysicalCountForm />
      </Card>
    </div>
  );
}
