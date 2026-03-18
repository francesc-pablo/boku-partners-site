'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { MobileNav } from './mobile-nav';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '../ui/button';
import { auth } from '@/firebase/client';
import { signOut } from 'firebase/auth';
import { Skeleton } from '../ui/skeleton';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/industry-focus', label: 'Industry Focus' },
  { href: '/contact', label: 'Contact' },
  { href: '/clients', label: 'Clients' },
];

export function Header() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const headerHeight = 80; // h-20 is 5rem which is 80px

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > headerHeight) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <header
      className={cn(
        'sticky z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-20 transition-all duration-300',
        hidden ? '-top-20' : 'top-0'
      )}
    >
      <div className="container flex h-full items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
        </div>

        <div className="flex-grow" />

        <div className="flex items-center">
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'transition-colors hover:text-primary',
                    pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="md:hidden pr-7">
              <MobileNav navLinks={navLinks} />
            </div>
            <div className="hidden md:flex items-center pl-6">
              {loading ? (
                <Skeleton className="h-10 w-24" />
              ) : user ? (
                 <div className="flex items-center gap-2">
                  <Button variant="ghost" asChild>
                    <Link href="/account">Account</Link>
                  </Button>
                  <Button variant="outline" onClick={handleLogout}>Logout</Button>
                </div>
              ) : (
                <Button asChild>
                  <Link href="/login">Login</Link>
                </Button>
              )}
            </div>
        </div>
      </div>
    </header>
  );
}
