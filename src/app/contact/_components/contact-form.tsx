'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { submitContactForm } from '../actions';

const initialState = {
  message: '',
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Sending...' : 'Send Message'}
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useFormState(submitContactForm, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      if (Object.keys(state.errors).length > 0) {
        toast({
          title: 'Error',
          description: state.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success!',
          description: state.message,
        });
        formRef.current?.reset();
      }
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" placeholder="John Doe" required />
        {state.errors?.name && <p className="text-sm text-destructive mt-1">{state.errors.name[0]}</p>}
      </div>
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required />
        {state.errors?.email && <p className="text-sm text-destructive mt-1">{state.errors.email[0]}</p>}
      </div>
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" placeholder="What can we help with?" required />
        {state.errors?.subject && <p className="text-sm text-destructive mt-1">{state.errors.subject[0]}</p>}
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" placeholder="Your message..." required rows={5} />
        {state.errors?.message && <p className="text-sm text-destructive mt-1">{state.errors.message[0]}</p>}
      </div>
      <SubmitButton />
    </form>
  );
}
