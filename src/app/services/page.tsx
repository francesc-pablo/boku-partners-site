import { ServicesTabs } from '@/app/_components/services-tabs';

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
        <ServicesTabs />
      </section>
    </>
  );
}
