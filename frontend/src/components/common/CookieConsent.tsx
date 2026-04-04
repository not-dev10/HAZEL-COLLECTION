import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already accepted/rejected cookies
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', 'all');
    setShowBanner(false);
    // Enable all tracking/analytics here
    enableAnalytics();
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('cookieConsent', 'essential');
    setShowBanner(false);
    // Only enable essential cookies
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowBanner(false);
  };

  const enableAnalytics = () => {
    // Enable Google Analytics, Facebook Pixel, etc.
    console.log('Analytics enabled');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md bg-background border border-border rounded-lg shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <Cookie size={24} className="text-primary flex-shrink-0" />
            <h3 className="font-serif text-lg">Cookie Preferences</h3>
          </div>
          <button
            onClick={handleReject}
            className="p-1 hover:bg-secondary rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
            By clicking "Accept All", you consent to our use of cookies.
          </p>

          {showDetails && (
            <div className="mt-4 space-y-3 text-sm">
              <div className="p-3 bg-secondary rounded">
                <h4 className="font-semibold mb-1">Essential Cookies</h4>
                <p className="text-xs text-muted-foreground">
                  Required for the website to function properly. These cannot be disabled.
                </p>
              </div>
              <div className="p-3 bg-secondary rounded">
                <h4 className="font-semibold mb-1">Analytics Cookies</h4>
                <p className="text-xs text-muted-foreground">
                  Help us understand how visitors interact with our website.
                </p>
              </div>
              <div className="p-3 bg-secondary rounded">
                <h4 className="font-semibold mb-1">Marketing Cookies</h4>
                <p className="text-xs text-muted-foreground">
                  Used to deliver personalized advertisements relevant to you.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={handleAcceptAll}
              className="flex-1 bg-primary text-primary-foreground py-2.5 px-4 rounded text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Accept All
            </button>
            <button
              onClick={handleAcceptEssential}
              className="flex-1 border border-border py-2.5 px-4 rounded text-sm font-medium hover:bg-secondary transition-colors"
            >
              Essential Only
            </button>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors underline"
          >
            {showDetails ? 'Hide Details' : 'Customize Preferences'}
          </button>
          <p className="text-xs text-muted-foreground text-center pt-2">
            Read our{' '}
            <a href="/privacy-policy" className="underline hover:text-foreground">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/cookie-policy" className="underline hover:text-foreground">
              Cookie Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
