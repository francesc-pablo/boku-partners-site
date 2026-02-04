import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { ServicesTabs } from './_components/services-tabs';

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
      <section className="container mx-auto px-4 pt-2">
        <div className="relative h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white rounded-lg overflow-hidden">
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
            <div className="relative z-10 container mx-auto px-4">
              <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 tracking-tight">
                Strategic Partnership for Sustainable Growth
              </h1>
              <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
                Boku Partners delivers expert advisory and operational support across finance, HR, and marketing to scale your business.
              </p>
              <Button asChild size="lg" className="font-bold text-lg">
                <Link href="/services">Our Services</Link>
              </Button>
            </div>
          </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-4">
            Your Trusted Partner in Business Excellence
          </h2>
          <p className="text-muted-foreground text-lg">
            At Boku Partners, we integrate seamlessly with your team to provide comprehensive solutions that drive efficiency and innovation. From strategic design to operational execution, we are committed to your success.
          </p>
        </div>
      </section>

      <section className="bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-semibold">
              Comprehensive Service Offerings
            </h2>
            <p className="text-muted-foreground text-lg mt-2">
              Solutions designed to meet the evolving needs of your business.
            </p>
          </div>
          <ServicesTabs />
        </div>
      </section>

       <section className="container mx-auto px-4">
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

      <section className="container mx-auto px-4">
        <div className="bg-primary text-primary-foreground rounded-lg text-center py-12 md:py-20 px-4">
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
