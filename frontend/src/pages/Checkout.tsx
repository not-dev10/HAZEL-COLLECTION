import { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Billing Address
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;

  // Delivery Address
  deliveryStreet: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  deliveryCountry: string;
  sameAsDelivery: boolean;

  // Payment Method
  paymentMethod: string;
}

interface FormErrors {
  [key: string]: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, clearCart, total } = useCart();
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    billingStreet: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: 'United States',
    deliveryStreet: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryZip: '',
    deliveryCountry: 'United States',
    sameAsDelivery: false,
    paymentMethod: 'credit-card',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validateZip = (zip: string): boolean => {
    return zip.length >= 5;
  };

  const validateStep = (step: 'shipping' | 'payment' | 'review'): boolean => {
    const newErrors: FormErrors = {};

    if (step === 'shipping') {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
      }

      // Billing Address
      if (!formData.billingStreet.trim()) {
        newErrors.billingStreet = 'Street address is required';
      }
      if (!formData.billingCity.trim()) {
        newErrors.billingCity = 'City is required';
      }
      if (!formData.billingState.trim()) {
        newErrors.billingState = 'State is required';
      }
      if (!formData.billingZip.trim()) {
        newErrors.billingZip = 'ZIP code is required';
      } else if (!validateZip(formData.billingZip)) {
        newErrors.billingZip = 'Please enter a valid ZIP code';
      }

      // Delivery Address
      if (!formData.sameAsDelivery) {
        if (!formData.deliveryStreet.trim()) {
          newErrors.deliveryStreet = 'Street address is required';
        }
        if (!formData.deliveryCity.trim()) {
          newErrors.deliveryCity = 'City is required';
        }
        if (!formData.deliveryState.trim()) {
          newErrors.deliveryState = 'State is required';
        }
        if (!formData.deliveryZip.trim()) {
          newErrors.deliveryZip = 'ZIP code is required';
        } else if (!validateZip(formData.deliveryZip)) {
          newErrors.deliveryZip = 'Please enter a valid ZIP code';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStepChange = (step: 'shipping' | 'payment' | 'review') => {
    if (step === 'shipping' || (currentStep === 'shipping' && validateStep('shipping'))) {
      setCurrentStep(step);
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateStep('shipping')) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setOrderPlaced(true);
      clearCart();
      setIsSubmitting(false);
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }, 2000);
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col items-center justify-center py-20">
              <h1 className="text-3xl font-serif mb-4">Your cart is empty</h1>
              <p className="text-muted-foreground mb-8">
                Please add items to your cart before proceeding to checkout
              </p>
              <Button onClick={() => navigate('/')} className="px-8">
                Continue Shopping
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (orderPlaced) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col items-center justify-center py-20">
              <CheckCircle size={80} className="text-green-600 mb-4" />
              <h1 className="text-4xl font-serif mb-4">Order Confirmed!</h1>
              <p className="text-muted-foreground mb-8 text-center max-w-md">
                Thank you for your purchase. A confirmation email has been sent to{' '}
                <span className="font-semibold text-foreground">{formData.email}</span>
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                You will be redirected to the home page in a few seconds...
              </p>
              <Button onClick={() => navigate('/')} className="px-8">
                Back to Home
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const subtotal = total;
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const grandTotal = subtotal + shipping + tax;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft size={20} />
            Back to Cart
          </button>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-6 sm:mb-8">Checkout</h1>

          {/* Progress Steps */}
          <div className="mb-6 sm:mb-8 flex gap-2 sm:gap-4 max-w-2xl overflow-x-auto pb-2">
            {(['shipping', 'payment', 'review'] as const).map((step, index) => (
              <div key={step} className="flex items-center gap-2 sm:gap-4 flex-1 min-w-fit">
                <button
                  onClick={() => handleStepChange(step)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center flex-shrink-0 ${
                    currentStep === step
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </button>
                <span className="text-xs sm:text-sm font-medium capitalize hidden sm:inline">
                  {step}
                </span>
                {index < 2 && (
                  <div
                    className="h-1 flex-1 bg-muted"
                    style={{
                      backgroundColor:
                        currentStep === 'shipping' ? '#e5e5e5' : '#000',
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-lg p-8">
                {currentStep === 'shipping' && (
                  <div className="space-y-8">
                    {/* Personal Information */}
                    <div>
                      <h2 className="text-2xl font-serif mb-6">
                        Personal Information
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="John"
                            className={errors.firstName ? 'border-destructive' : ''}
                          />
                          {errors.firstName && (
                            <p className="text-sm text-destructive mt-1">
                              {errors.firstName}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Doe"
                            className={errors.lastName ? 'border-destructive' : ''}
                          />
                          {errors.lastName && (
                            <p className="text-sm text-destructive mt-1">
                              {errors.lastName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john@example.com"
                            className={errors.email ? 'border-destructive' : ''}
                          />
                          {errors.email && (
                            <p className="text-sm text-destructive mt-1">
                              {errors.email}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+1 (555) 123-4567"
                            className={errors.phone ? 'border-destructive' : ''}
                          />
                          {errors.phone && (
                            <p className="text-sm text-destructive mt-1">
                              {errors.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Billing Address */}
                    <div>
                      <h2 className="text-2xl font-serif mb-6">
                        Billing Address
                      </h2>
                      <div>
                        <Label htmlFor="billingStreet">Street Address *</Label>
                        <Input
                          id="billingStreet"
                          name="billingStreet"
                          value={formData.billingStreet}
                          onChange={handleInputChange}
                          placeholder="123 Main Street"
                          className={
                            errors.billingStreet ? 'border-destructive' : ''
                          }
                        />
                        {errors.billingStreet && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.billingStreet}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label htmlFor="billingCity">City *</Label>
                          <Input
                            id="billingCity"
                            name="billingCity"
                            value={formData.billingCity}
                            onChange={handleInputChange}
                            placeholder="New York"
                            className={
                              errors.billingCity ? 'border-destructive' : ''
                            }
                          />
                          {errors.billingCity && (
                            <p className="text-sm text-destructive mt-1">
                              {errors.billingCity}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="billingState">State/Province *</Label>
                          <Input
                            id="billingState"
                            name="billingState"
                            value={formData.billingState}
                            onChange={handleInputChange}
                            placeholder="NY"
                            className={
                              errors.billingState ? 'border-destructive' : ''
                            }
                          />
                          {errors.billingState && (
                            <p className="text-sm text-destructive mt-1">
                              {errors.billingState}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label htmlFor="billingZip">ZIP/Postal Code *</Label>
                          <Input
                            id="billingZip"
                            name="billingZip"
                            value={formData.billingZip}
                            onChange={handleInputChange}
                            placeholder="10001"
                            className={
                              errors.billingZip ? 'border-destructive' : ''
                            }
                          />
                          {errors.billingZip && (
                            <p className="text-sm text-destructive mt-1">
                              {errors.billingZip}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="billingCountry">Country *</Label>
                          <Select
                            value={formData.billingCountry}
                            onValueChange={(value) =>
                              handleSelectChange('billingCountry', value)
                            }
                          >
                            <SelectTrigger id="billingCountry">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="United States">
                                United States
                              </SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="Mexico">Mexico</SelectItem>
                              <SelectItem value="United Kingdom">
                                United Kingdom
                              </SelectItem>
                              <SelectItem value="Australia">Australia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <input
                          type="checkbox"
                          id="sameAsDelivery"
                          name="sameAsDelivery"
                          checked={formData.sameAsDelivery}
                          onChange={handleInputChange}
                          className="w-4 h-4 rounded border-border"
                        />
                        <Label
                          htmlFor="sameAsDelivery"
                          className="cursor-pointer font-normal"
                        >
                          Delivery address is same as billing address
                        </Label>
                      </div>

                      {!formData.sameAsDelivery && (
                        <div>
                          <h2 className="text-2xl font-serif mb-6">
                            Delivery Address
                          </h2>
                          <div>
                            <Label htmlFor="deliveryStreet">
                              Street Address *
                            </Label>
                            <Input
                              id="deliveryStreet"
                              name="deliveryStreet"
                              value={formData.deliveryStreet}
                              onChange={handleInputChange}
                              placeholder="123 Main Street"
                              className={
                                errors.deliveryStreet
                                  ? 'border-destructive'
                                  : ''
                              }
                            />
                            {errors.deliveryStreet && (
                              <p className="text-sm text-destructive mt-1">
                                {errors.deliveryStreet}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <Label htmlFor="deliveryCity">City *</Label>
                              <Input
                                id="deliveryCity"
                                name="deliveryCity"
                                value={formData.deliveryCity}
                                onChange={handleInputChange}
                                placeholder="New York"
                                className={
                                  errors.deliveryCity
                                    ? 'border-destructive'
                                    : ''
                                }
                              />
                              {errors.deliveryCity && (
                                <p className="text-sm text-destructive mt-1">
                                  {errors.deliveryCity}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="deliveryState">
                                State/Province *
                              </Label>
                              <Input
                                id="deliveryState"
                                name="deliveryState"
                                value={formData.deliveryState}
                                onChange={handleInputChange}
                                placeholder="NY"
                                className={
                                  errors.deliveryState
                                    ? 'border-destructive'
                                    : ''
                                }
                              />
                              {errors.deliveryState && (
                                <p className="text-sm text-destructive mt-1">
                                  {errors.deliveryState}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <Label htmlFor="deliveryZip">
                                ZIP/Postal Code *
                              </Label>
                              <Input
                                id="deliveryZip"
                                name="deliveryZip"
                                value={formData.deliveryZip}
                                onChange={handleInputChange}
                                placeholder="10001"
                                className={
                                  errors.deliveryZip
                                    ? 'border-destructive'
                                    : ''
                                }
                              />
                              {errors.deliveryZip && (
                                <p className="text-sm text-destructive mt-1">
                                  {errors.deliveryZip}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="deliveryCountry">Country *</Label>
                              <Select
                                value={formData.deliveryCountry}
                                onValueChange={(value) =>
                                  handleSelectChange('deliveryCountry', value)
                                }
                              >
                                <SelectTrigger id="deliveryCountry">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="United States">
                                    United States
                                  </SelectItem>
                                  <SelectItem value="Canada">Canada</SelectItem>
                                  <SelectItem value="Mexico">Mexico</SelectItem>
                                  <SelectItem value="United Kingdom">
                                    United Kingdom
                                  </SelectItem>
                                  <SelectItem value="Australia">
                                    Australia
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => navigate('/cart')}
                        className="flex-1"
                      >
                        Back to Cart
                      </Button>
                      <Button
                        onClick={() => {
                          if (validateStep('shipping')) {
                            handleStepChange('payment');
                          }
                        }}
                        className="flex-1"
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 'payment' && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-serif mb-6">Payment Method</h2>

                    <div className="space-y-4">
                      <div className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                        <input
                          type="radio"
                          id="credit-card"
                          name="paymentMethod"
                          value="credit-card"
                          checked={formData.paymentMethod === 'credit-card'}
                          onChange={handleInputChange}
                          className="w-4 h-4"
                        />
                        <Label
                          htmlFor="credit-card"
                          className="ml-3 font-medium cursor-pointer flex-1"
                        >
                          Credit Card
                        </Label>
                      </div>

                      <div className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                        <input
                          type="radio"
                          id="debit-card"
                          name="paymentMethod"
                          value="debit-card"
                          checked={formData.paymentMethod === 'debit-card'}
                          onChange={handleInputChange}
                          className="w-4 h-4"
                        />
                        <Label
                          htmlFor="debit-card"
                          className="ml-3 font-medium cursor-pointer flex-1"
                        >
                          Debit Card
                        </Label>
                      </div>

                      <div className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                        <input
                          type="radio"
                          id="paypal"
                          name="paymentMethod"
                          value="paypal"
                          checked={formData.paymentMethod === 'paypal'}
                          onChange={handleInputChange}
                          className="w-4 h-4"
                        />
                        <Label
                          htmlFor="paypal"
                          className="ml-3 font-medium cursor-pointer flex-1"
                        >
                          PayPal
                        </Label>
                      </div>

                      <div className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                        <input
                          type="radio"
                          id="apple-pay"
                          name="paymentMethod"
                          value="apple-pay"
                          checked={formData.paymentMethod === 'apple-pay'}
                          onChange={handleInputChange}
                          className="w-4 h-4"
                        />
                        <Label
                          htmlFor="apple-pay"
                          className="ml-3 font-medium cursor-pointer flex-1"
                        >
                          Apple Pay
                        </Label>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-800">
                      <p className="font-semibold mb-2">Note</p>
                      <p>
                        Payment processing is handled securely. We accept all
                        major credit cards and digital payment methods.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => handleStepChange('shipping')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={() => handleStepChange('review')}
                        className="flex-1"
                      >
                        Review Order
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 'review' && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-serif mb-6">Order Review</h2>

                    {/* Personal Info Review */}
                    <div className="border border-border rounded p-4">
                      <h3 className="font-semibold mb-3">Personal Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <p>
                          <span className="text-muted-foreground">Name:</span>{' '}
                          {formData.firstName} {formData.lastName}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Email:</span>{' '}
                          {formData.email}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Phone:</span>{' '}
                          {formData.phone}
                        </p>
                      </div>
                    </div>

                    {/* Billing Address Review */}
                    <div className="border border-border rounded p-4">
                      <h3 className="font-semibold mb-3">Billing Address</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{formData.billingStreet}</p>
                        <p>
                          {formData.billingCity}, {formData.billingState}{' '}
                          {formData.billingZip}
                        </p>
                        <p>{formData.billingCountry}</p>
                      </div>
                    </div>

                    {/* Delivery Address Review */}
                    {!formData.sameAsDelivery && (
                      <div className="border border-border rounded p-4">
                        <h3 className="font-semibold mb-3">Delivery Address</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{formData.deliveryStreet}</p>
                          <p>
                            {formData.deliveryCity}, {formData.deliveryState}{' '}
                            {formData.deliveryZip}
                          </p>
                          <p>{formData.deliveryCountry}</p>
                        </div>
                      </div>
                    )}

                    {/* Payment Method Review */}
                    <div className="border border-border rounded p-4">
                      <h3 className="font-semibold mb-3">Payment Method</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {formData.paymentMethod.replace('-', ' ')}
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => handleStepChange('payment')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmitOrder}
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting ? 'Processing...' : 'Place Order'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6 sticky top-24 max-h-[70vh] overflow-y-auto lg:max-h-none lg:overflow-visible">
                <h2 className="text-xl font-serif mb-6">Order Summary</h2>

                {/* Order Items */}
                <div className="mb-6 max-h-48 sm:max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm mb-3 pb-3 border-b border-border last:border-b-0"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        £{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 border-t border-border pt-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">£{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `£${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-medium">£{tax.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-border pt-3 flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>£{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Checkout;
