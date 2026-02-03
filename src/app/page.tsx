import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Briefcase, BrainCircuit, HandCoins, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const services = [
  {
    title: 'Advise & Design',
    description: 'Assess, strategize, and transform core functions for optimal performance and growth.',
    icon: <Briefcase className="w-8 h-8 text-primary" />,
    link: '/services#advise-design',
  },
  {
    title: 'Finance & Accounting',
    description: 'Ensure fiscal health and operational efficiency with our comprehensive financial services.',
    icon: <HandCoins className="w-8 h-8 text-primary" />,
    link: '/services#finance-accounting',
  },
  {
    title: 'Human Resources',
    description: 'Build a thriving and compliant workforce with our HR advisory and operational support.',
    icon: <Users className="w-8 h-8 text-primary" />,
    link: '/services#human-resources',
  },
  {
    title: 'Marketing & AI',
    description: 'Accelerate your market presence and drive growth with digital marketing and AI solutions.',
    icon: <BrainCircuit className="w-8 h-8 text-primary" />,
    link: '/services#marketing-ai',
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
      <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white py-0">
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

          <div className="md:hidden">
            <Carousel
              opts={{
                align: 'start',
              }}
              className="w-full max-w-sm mx-auto"
            >
              <CarouselContent>
                {services.map((service, index) => (
                  <CarouselItem key={index} className="basis-11/12">
                    <div className="p-1 h-full">
                      <Card className="h-full flex flex-col group hover:border-primary transition-all duration-300 shadow-md hover:shadow-xl">
                        <CardHeader className="flex flex-col items-center text-center">
                          <div className="p-4 bg-primary/10 rounded-full mb-4">
                            {service.icon}
                          </div>
                          <CardTitle className="font-headline text-xl">{service.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center flex-grow">
                          <p className="text-muted-foreground text-sm min-h-[6rem]">
                            {service.description}
                          </p>
                        </CardContent>
                        <CardFooter className="justify-center pt-0">
                          <Button variant="link" asChild className="font-semibold text-primary">
                            <Link href={service.link}>Learn More <ArrowRight className="w-4 h-4 ml-2" /></Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:inline-flex" />
              <CarouselNext className="hidden sm:inline-flex" />
            </Carousel>
          </div>

          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="h-full flex flex-col group hover:border-primary transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-xl">
                <CardHeader className="flex flex-col items-center text-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    {service.icon}
                  </div>
                  <CardTitle className="font-headline text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center flex-grow">
                  <p className="text-muted-foreground text-sm min-h-[8rem]">
                    {service.description}
                  </p>
                </CardContent>
                <CardFooter className="justify-center pt-0">
                  <Button variant="link" asChild className="font-semibold text-primary">
                    <Link href={service.link}>Learn More <ArrowRight className="w-4 h-4 ml-2" /></Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

       <section className="container mx-auto px-4">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-semibold">Why Boku Partners?</h2>
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

      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
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
