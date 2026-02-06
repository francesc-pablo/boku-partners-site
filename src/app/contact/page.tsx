import { Mail } from 'lucide-react';
import { ContactForm } from './_components/contact-form';

const contactDetails = [
  {
    icon: <Mail className="h-6 w-6 text-primary" />,
    text: 'info@bokupartners.com',
    href: 'mailto:info@bokupartners.com',
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="bg-secondary">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Contact Us</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            We're here to help. Reach out to us with any questions or to start a conversation about your business needs.
          </p>
        </div>
      </section>

      <section className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
          <div>
            <h2 className="text-3xl font-headline font-semibold mb-6">Get in Touch</h2>
            <div className="space-y-6">
              {contactDetails.map((detail, index) => (
                <a
                  key={index}
                  href={detail.href}
                  className="flex items-center group"
                  target={detail.href.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {detail.icon}
                  </div>
                  <span className="ml-4 text-lg text-muted-foreground group-hover:text-primary transition-colors">
                    {detail.text}
                  </span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-headline font-semibold mb-6">Send Us a Message</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
