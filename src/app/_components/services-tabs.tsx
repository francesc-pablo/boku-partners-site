'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, slugify } from '@/lib/utils';
import { services } from '@/lib/services';

export function ServicesTabs({ activeTab }: { activeTab?: string }) {
  const [highlightedId, setHighlightedId] = useState('');

  useEffect(() => {
    // This effect runs only once on the client after the component mounts.
    const hash = window.location.hash.substring(1);
    if (hash) {
      setHighlightedId(hash);
      // The browser will scroll to the element with the ID in the hash.
      // For a smoother scroll, we can do it programmatically.
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100); // A small delay can help ensure the element is rendered.
    }
  }, []);

  return (
    <Tabs defaultValue={activeTab || "consulting-transformation"} className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
        {services.map((service) => (
          <TabsTrigger key={service.id} value={service.id} className="font-headline py-2 text-xs sm:text-sm data-[state=active]:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            {service.title}
          </TabsTrigger>
        ))}
      </TabsList>
      {services.map((service) => (
        <TabsContent key={service.id} value={service.id} className="pt-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.subServices.map((subService) => {
              const subServiceId = slugify(subService.title);
              const isHighlighted = subServiceId === highlightedId;

              return (
                <Card
                  key={subService.title}
                  id={subServiceId}
                  className={cn(
                    'group h-full flex flex-col cursor-pointer transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-lg',
                    isHighlighted && 'bg-primary text-primary-foreground shadow-lg'
                  )}
                >
                  <CardHeader>
                    <CardTitle className="text-xl font-headline">{subService.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className={cn('text-muted-foreground group-hover:text-primary-foreground/90 transition-colors', isHighlighted && 'text-primary-foreground/90')}>
                      {subService.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
