'use client';

import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/industry-focus', label: 'Industry Focus' },
  { href: '/contact', label: 'Contact' },
];

export function Footer() {

  return (
    <footer className="bg-secondary">
      <div className="container mx-auto py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">Email: info@bokupartners.com</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
