'use client';

import { useState } from 'react';
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
import { useAuth } from '@/hooks/use-auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/client';
import { Separator } from '../ui/separator';

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
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
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
      <SheetContent side="left">
        <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
        <div className="mb-8 pl-0">
            <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
              <Logo />
            </Link>
        </div>
        <div className='h-full flex flex-col'>
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
          <div className="flex-grow" />
          <Separator className="my-4" />
           <div className="flex flex-col space-y-4 px-7">
              {loading ? null : user ? (
                 <Button variant="outline" onClick={handleLogout} className="w-full">Logout</Button>
              ) : (
                <>
                  <Button variant="ghost" asChild className="w-full text-lg">
                    <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
                  </Button>
                  <Button asChild className="w-full text-lg">
                    <Link href="/signup" onClick={() => setOpen(false)}>Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
