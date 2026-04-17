import { LoginForm } from './_components/login-form';

export default function LoginPage() {
  return (
    <>
      <section className="bg-secondary">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Client Portal Login</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Access your secure dashboard.
          </p>
        </div>
      </section>

      <section className="container mx-auto">
        <div className="max-w-md mx-auto">
          <LoginForm />
        </div>
      </section>
    </>
  );
}
