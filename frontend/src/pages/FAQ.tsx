import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: 'Orders',
    question: 'How do I place an order?',
    answer:
      'Browse our collection, add items to your cart, proceed to checkout, enter your delivery details, and choose your payment method. Your order will be confirmed via email.',
  },
  {
    category: 'Orders',
    question: 'Can I modify or cancel my order?',
    answer:
      'Orders can be modified or cancelled within 24 hours of placement. Contact our customer service team at support@hezalcouture.com for assistance.',
  },
  {
    category: 'Orders',
    question: 'What payment methods do you accept?',
    answer:
      'We accept Credit Cards, Debit Cards, PayPal, and Apple Pay. All payments are securely processed.',
  },
  {
    category: 'Shipping',
    question: 'What are your shipping options?',
    answer:
      'We offer Standard Shipping (5-7 business days) and Express Shipping (2-3 business days). Free shipping on orders over £100. We ship worldwide.',
  },
  {
    category: 'Shipping',
    question: 'How can I track my order?',
    answer:
      'Once your order is dispatched, you will receive a tracking number via email. You can use this to track your package in real-time.',
  },
  {
    category: 'Shipping',
    question: 'Do you ship internationally?',
    answer:
      'Yes, we ship to over 50 countries. International shipping rates and delivery times vary by location. Visit our shipping page for detailed information.',
  },
  {
    category: 'Returns',
    question: 'What is your return policy?',
    answer:
      'Items can be returned within 30 days of purchase in original condition with tags attached. Refunds are processed within 7-10 business days after inspection.',
  },
  {
    category: 'Returns',
    question: 'How do I initiate a return?',
    answer:
      'Log into your account, go to Order History, select the item to return, and follow the return instructions. Print the prepaid shipping label and drop off at any courier.',
  },
  {
    category: 'Returns',
    question: 'Do you offer exchanges?',
    answer:
      'Yes, exchanges are available for different sizes or colors. There are no additional charges for exchanges if initiated within 30 days.',
  },
  {
    category: 'Products',
    question: 'How do I know my size?',
    answer:
      'Check our Size Guide on each product page for detailed measurements. You can filter by size and compare with your regular clothing measurements.',
  },
  {
    category: 'Products',
    question: 'What is the difference between unstitched and ready-to-wear?',
    answer:
      'Ready-to-wear pieces are finished and ready to wear immediately. Unstitched pieces come as fabric and require tailoring to your measurements.',
  },
  {
    category: 'Products',
    question: 'Are products made from sustainable materials?',
    answer:
      'We are committed to sustainability. Many of our pieces use eco-friendly fabrics. Check individual product descriptions for material information.',
  },
  {
    category: 'Account',
    question: 'How do I create an account?',
    answer:
      'Click "Account" in the header, then "Sign Up". Enter your email and create a password. You can also sign up during checkout.',
  },
  {
    category: 'Account',
    question: 'How do I reset my password?',
    answer:
      'On the login page, click "Forgot Password". Enter your email and follow the instructions sent to your inbox to reset your password.',
  },
  {
    category: 'Account',
    question: 'Can I save multiple addresses?',
    answer:
      'Yes, you can save multiple billing and shipping addresses in your account for faster checkout on future orders.',
  },
];

const FAQ = () => {
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(faqData.map((item) => item.category)))];

  const filteredFAQ =
    selectedCategory === 'All'
      ? faqData
      : faqData.filter((item) => item.category === selectedCategory);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <button
            onClick={() => navigate(-1)}
            className="mb-8 text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>

          <div className="max-w-3xl mx-auto mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-2 sm:mb-4">Frequently Asked Questions</h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
              Find answers to common questions about orders, shipping, returns, and more.
            </p>
          </div>

          {/* Category Filter */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* FAQ Items */}
          <div className="max-w-3xl mx-auto space-y-4">
            {filteredFAQ.map((item, index) => (
              <div
                key={index}
                className="border border-border rounded-lg overflow-hidden bg-card hover:border-foreground/50 transition-colors"
              >
                <button
                  onClick={() =>
                    setExpandedIndex(expandedIndex === index ? null : index)
                  }
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="text-left">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                      {item.category}
                    </span>
                    <h3 className="font-medium text-foreground mt-1">
                      {item.question}
                    </h3>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`flex-shrink-0 transition-transform ml-4 ${
                      expandedIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedIndex === index && (
                  <div className="px-6 py-4 border-t border-border bg-muted/20">
                    <p className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still Have Questions */}
          <div className="max-w-3xl mx-auto mt-16 text-center bg-muted/50 rounded-lg p-8">
            <h2 className="text-2xl font-serif mb-2">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <Button onClick={() => navigate('/about')}>Contact Us</Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default FAQ;
