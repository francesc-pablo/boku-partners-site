'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '../logo';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { services } from '@/lib/services';
import { useUser, useFirebase } from '@/firebase/client-provider';


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
  const { user, isUserLoading } = useUser();
  const { auth } = useFirebase();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
    }
    setOpen(false);
  };


  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-primary [&_svg]:h-10 [&_svg]:w-10">
          <Menu />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0">
        <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
        <div className="p-6 pb-0">
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
            <Logo />
          </Link>
        </div>
        
        <nav className="flex flex-col space-y-4 p-6 flex-grow overflow-y-auto">
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
                            <Plus className="h-5 w-5 shrink-0 text-primary transition-transform duration-200 group-data-[state=open]:hidden" strokeWidth={2}/>
                            <Minus className="h-5 w-5 shrink-0 text-primary transition-transform duration-200 hidden group-data-[state=open]:block" strokeWidth={2}/>
                            <span className="sr-only">Toggle services submenu</span>
                        </AccordionPrimitive.Trigger>
                      </div>
                    </AccordionPrimitive.Header>
                    <AccordionContent className="pb-0 pt-2">
                      <div className="flex flex-col space-y-2 pl-4 border-l ml-2">
                        {services.map((service) => (
                            <Link
                                key={service.id}
                                href={`/services?tab=${service.id}`}
                                onClick={() => setOpen(false)}
                                className='text-base font-medium text-muted-foreground transition-colors hover:text-primary py-2'
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
        
        <div className="mt-auto p-6 border-t">
            {hasMounted && !isUserLoading && user && (
            <Button onClick={handleLogout} variant="outline" className="w-full">Logout</Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
