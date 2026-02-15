'use client';

import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { slugify } from '@/lib/utils';

const services = [
  {
    id: 'consulting-transformation',
    title: 'Consulting & Transformation',
    description: 'We help you assess, strategize, and transform your core functions for optimal performance and growth.',
    subServices: ['Function Assessments', 'M&A/Carveout', 'Strategy & Transformation'],
  },
  {
    id: 'finance-accounting',
    title: 'Finance & Accounting',
    description: 'Our comprehensive financial services ensure your fiscal health and operational efficiency.',
    subServices: [
      'Bookkeeping & Reporting',
      'Cash Flow Management',
      'Accounts Receivable',
      'Accounts Payable',
      'Financial Leadership',
    ],
  },
  {
    id: 'human-resources',
    title: 'Human Resources',
    description: 'From advisory to operations, we manage your HR needs to build a thriving and compliant workforce.',
    subServices: ['Talent Acquisition & Development', 'Payroll', 'HR Operations', 'HR Advisory'],
  },
  {
    id: 'marketing-ai',
    title: 'Marketing & AI',
    description: 'Leverage the power of digital marketing and artificial intelligence to accelerate your market presence.',
    subServices: ['Digital Marketing', 'AI Advisory'],
  },
];

const features = [
    {
      title: 'Expert Guidance',
      description: 'Leverage our deep industry knowledge to navigate complex business challenges and unlock strategic opportunities.'
    },
    {
      title: 'Tailored Solutions',
      description: 'We design and implement solutions specifically for your business needs, ensuring functional alignment and operational excellence.'
    },
    {
      title: 'Growth Focused',
      description: 'Our services are geared towards driving sustainable growth, from financial stability to market expansion.'
    }
]


export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  return (
    <div>
      <section className="container mx-auto pt-2 pb-0">
        <div className="relative h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white rounded-t-lg overflow-hidden">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                priority
                data-ai-hint={heroImage.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 p-4 md:p-8">
              <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 tracking-tight">
                Strategic Partnership for Sustainable Growth
              </h1>
              <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
                Boku works alongside small and growing businesses to bring structure and clarity to finance, HR, and marketing operations.
              </p>
              <Button asChild size="lg" className="font-bold text-lg hover:bg-white hover:text-primary">
                <Link href="/services">Our Services</Link>
              </Button>
            </div>
          </div>
      </section>

      <section className="container mx-auto py-0">
        <div className="bg-secondary rounded-b-lg p-8 md:p-12">
            <div className="text-center max-w-3xl mx-auto mt-12 mb-24">
              <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-4">
                Your Trusted Partner in Business Excellence
              </h2>
              <p className="text-muted-foreground text-lg">
                At Boku Partners, we integrate seamlessly with your team to provide comprehensive solutions that drive efficiency and innovation. From strategic design to operational execution, we are committed to your success.
              </p>
            </div>
            <div className="text-center mt-24 mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-semibold">
                Comprehensive Service Offerings
              </h2>
              <p className="text-muted-foreground text-lg mt-2">
                Solutions designed to meet the evolving needs of your business.
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
                <Accordion type="single" collapsible className="w-full" defaultValue="consulting-transformation">
                {services.map((service) => (
                    <AccordionItem key={service.id} value={service.id} id={service.id}>
                    <AccordionTrigger className="text-xl md:text-2xl text-left font-headline hover:no-underline">
                        {service.title}
                    </AccordionTrigger>
                    <AccordionContent className="prose prose-lg max-w-none text-muted-foreground pt-2">
                        <p className="lead">{service.description}</p>
                        <ul className="list-disc pl-5 mt-4 space-y-2">
                        {service.subServices.map((sub) => (
                            <li key={sub}>
                            <Link href={`/services?tab=${service.id}#${slugify(sub)}`} className="hover:underline hover:text-primary transition-colors">
                                {sub}
                            </Link>
                            </li>
                        ))}
                        </ul>
                    </AccordionContent>
                    </AccordionItem>
                ))}
                </Accordion>
            </div>
          </div>
      </section>

       <section className="container mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-semibold">Why Boku Partners?</h2>
            <p className="text-muted-foreground text-lg mt-2">Achieve more with a partner that understands your vision.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-center">
            {features.map((feature, index) => (
                <div key={index}>
                    <h3 className="text-xl font-headline font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                </div>
            ))}
        </div>
      </section>

      <section className="container mx-auto">
        <div className="bg-primary text-primary-foreground rounded-lg text-center py-12 md:py-20">
            <h2 className="text-3xl font-headline font-semibold mb-4">
              Ready to Elevate Your Business?
            </h2>
            <p className="text-lg max-w-2xl mx-auto mb-8">
              Let's discuss how Boku Partners can help you achieve your strategic objectives.
            </p>
            <Button asChild size="lg" variant="secondary" className="font-bold text-lg">
              <Link href="/contact">Get In Touch</Link>
            </Button>
          </div>
      </section>
    </div>
  );
}
