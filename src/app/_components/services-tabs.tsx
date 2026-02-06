'use client';

import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const services = [
  {
    id: 'advise-design',
    title: 'Advise & Design',
    subServices: [
        { title: 'Function Assessments', description: 'In-depth analysis of your business functions to identify opportunities for improvement and strategic alignment.' },
        { title: 'M&A/Carveout', description: 'Expert guidance through mergers, acquisitions, and carve-out scenarios to ensure smooth transitions and value creation.' },
        { title: 'Strategy & Transformation', description: 'Developing and implementing robust strategies to drive organizational transformation and long-term growth.' },
    ],
  },
  {
    id: 'finance-accounting',
    title: 'Finance & Accounting',
    subServices: [
      { title: 'CFO Advisory', description: 'Strategic financial leadership to guide your business through complex challenges and opportunities.' },
      { title: 'Accounts Receivable', description: 'Optimizing your AR processes to improve cash flow and reduce outstanding receivables.' },
      { title: 'Accounts Payable', description: 'Streamlining your AP operations for better vendor management and cost control.' },
      { title: 'Bookkeeping & Reporting', description: 'Accurate and timely bookkeeping and financial reporting to support informed decision-making.' },
      { title: 'Cash Flow Management', description: 'Proactive cash flow forecasting and management to ensure financial stability and growth.' },
    ],
  },
  {
    id: 'human-resources',
    title: 'Human Resources',
    subServices: [
        { title: 'HR Advisory', description: 'Strategic HR guidance to align your people strategy with your business objectives.' },
        { title: 'HR Operations', description: 'Efficient and compliant HR operations to manage the entire employee lifecycle.' },
        { title: 'Talent Acquisition & Development', description: 'Attracting, retaining, and developing top talent to build a high-performing team.' },
        { title: 'Payroll', description: 'Reliable and accurate payroll processing to ensure your employees are paid on time, every time.' },
    ],
  },
  {
    id: 'marketing-ai',
    title: 'Marketing & AI',
    subServices: [
        { title: 'Digital Marketing', description: 'Comprehensive digital marketing strategies to enhance your online presence and drive lead generation.' },
        { title: 'AI Advisory', description: 'Leveraging artificial intelligence to optimize processes, gain insights, and create a competitive advantage.' },
    ],
  },
];

export function ServicesTabs({ activeTab }: { activeTab?: string }) {
  return (
    <Tabs defaultValue={activeTab || "advise-design"} className="w-full">
      <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-4 h-auto">
        {services.map((service) => (
          <TabsTrigger key={service.id} value={service.id} className="font-headline py-2 data-[state=active]:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            {service.title}
          </TabsTrigger>
        ))}
      </TabsList>
      {services.map((service) => (
        <TabsContent key={service.id} value={service.id} className="pt-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.subServices.map((subService) => (
              <Card key={subService.title} className="group h-full flex flex-col cursor-pointer transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-headline">{subService.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground group-hover:text-primary-foreground/90 transition-colors">{subService.description}</p>
                </CardContent>
                <CardFooter className="pt-4 justify-end">
                    <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
