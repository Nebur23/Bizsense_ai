import {
  BarChart3,
  Package,
} from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ModulesPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const modules = [
    {
      title: "Finance & Accounting",
      description:
        "Manage financial transactions, reports, budgeting, and accounting operations",
      icon: (
        <BarChart3 className='h-11 w-11 text-blue-600 bg-blue-50 p-2 rounded-md' />
      ),
      //icon: "📊",
      href: `/dashboard/${businessId}/Finance/accounting`,
      isDisabled: false,
    },
    {
      title: "Inventory Management",
      description: "Track stock levels, orders, and warehouse operations",
      icon: (
        <Package className='h-11 w-11 text-green-600 bg-green-50 p-2 rounded-md' />
      ),
      href: `/dashboard/${businessId}/inventory`,
      isDisabled: false,
    },
    // {
    //   title: "Human Resources",
    //   description:
    //     "Employee management, payroll, recruitment, and performance evaluation",
    //   icon: <Users className='h-8 w-8 text-primary' />,
    //   href: "/modules/hr",
    //   isDisabled: true,
    // },
    // {
    //   title: "Sales & CRM",
    //   description:
    //     "Customer relationship management, sales tracking, and opportunity management",
    //   icon: <ShoppingCart className='h-8 w-8 text-primary' />,
    //   href: "/modules/sales",
    //   isDisabled: true,
    // },
    // {
    //   title: "Procurement",
    //   description:
    //     "Purchase orders, vendor management, and supply chain operations",
    //   icon: <Truck className='h-8 w-8 text-primary' />,
    //   href: "/modules/procurement",
    //   isDisabled: true,
    // },
    // {
    //   title: "Manufacturing",
    //   description: "Production planning, scheduling, and quality control",
    //   icon: <Factory className='h-8 w-8 text-primary' />,
    //   href: "/modules/manufacturing",
    //   isDisabled: true,
    // },
    // {
    //   title: "Project Management",
    //   description: "Task tracking, resource allocation, and project timelines",
    //   icon: <ClipboardList className='h-8 w-8 text-primary' />,
    //   href: "/modules/projects",
    //   isDisabled: true,
    // },
    // {
    //   title: "Business Intelligence",
    //   description: "Data analytics, reporting, and performance dashboards",
    //   icon: <PieChart className='h-8 w-8 text-primary' />,
    //   href: "/modules/bi",
    //   isDisabled: true,
    // },
  ];

  return (
    <div className='space-y-6'>
      <div className='mb-8 mt-7 text-center'>
        <h1 className='text-3xl font-bold tracking-tight'>Bizness Apps</h1>
        <p className='mt-2 text-muted-foreground'>
          Access all your business management tools from one central location
        </p>
      </div>
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 p-2'>
        {modules.map((module, index) => (
          <Link
            href={module.isDisabled ? "#" : module.href}
            key={index}
            className='group transition-all'
          >
            <Card className='h-full overflow-hidden transition-all hover:shadow-md'>
              <CardHeader className='pb-2'>
                <div className='mb-2'>{module.icon}</div>

                <CardTitle>{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
