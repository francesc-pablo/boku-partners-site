import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignupForm } from './_components/signup-form';

export default function SignupPage() {
  return (
     <section className="container mx-auto flex justify-center items-center min-h-[calc(100vh-20rem)] py-12 md:py-24">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Create an Account</CardTitle>
            <CardDescription>Join Boku Partners to manage your business.</CardDescription>
        </CardHeader>
        <CardContent>
            <SignupForm />
        </CardContent>
      </Card>
    </section>
  );
}
