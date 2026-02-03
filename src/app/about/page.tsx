import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const teamMembers = [
  { name: 'Alex Johnson', title: 'Managing Partner', imageId: 'team-member-1' },
  { name: 'Maria Garcia', title: 'Head of Finance', imageId: 'team-member-2' },
  { name: 'Sam Chen', title: 'Lead HR Consultant', imageId: 'team-member-3' },
];

const values = [
    { title: 'Partnership', description: 'We build lasting relationships based on trust, transparency, and mutual respect.' },
    { title: 'Integrity', description: 'Our commitment to ethical standards is the foundation of everything we do.' },
    { title: 'Excellence', description: 'We strive for the highest quality in our work, delivering measurable results.' },
    { title: 'Innovation', description: 'We embrace change and leverage cutting-edge solutions to drive client success.' },
];

export default function AboutPage() {
  const aboutImage = PlaceHolderImages.find((img) => img.id === 'about-main');

  return (
    <>
      <section className="bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">About Boku Partners</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            We are a dedicated team of experts committed to empowering businesses through strategic advisory and operational excellence.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <h2 className="text-3xl font-headline font-semibold text-foreground">Our Mission</h2>
            <p>
              To be the premier partner for businesses seeking to navigate growth and transformation. We deliver tailored, high-impact solutions across finance, human resources, and marketing, enabling our clients to achieve sustainable success and market leadership. Our mission is to build resilient, efficient, and innovative organizations by integrating our expertise with their vision.
            </p>
          </div>
          <div>
            {aboutImage && (
              <Image
                src={aboutImage.imageUrl}
                alt={aboutImage.description}
                width={600}
                height={400}
                className="rounded-lg shadow-lg object-cover"
                data-ai-hint={aboutImage.imageHint}
              />
            )}
          </div>
        </div>
      </section>

      <section className="bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-semibold">Our Core Values</h2>
            <p className="text-muted-foreground text-lg mt-2">The principles that guide our work and our partnerships.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <h3 className="text-xl font-headline font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-semibold">Meet Our Leadership</h2>
          <p className="text-muted-foreground text-lg mt-2">The experienced professionals driving our success.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {teamMembers.map((member) => {
            const memberImage = PlaceHolderImages.find((img) => img.id === member.imageId);
            return (
              <div key={member.name} className="text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary/10">
                  <AvatarImage src={memberImage?.imageUrl} alt={member.name} data-ai-hint={memberImage?.imageHint} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-headline font-semibold">{member.name}</h3>
                <p className="text-primary font-medium">{member.title}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
