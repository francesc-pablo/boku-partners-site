import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Briefcase,
    MoreHorizontal,
    School,
    Users,
} from "lucide-react";

const industries = [
  {
    name: "Care & Wellness",
    icon: <Users className="w-10 h-10 text-primary" />,
    description: "Eldercare Providers, Childcare Providers, Alternative Care Providers, Self-Care Providers and Med Spas, Pharmacies",
  },
  {
    name: "Education & Development",
    icon: <School className="w-10 h-10 text-primary" />,
    description: "Early Childhood Education, Online and Edtech Platforms",
  },
  {
    name: "Professional & Technology Services",
    icon: <Briefcase className="w-10 h-10 text-primary" />,
    description: "Consulting Firms, Legal and Financial Services, Marketing and Creative Services, SaaS Providers, Technology Development and IT Services",
  },
  {
    name: "And more…",
    icon: <MoreHorizontal className="w-10 h-10 text-primary" />,
    description: "We are always expanding our expertise. Contact us to find out how we can help your specific industry.",
  },
];

export default function IndustryFocusPage() {
  return (
    <>
      <section className="bg-secondary">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Industry Focus</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            At Boku Partners, we provide complete back-office support you need to thrive. We take the operational burdens off your plate so you can focus on what you do best: leading your business and serving your clients. We specialize in helping small businesses in Care & Wellness Services, Education, Professional & Technology Services, and Medical & Scientific Research.
          </p>
        </div>
      </section>

      <section className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {industries.map((industry) => (
            <Card key={industry.name} className="flex flex-col h-full hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-primary/10 rounded-full flex-shrink-0">
                        {industry.icon}
                    </div>
                    <CardTitle className="font-headline text-2xl text-left">{industry.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{industry.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
