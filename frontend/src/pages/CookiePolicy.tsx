import AnnouncementBar from '@/components/common/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/common/ScrollToTop';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen">
      <AnnouncementBar />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-serif mb-8">Cookie Policy</h1>
        
        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <p className="text-foreground">
            <strong>Last Updated:</strong> January 2024
          </p>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and 
              understanding how you use our site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Types of Cookies We Use</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">1. Essential Cookies</h3>
                <p>
                  These cookies are necessary for the website to function properly. They enable core 
                  functionality such as security, network management, and accessibility. You cannot 
                  opt-out of these cookies.
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Session management</li>
                  <li>Shopping cart functionality</li>
                  <li>Authentication and security</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">2. Analytics Cookies</h3>
                <p>
                  These cookies help us understand how visitors interact with our website by collecting 
                  and reporting information anonymously.
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Google Analytics</li>
                  <li>Page view tracking</li>
                  <li>User behavior analysis</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">3. Marketing Cookies</h3>
                <p>
                  These cookies are used to deliver advertisements more relevant to you and your interests. 
                  They also help measure the effectiveness of advertising campaigns.
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Facebook Pixel</li>
                  <li>Google Ads</li>
                  <li>Retargeting campaigns</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">4. Preference Cookies</h3>
                <p>
                  These cookies enable the website to remember information that changes the way the 
                  website behaves or looks, such as your preferred language or region.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Managing Your Cookie Preferences</h2>
            <p>
              You can control and manage cookies in various ways. Please note that removing or blocking 
              cookies can impact your user experience and parts of our website may no longer be fully accessible.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use our cookie consent banner to customize your preferences</li>
              <li>Adjust your browser settings to refuse cookies</li>
              <li>Delete cookies that have already been set</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Third-Party Cookies</h2>
            <p>
              Some cookies are placed by third-party services that appear on our pages. We do not control 
              the use of these cookies and cannot access them. These cookies are likely to be analytical, 
              performance, or targeting cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Cookie Duration</h2>
            <p>
              Cookies can be either "session" or "persistent" cookies:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Session cookies:</strong> Temporary cookies that expire when you close your browser</li>
              <li><strong>Persistent cookies:</strong> Remain on your device for a set period or until you delete them</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices or 
              for other operational, legal, or regulatory reasons. Please check this page periodically 
              for updates.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Contact Us</h2>
            <p>
              If you have any questions about our use of cookies, please contact us at:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> privacy@hezalcouture.com<br />
              <strong>Website:</strong> www.hezalcouture.com
            </p>
          </section>
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default CookiePolicy;
