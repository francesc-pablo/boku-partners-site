'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Logo } from '../logo';
import { cn, slugify } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { services } from '@/lib/services';

type NavLink = {
  href: string;
  label: string;
};

interface MobileNavProps {
  navLinks: NavLink[];
}

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
        <div className="mb-8 pl-0">
            <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
              <Logo />
            </Link>
        </div>
        <nav className="flex flex-col space-y-4 pl-7 pr-4">
          {navLinks.map((link) => {
            if (link.label === 'Services') {
              return (
                <Accordion key={link.href} type="single" collapsible className="w-full -my-3">
                  <AccordionItem value="services" className="border-b-0">
                    <AccordionPrimitive.Header className="flex w-full">
                      <div className="flex flex-1 items-center justify-between">
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            'text-lg font-medium transition-colors hover:text-primary py-2',
                            pathname.startsWith(link.href) ? 'text-primary' : 'text-muted-foreground'
                          )}
                        >
                          {link.label}
                        </Link>
                        <AccordionPrimitive.Trigger className="group p-2 -mr-2">
                            <Plus className="h-3.5 w-3.5 shrink-0 text-primary transition-transform duration-200 group-data-[state=open]:hidden" strokeWidth={5}/>
                            <Minus className="h-3.5 w-3.5 shrink-0 text-primary transition-transform duration-200 hidden group-data-[state=open]:block" strokeWidth={5}/>
                            <span className="sr-only">Toggle services submenu</span>
                        </AccordionPrimitive.Trigger>
                      </div>
                    </AccordionPrimitive.Header>
                    <AccordionContent className="pb-0 pt-2">
                      <div className="flex flex-col space-y-2 pl-4 border-l ml-2">
                        <Accordion type="multiple" className="w-full">
                          {services.map((service) => (
                            <AccordionItem key={service.id} value={service.id} className="border-b-0">
                                <AccordionPrimitive.Header className="flex w-full">
                                    <div className="flex flex-1 items-center justify-between">
                                        <Link
                                            href={`/services?tab=${service.id}`}
                                            onClick={() => setOpen(false)}
                                            className='text-sm font-medium text-muted-foreground transition-colors hover:text-primary py-2'
                                        >
                                            {service.title}
                                        </Link>
                                        <AccordionPrimitive.Trigger className="group p-2 -mr-2">
                                            <Plus className="h-4 w-4 shrink-0 text-primary/80 transition-transform duration-200 group-data-[state=open]:hidden" strokeWidth={3}/>
                                            <Minus className="h-4 w-4 shrink-0 text-primary/80 transition-transform duration-200 hidden group-data-[state=open]:block" strokeWidth={3}/>
                                            <span className="sr-only">Toggle {service.title} submenu</span>
                                        </AccordionPrimitive.Trigger>
                                    </div>
                                </AccordionPrimitive.Header>
                                <AccordionContent className="pb-0 pt-2">
                                    <div className="flex flex-col space-y-2 pl-4 border-l ml-2">
                                        {service.subServices.map((subService) => (
                                            <Link
                                                key={subService.title}
                                                href={`/services?tab=${service.id}#${slugify(subService.title)}`}
                                                onClick={() => setOpen(false)}
                                                className='text-xs font-medium text-muted-foreground transition-colors hover:text-primary'
                                            >
                                                {subService.title}
                                            </Link>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
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
