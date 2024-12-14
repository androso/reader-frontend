import { useAuth } from '@/lib/auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function Login() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    setLocation('/');
    return null;
  }

  const handleGoogleLogin = () => {
    window.location.href = '/auth/google';
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold text-center mb-6">Login</h1>
        <Button 
          onClick={handleGoogleLogin}
          className="w-full"
          variant="outline"
        >
          Continue with Google
        </Button>
      </Card>
    </div>
  );
}
