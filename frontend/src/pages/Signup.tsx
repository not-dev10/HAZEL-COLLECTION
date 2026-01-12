import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { api } from '@/lib/api';
import SuccessAnimation from '@/components/ui/success-animation';

const Signup = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = () => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }
    if (name.length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError('Password must contain uppercase, lowercase, and number');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!dateOfBirth) {
      setError('Date of birth is required');
      return false;
    }
    
    // Validate date of birth
    const dob = new Date(dateOfBirth);
    const today = new Date();
    
    if (dob > today) {
      setError('Date of birth cannot be in the future');
      return false;
    }
    
    // Calculate age
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();
    
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
    
    if (actualAge < 13) {
      setError('You must be at least 13 years old to create an account');
      return false;
    }
    
    if (!gender) {
      setError('Gender is required');
      return false;
    }
    if (!agreeTerms) {
      setError('Please agree to terms and conditions');
      return false;
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.auth.signup({
        email,
        password,
        fullName: name,
        dateOfBirth,
        gender,
      });

      // Store token and user in sessionStorage
      sessionStorage.setItem('authToken', response.token);
      
      // Update user context with proper field mapping
      setUser({
        id: response.user.id,
        email: response.user.email,
        fullName: response.user.fullName,
        phone: response.user.phone,
        dateOfBirth: response.user.dateOfBirth,
        gender: response.user.gender,
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
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showSuccess && (
        <SuccessAnimation
          title="Account Created!"
          message="Welcome to Hezal the Label! Your account has been successfully created. Redirecting to your account..."
          onComplete={() => navigate('/account')}
          duration={3000}
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
          <h1 className="text-2xl lg:text-3xl font-serif mb-2 tracking-wide">Create Account</h1>
          <p className="text-muted-foreground text-sm mb-8">Join us to discover our exclusive collections</p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium tracking-wider uppercase mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-border rounded focus:outline-none focus:border-foreground transition-colors text-sm"
                placeholder="Your name"
              />
            </div>

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
              <p className="text-xs text-muted-foreground mt-1">Min 8 characters, 1 uppercase, 1 lowercase, 1 number</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium tracking-wider uppercase mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-border rounded focus:outline-none focus:border-foreground transition-colors text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-medium tracking-wider uppercase mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                className="w-full px-4 py-3 border border-border rounded focus:outline-none focus:border-foreground transition-colors text-sm"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-medium tracking-wider uppercase mb-2">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="w-full px-4 py-3 border border-border rounded focus:outline-none focus:border-foreground transition-colors text-sm bg-background"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Terms & Conditions */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 border border-border rounded mt-1 flex-shrink-0"
              />
              <span className="text-xs text-muted-foreground">
                I agree to the{' '}
                <a href="#" className="hover:text-foreground transition-colors font-medium">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="#" className="hover:text-foreground transition-colors font-medium">
                  Privacy Policy
                </a>
              </span>
            </label>

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-medium tracking-wider uppercase text-sm"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
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

          {/* Login Link */}
          <p className="text-center text-sm">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium hover:opacity-70 transition-opacity"
            >
              Sign In
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

export default Signup;
