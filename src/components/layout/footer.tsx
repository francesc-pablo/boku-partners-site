'use client';

import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/industry-focus', label: 'Industry Focus' },
  { href: '/contact', label: 'Contact' },
];

const services = [
    {
        id: 'consulting-transformation',
        title: 'Consulting and Transformation',
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

export function Footer() {

  return (
    <footer className="bg-secondary">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
            <h3 className="font-headline font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
                {services.map((service) => (
                    <li key={service.id}>
                        <Link href={`/services?tab=${service.id}`} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                            {service.title}
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
