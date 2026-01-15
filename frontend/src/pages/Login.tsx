import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { api } from '@/lib/api';
import SuccessAnimation from '@/components/ui/success-animation';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.auth.login({
        email,
        password,
      });

      // Store token in sessionStorage
      sessionStorage.setItem('authToken', response.token);
      
      // Update user context with proper field mapping
      setUser({
        id: response.user.id,
        email: response.user.email,
        fullName: response.user.fullName,
        phone: response.user.phone,
        role: response.user.role,
        createdAt: response.user.createdAt,
        // Parse fullName into firstName/lastName for account page
        firstName: response.user.fullName?.split(' ')[0] || '',
        lastName: response.user.fullName?.split(' ').slice(1).join(' ') || '',
        joinDate: response.user.createdAt,
        // Initialize empty addresses
        billingAddress: {},
        shippingAddress: {},
      });

      // Show success animation
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showSuccess && (
        <SuccessAnimation
          title="Welcome Back!"
          message="You have been successfully logged in. Redirecting to your account..."
          onComplete={() => navigate('/account')}
          duration={2500}
        />
      )}
      
      <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border sticky top-0 z-40 bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-center">
          <a href="/" className="font-serif text-lg tracking-[0.02em] leading-tight">
            HEZAL THE LABEL
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <div className="max-w-md mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm mb-8 hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          {/* Title */}
          <h1 className="text-2xl lg:text-3xl font-serif mb-2 tracking-wide">Welcome Back</h1>
          <p className="text-muted-foreground text-sm mb-8">Sign in to your account to continue shopping</p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium tracking-wider uppercase mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-border rounded focus:outline-none focus:border-foreground transition-colors text-sm"
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium tracking-wider uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-border rounded focus:outline-none focus:border-foreground transition-colors text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 border border-border rounded" />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="hover:opacity-70 transition-opacity"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-medium tracking-wider uppercase text-sm"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-background text-muted-foreground">OR</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="font-medium hover:opacity-70 transition-opacity"
            >
              Sign Up
            </button>
          </p>

          {/* Additional Links */}
          <div className="mt-8 pt-8 border-t border-border space-y-3 text-xs text-muted-foreground text-center">
            <p>Need Help? <a href="/support" className="hover:text-foreground transition-colors font-medium">Contact Support</a></p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Login;
