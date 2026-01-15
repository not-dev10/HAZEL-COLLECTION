import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { api, API_BASE_URL } from '@/lib/api';
import SuccessAnimation from '@/components/ui/success-animation';

type SignupStep = 'email' | 'otp' | 'details';

const Signup = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  
  // Step 1: Email
  const [email, setEmail] = useState('');
  
  // Step 2: OTP
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [tempToken, setTempToken] = useState('');
  
  // Step 3: Details
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  
  // Common states
  const [step, setStep] = useState<SignupStep>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // OTP timer countdown
  useEffect(() => {
    if (otpTimer <= 0) return;
    
    const interval = setInterval(() => {
      setOtpTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateEmail = () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email');
      return false;
    }
    return true;
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to send OTP');
        return;
      }

      setStep('otp');
      setOtpTimer(600); // 10 minutes
      setError('');
    } catch (err) {
      console.error('OTP request error:', err);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid or expired OTP');
        return;
      }

      setTempToken(data.tempToken);
      setStep('details');
      setOtp('');
      setError('');
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateDetails = () => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }
    if (name.length < 2) {
      setError('Name must be at least 2 characters');
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
    
    const dob = new Date(dateOfBirth);
    const today = new Date();
    
    if (dob > today) {
      setError('Date of birth cannot be in the future');
      return false;
    }
    
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

    if (!validateDetails()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName: name,
          phone,
          dateOfBirth,
          gender,
          tempToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to create account');
        return;
      }

      // Save token and user info
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setShowSuccess(true);

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to create account. Please try again.');
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
              onClick={() => step === 'email' ? navigate(-1) : setStep(step === 'otp' ? 'email' : 'otp')}
              className="flex items-center gap-2 text-sm mb-8 hover:opacity-70 transition-opacity"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-serif mb-2 tracking-wide">Create Account</h1>
            <p className="text-muted-foreground text-sm mb-8">
              {step === 'email' && 'Verify your email to get started'}
              {step === 'otp' && 'Enter the code sent to your email'}
              {step === 'details' && 'Complete your profile'}
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Step 1: Email */}
            {step === 'email' && (
              <form onSubmit={handleRequestOTP} className="space-y-6">
                <div>
                  <label className="block text-xs font-medium tracking-wider uppercase mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    required
                    className="w-full px-4 py-3 border border-border rounded focus:outline-none focus:border-foreground transition-colors text-sm"
                    placeholder="your@email.com"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white hover:bg-gray-900 py-3 rounded text-sm font-medium tracking-wider uppercase transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Already have an account?{' '}
                  <a href="/login" className="underline hover:opacity-70">
                    Login
                  </a>
                </p>
              </form>
            )}

            {/* Step 2: OTP */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                  Code sent to <strong>{email}</strong>
                </div>

                <div>
                  <label className="block text-xs font-medium tracking-wider uppercase mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setError('');
                    }}
                    maxLength={6}
                    placeholder="000000"
                    className="w-full px-4 py-3 border border-border rounded focus:outline-none focus:border-foreground transition-colors text-sm text-center text-2xl tracking-widest font-mono"
                  />
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Code expires in:</span>
                  <span className={`font-semibold ${otpTimer < 120 ? 'text-red-600' : 'text-foreground'}`}>
                    {formatTime(otpTimer)}
                  </span>
                </div>

                {otpTimer === 0 && (
                  <Button
                    type="button"
                    onClick={handleRequestOTP}
                    className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300 py-3 rounded text-sm font-medium tracking-wider uppercase"
                  >
                    Resend Code
                  </Button>
                )}

                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-black text-white hover:bg-gray-900 py-3 rounded text-sm font-medium tracking-wider uppercase transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Continue'
                  )}
                </Button>
              </form>
            )}

            {/* Step 3: Account Details */}
            {step === 'details' && (
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

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium tracking-wider uppercase mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded focus:outline-none focus:border-foreground transition-colors text-sm"
                    placeholder="+91 9876543210"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-medium tracking-wider uppercase mb-2">
                    Date of Birth
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
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-border rounded focus:outline-none focus:border-foreground transition-colors text-sm"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
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
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
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
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-xs text-muted-foreground">
                    I agree to the{' '}
                    <a href="/terms" className="underline hover:opacity-70">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="underline hover:opacity-70">
                      Privacy Policy
                    </a>
                  </span>
                </label>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white hover:bg-gray-900 py-3 rounded text-sm font-medium tracking-wider uppercase transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Already have an account?{' '}
                  <a href="/login" className="underline hover:opacity-70">
                    Login
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
