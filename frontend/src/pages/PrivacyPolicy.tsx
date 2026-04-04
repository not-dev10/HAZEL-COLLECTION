import AnnouncementBar from '@/components/common/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/common/ScrollToTop';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen">
      <AnnouncementBar />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-serif mb-8">Privacy Policy</h1>
        
        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <p className="text-foreground">
            <strong>Last Updated:</strong> January 2024
          </p>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Introduction</h2>
            <p>
              At Hezal Couture, we are committed to protecting your privacy and ensuring the security 
              of your personal information. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you visit our website or make a purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Information We Collect</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Personal Information</h3>
                <p>When you place an order or create an account, we collect:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information (processed securely through payment providers)</li>
                  <li>Order history and preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Automatically Collected Information</h3>
                <p>When you visit our website, we automatically collect:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>IP address and browser type</li>
                  <li>Device information and operating system</li>
                  <li>Pages visited and time spent on site</li>
                  <li>Referring website addresses</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders and account</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Improve our website and customer service</li>
              <li>Prevent fraud and enhance security</li>
              <li>Comply with legal obligations</li>
              <li>Analyze website usage and trends</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Information Sharing</h2>
            <p>We do not sell your personal information. We may share your information with:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Service Providers:</strong> Payment processors, shipping companies, email service providers</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. However, 
              no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Object to processing of your information</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your experience. You can 
              control cookie preferences through our cookie consent banner or your browser settings. 
              For more information, please see our <a href="/cookie-policy" className="underline">Cookie Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the 
              privacy practices of these websites. We encourage you to read their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Children's Privacy</h2>
            <p>
              Our website is not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country 
              of residence. We ensure appropriate safeguards are in place for such transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material 
              changes by posting the new policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> privacy@hezalcouture.com<br />
              <strong>Address:</strong> Hezal Couture, [Your Address]<br />
              <strong>Phone:</strong> [Your Phone Number]
            </p>
          </section>

          <section className="border-t border-border pt-6 mt-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">GDPR Compliance (EU Customers)</h2>
            <p>
              If you are a resident of the European Economic Area (EEA), you have additional rights under 
              the General Data Protection Regulation (GDPR), including the right to lodge a complaint with 
              a supervisory authority.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">CCPA Compliance (California Residents)</h2>
            <p>
              California residents have specific rights under the California Consumer Privacy Act (CCPA), 
              including the right to know what personal information is collected and the right to opt-out 
              of the sale of personal information.
            </p>
          </section>
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default PrivacyPolicy;
