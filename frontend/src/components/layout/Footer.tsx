import { Facebook, Instagram, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    setEmail('');
  };

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Information */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 font-medium">
              Information
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/about" className="footer-link">
                  About Us
                </a>
              </li>
              <li>
                <a href="/blog" className="footer-link">
                  Blog & Tips
                </a>
              </li>
              <li>
                <a href="/size-guide" className="footer-link">
                  Size Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 font-medium">
              Customer Care
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/faq" className="footer-link">
                  FAQs
                </a>
              </li>
              <li>
                <a href="/search" className="footer-link">
                  Search Products
                </a>
              </li>
              <li>
                <a href="/contact" className="footer-link">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/shipping" className="footer-link">
                  Shipping
                </a>
              </li>
              <li>
                <a href="/exchange-refund" className="footer-link">
                  Exchange & Refund
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="footer-link">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="footer-link">
                  Terms and Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 font-medium">
              Follow Us
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link flex items-center gap-2"
                >
                  <Facebook size={16} strokeWidth={1.5} />
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link flex items-center gap-2"
                >
                  <Instagram size={16} strokeWidth={1.5} />
                  Instagram
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 font-medium">
              Signup For Our Newsletter
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form onSubmit={handleSubmit} className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 bg-transparent border-b border-muted-foreground/30 text-sm py-2 px-0 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary-foreground transition-colors"
                required
              />
              <button
                type="submit"
                className="p-2 hover:opacity-70 transition-opacity"
                aria-label="Subscribe"
              >
                <ArrowRight size={20} strokeWidth={1.5} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-muted-foreground/20">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <p className="text-xs text-muted-foreground text-center">
            © 2026 Hezal the Label Intl, Developed by Shopistan – Powered by XStak
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
