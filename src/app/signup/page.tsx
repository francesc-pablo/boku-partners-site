import { SignUpForm } from './_components/signup-form';

export default function SignUpPage() {
  return (
    <>
      <section className="bg-secondary">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Create an Account</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Join Boku Partners to streamline your business operations.
          </p>
        </div>
      </section>

      <section className="container mx-auto">
        <div className="max-w-md mx-auto">
          <SignUpForm />
        </div>
      </section>
    </>
  );
}
