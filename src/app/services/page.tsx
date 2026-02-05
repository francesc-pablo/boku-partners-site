import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const services = [
  {
    id: 'advise-design',
    title: 'Advise & Design',
    description: 'We help you assess, strategize, and transform your core functions for optimal performance and growth.',
    subServices: ['Function Assessments', 'M&A/Carveout', 'Strategy & Transformation'],
  },
  {
    id: 'finance-accounting',
    title: 'Finance & Accounting',
    description: 'Our comprehensive financial services ensure your fiscal health and operational efficiency.',
    subServices: [
      'CFO Advisory',
      'Accounts Receivable',
      'Accounts Payable',
      'Bookkeeping & Reporting',
      'Cash Flow Management',
    ],
  },
  {
    id: 'human-resources',
    title: 'Human Resources',
    description: 'From advisory to operations, we manage your HR needs to build a thriving and compliant workforce.',
    subServices: ['HR Advisory', 'HR Operations', 'Talent Acquisition & Development', 'Payroll'],
  },
  {
    id: 'marketing-ai',
    title: 'Marketing & AI',
    description: 'Leverage the power of digital marketing and artificial intelligence to accelerate your market presence.',
    subServices: ['Digital Marketing', 'AI Advisory'],
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="bg-secondary">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Our Services</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Tailored solutions to drive growth, efficiency, and innovation across your organization.
          </p>
        </div>
      </section>

      <section className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full" defaultValue="advise-design">
            {services.map((service) => (
              <AccordionItem key={service.id} value={service.id} id={service.id}>
                <AccordionTrigger className="text-2xl font-headline hover:no-underline">
                  {service.title}
                </AccordionTrigger>
                <AccordionContent className="prose prose-lg max-w-none text-muted-foreground pt-2">
                  <p className="lead">{service.description}</p>
                  <ul className="list-disc pl-5 mt-4 space-y-2">
                    {service.subServices.map((sub) => (
                      <li key={sub}>{sub}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
