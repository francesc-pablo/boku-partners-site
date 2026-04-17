import { ForgotPasswordForm } from './_components/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <>
      <section className="bg-secondary">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Reset Your Password</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Enter your email to receive a password reset link.
          </p>
        </div>
      </section>

      <section className="container mx-auto">
        <div className="max-w-md mx-auto">
          <ForgotPasswordForm />
        </div>
      </section>
    </>
  );
}
