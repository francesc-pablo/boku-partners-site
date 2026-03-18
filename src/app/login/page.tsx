import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './_components/login-form';

export default function LoginPage() {
  return (
    <section className="container mx-auto flex justify-center items-center min-h-[calc(100vh-20rem)] py-12 md:py-24">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
            <LoginForm />
        </CardContent>
      </Card>
    </section>
  );
}
