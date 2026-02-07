'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Logo } from '../logo';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type NavLink = {
  href: string;
  label: string;
};

interface MobileNavProps {
  navLinks: NavLink[];
}

const services = [
    {
        id: 'consulting-transformation',
        title: 'Consulting & Transformation',
    },
    {
        id: 'finance-accounting',
        title: 'Finance & Accounting',
    },
    {
        id: 'human-resources',
        title: 'Human Resources',
    },
    {
        id: 'marketing-ai',
        title: 'Marketing & AI',
    },
];

export function MobileNav({ navLinks }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-primary [&_svg]:h-10 [&_svg]:w-10">
          <Menu />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
        <div className="mb-8 pl-7">
            <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
              <Logo />
            </Link>
        </div>
        <nav className="flex flex-col space-y-4 pl-14 pr-4">
          {navLinks.map((link) => {
            if (link.label === 'Services') {
              return (
                <Accordion key={link.href} type="single" collapsible className="w-full -my-3">
                  <AccordionItem value="services" className="border-b-0">
                    <AccordionTrigger
                      className={cn(
                        'text-lg font-medium transition-colors hover:text-primary hover:no-underline py-2',
                        pathname.startsWith(link.href) ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                     {link.label}
                    </AccordionTrigger>
                    <AccordionContent className="pb-0 pt-2">
                      <div className="flex flex-col space-y-2 pl-4 border-l ml-2">
                        {services.map((service) => (
                          <Link
                            key={service.id}
                            href={`/services?tab=${service.id}`}
                            onClick={() => setOpen(false)}
                            className='text-base font-medium text-muted-foreground transition-colors hover:text-primary'
                          >
                            {service.title}
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'text-lg font-medium transition-colors hover:text-primary',
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
