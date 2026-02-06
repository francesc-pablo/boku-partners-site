import { Card, CardTitle } from "@/components/ui/card";
import {
    Activity,
    Baby,
    Hospital,
    Leaf,
    MoreHorizontal,
    Pill,
    School,
    Smile,
    Sparkles,
    Stethoscope,
    User,
    Users
} from "lucide-react";

const industries = [
  {
    name: "Education",
    icon: <School className="w-10 h-10 text-primary" />,
  },
  {
    name: "Hospitals",
    icon: <Hospital className="w-10 h-10 text-primary" />,
  },
  {
    name: "Pharmacies",
    icon: <Pill className="w-10 h-10 text-primary" />,
  },
  {
    name: "Medical Practices",
    icon: <Stethoscope className="w-10 h-10 text-primary" />,
  },
  {
    name: "Medical Specialties",
    icon: <Activity className="w-10 h-10 text-primary" />,
  },
  {
    name: "Physicians Offices",
    icon: <User className="w-10 h-10 text-primary" />,
  },
  {
    name: "Dental Practices",
    icon: <Smile className="w-10 h-10 text-primary" />,
  },
  {
    name: "Eldercare Providers",
    icon: <Users className="w-10 h-10 text-primary" />,
  },
  {
    name: "Childcare Providers",
    icon: <Baby className="w-10 h-10 text-primary" />,
  },
  {
    name: "Alternative Care Providers",
    icon: <Leaf className="w-10 h-10 text-primary" />,
  },
  {
    name: "Self-Care Providers and Medical Spas",
    icon: <Sparkles className="w-10 h-10 text-primary" />,
  },
  {
    name: "And more . . .",
    icon: <MoreHorizontal className="w-10 h-10 text-primary" />,
  },
];

export default function IndustryFocusPage() {
  return (
    <>
      <section className="bg-secondary">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Industry Focus / Expertise</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            At Boku, we take a broad view of the health and wellness sector, providing complete back-office solutions for traditional providers as well as those offering something a little different. Our specialized services are tailored for the following types of organizations:
          </p>
        </div>
      </section>

      <section className="container mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {industries.map((industry) => (
            <Card key={industry.name} className="flex items-center p-6 hover:border-primary transition-colors">
              <div className="p-4 bg-primary/10 rounded-full mr-6">
                {industry.icon}
              </div>
              <CardTitle className="font-headline text-xl text-left flex-1">{industry.name}</CardTitle>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
