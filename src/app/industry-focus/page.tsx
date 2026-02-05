import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Factory, HeartPulse, Laptop } from "lucide-react";

const industries = [
  {
    name: "Technology",
    description: "Driving innovation for SaaS, hardware, and IT service companies.",
    icon: <Laptop className="w-10 h-10 text-primary" />,
  },
  {
    name: "Healthcare",
    description: "Supporting providers, life sciences, and health tech businesses.",
    icon: <HeartPulse className="w-10 h-10 text-primary" />,
  },
  {
    name: "Financial Services",
    description: "Advising fintech, banking, and investment management firms.",
    icon: <Building className="w-10 h-10 text-primary" />,
  },
  {
    name: "Manufacturing",
    description: "Optimizing operations for industrial and consumer goods producers.",
    icon: <Factory className="w-10 h-10 text-primary" />,
  },
];

export default function IndustryFocusPage() {
  return (
    <>
      <section className="bg-secondary">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Industry Focus</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            We apply deep industry expertise to deliver solutions that meet the unique challenges of your sector.
          </p>
        </div>
      </section>

      <section className="container mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {industries.map((industry) => (
            <Card key={industry.name} className="flex flex-col md:flex-row items-center p-6 hover:border-primary transition-colors">
              <div className="p-4 bg-primary/10 rounded-full mb-4 md:mb-0 md:mr-6">
                {industry.icon}
              </div>
              <div>
                <CardTitle className="font-headline text-2xl mb-2">{industry.name}</CardTitle>
                <p className="text-muted-foreground">{industry.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
