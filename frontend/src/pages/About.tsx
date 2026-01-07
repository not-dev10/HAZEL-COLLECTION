import { useNavigate } from 'react-router-dom';
import { Award, Heart, Globe, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const About = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>

          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl font-serif mb-6">Hezal Couture</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Luxury Fashion with Traditional Artistry
            </p>
            <div className="h-1 w-24 bg-primary mx-auto"></div>
          </div>

          {/* Mission Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-serif mb-6">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Hezal Couture was founded with a vision to celebrate luxury fashion that honors
              traditional craftsmanship while embracing contemporary elegance. Each piece in our
              collection is a testament to meticulous attention to detail and the finest quality
              materials sourced from around the world.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We believe that true luxury lies not just in the finished product, but in the
              journey of creation—from the selection of premium fabrics to the skilled hands that
              bring each design to life. Our team of master craftspeople combines decades of
              experience with innovative design techniques to create pieces that transcend trends.
            </p>
          </div>

          {/* Values Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-primary" size={32} />
              </div>
              <h3 className="font-semibold mb-2">Quality</h3>
              <p className="text-sm text-muted-foreground">
                Premium materials and impeccable craftsmanship in every piece
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-primary" size={32} />
              </div>
              <h3 className="font-semibold mb-2">Passion</h3>
              <p className="text-sm text-muted-foreground">
                Dedicated to creating garments that make you feel confident and beautiful
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="text-primary" size={32} />
              </div>
              <h3 className="font-semibold mb-2">Sustainability</h3>
              <p className="text-sm text-muted-foreground">
                Committed to ethical sourcing and environmentally conscious practices
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-primary" size={32} />
              </div>
              <h3 className="font-semibold mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">
                Supporting artisans and celebrating diverse cultures through fashion
              </p>
            </div>
          </div>

          {/* Collections Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-serif mb-6">Our Collections</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Bridal Collection</h3>
                <p className="text-muted-foreground">
                  Our signature bridal pieces are designed for the most important day of your
                  life. Each gown is a masterpiece, featuring intricate embroidery, premium
                  fabrics, and timeless silhouettes.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Ready-to-Wear</h3>
                <p className="text-muted-foreground">
                  Versatile and elegant pieces for everyday luxury. From casual sophistication
                  to formal elegance, our ready-to-wear collection offers something for every
                  occasion.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Unstitched Collections</h3>
                <p className="text-muted-foreground">
                  For those who love customization, our unstitched collections provide premium
                  fabrics and designs that can be tailored to your exact measurements and
                  preferences.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Handcrafted Pieces</h3>
                <p className="text-muted-foreground">
                  Limited edition pieces created using traditional artisan techniques. Each
                  handcrafted item tells a story of skill, heritage, and artistic excellence.
                </p>
              </div>
            </div>
          </div>

          {/* Craftsmanship Section */}
          <div className="bg-muted/50 rounded-lg p-8 mb-16">
            <h2 className="text-3xl font-serif mb-6 text-center">Our Craftsmanship</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">25+</div>
                <p className="text-muted-foreground">
                  Years of expertise in luxury fashion design and production
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <p className="text-muted-foreground">
                  Hand-finished details on select premium pieces
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">Global</div>
                <p className="text-muted-foreground">
                  Materials sourced from the finest suppliers worldwide
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-serif mb-6">Experience the Hezal Difference</h2>
            <p className="text-muted-foreground mb-8">
              Discover our curated collections and find the perfect piece for your wardrobe.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/')}>Shop Now</Button>
              <Button variant="outline" onClick={() => navigate('/faq')}>
                Learn More
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default About;
