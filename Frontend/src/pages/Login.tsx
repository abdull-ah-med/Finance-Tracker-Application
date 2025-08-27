import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
  import { Button, Card, CardContent, CardHeader, Input, Label } from '../components/ui';
import { Loader2 } from 'lucide-react';
import './login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="spinner" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/accounts" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card">
        <CardHeader>
          <h2 className="card-title">Login</h2>
          <p className="card-desc">Enter your email below to login to your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              {error && (
                <div className="text-error text-sm">
                  {error}
                </div>
              )}
              <Button type="submit" className="btn-block" disabled={isSubmitting}>
                {isSubmitting && <Loader2 size={16} className="spinner" />}
                Login
              </Button>
            </div>
          </form>
          <div className="signup-link">
            Don&apos;t have an account?{' '}
            <Link to="/signup">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
