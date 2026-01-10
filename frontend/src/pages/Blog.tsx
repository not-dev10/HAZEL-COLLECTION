import { useNavigate } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getBlogImageUrl, CLOUDINARY_IMAGES } from '@/lib/cloudinary';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
  category: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'How to Choose the Perfect Wedding Dress',
    excerpt:
      'A complete guide to finding the wedding dress of your dreams. Learn about styles, fabrics, and how to prepare for your bridal shopping journey.',
    content: `Your wedding dress is one of the most important pieces you'll ever wear. Choosing the right style can be overwhelming with so many options available. Here's a comprehensive guide to help you navigate the process.

    First, consider your body type and what styles flatter your figure. A-line dresses are universally flattering, while ballgowns add drama and volume. Sheath dresses are perfect for a sleek, modern look.

    Think about the season and venue of your wedding. A heavy satin gown might be uncomfortable for a summer beach wedding, while a lighter silk would be perfect.

    Don't forget about the details! Embroidery, beading, and embellishments can transform a simple design into something truly spectacular. Our handcrafted bridal collection features intricate details created by master artisans.`,
    author: 'Hezal the Label Team',
    date: '2025-12-15',
    image: getBlogImageUrl(CLOUDINARY_IMAGES.VELVET_BRIDAL_COLLECTION, 'featured'),
    category: 'Bridal',
  },
  {
    id: 2,
    title: 'Styling Tips: Ready-to-Wear for Every Occasion',
    excerpt:
      'Discover how to style our ready-to-wear collection for different occasions, from casual to formal events.',
    content: `Ready-to-wear pieces are the foundation of any versatile wardrobe. Learn how to mix and match, layer strategically, and accessorize for different occasions.

    For casual elegance, pair a simple kurta with tailored trousers and minimal jewelry. Add a statement clutch for polish.

    For formal events, choose richer colors and fabrics with intricate embroidery. Layer with a matching shawl for sophistication.

    The key to great styling is confidence. Choose pieces that make you feel beautiful and comfortable.`,
    author: 'Style Editor',
    date: '2025-11-28',
    image: getBlogImageUrl(CLOUDINARY_IMAGES.EMBROIDERED_SILK_ENSEMBLE, 'featured'),
    category: 'Style Tips',
  },
  {
    id: 3,
    title: 'Fabric Care and Maintenance Guide',
    excerpt:
      'Learn how to care for your luxury pieces to ensure they last for years. Tips for cleaning, storage, and maintenance.',
    content: `Proper care extends the life of your luxury garments. Here are essential tips for maintaining your Hezal the Label pieces.

    Always check the care label first. For delicate fabrics like silk and satin, dry cleaning is recommended.

    Store garments in a cool, dry place away from direct sunlight. Use padded hangers for heavier pieces to maintain shape.

    For embroidered pieces, avoid excessive folding. Roll them in acid-free tissue paper for storage.

    With proper care, your pieces will remain beautiful for years to come.`,
    author: 'Care Expert',
    date: '2025-11-10',
    image: getBlogImageUrl(CLOUDINARY_IMAGES.FESTIVE_FORMAL_WEAR, 'featured'),
    category: 'Care Guide',
  },
  {
    id: 4,
    title: 'The Art of Unstitched Collections',
    excerpt:
      'Everything you need to know about unstitched fabrics and how to customize your pieces with a tailor.',
    content: `Unstitched collections offer the ultimate in customization. Choose from premium fabrics and work with your tailor to create a piece perfectly fitted to your body.

    The advantage of unstitched pieces is the ability to customize length, sleeve style, and neckline to your preferences.

    When selecting a tailor, choose someone experienced with luxury fabrics. Discuss your vision clearly and review samples of their work.

    Our unstitched collections feature the finest fabrics sourced globally, giving you endless possibilities.`,
    author: 'Design Team',
    date: '2025-10-25',
    image: getBlogImageUrl(CLOUDINARY_IMAGES.COTTON_LAWN_THREE_PIECE, 'featured'),
    category: 'Collections',
  },
];

const Blog = () => {
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>

          {selectedPost ? (
            // Blog Post Detail View
            <div className="max-w-3xl mx-auto">
              <button
                onClick={() => setSelectedPost(null)}
                className="mb-8 text-muted-foreground hover:text-foreground font-medium"
              >
                ← Back to Blog
              </button>

              <article>
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="w-full h-96 object-cover rounded-lg mb-8"
                />

                <div className="mb-6">
                  <span className="text-sm font-medium text-primary">
                    {selectedPost.category}
                  </span>
                  <h1 className="text-4xl font-serif my-4">{selectedPost.title}</h1>

                  <div className="flex items-center gap-6 text-muted-foreground text-sm">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      {selectedPost.author}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      {new Date(selectedPost.date).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  {selectedPost.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-muted-foreground leading-relaxed mb-6">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            </div>
          ) : (
            // Blog List View
            <>
              <div className="max-w-4xl mx-auto mb-12">
                <h1 className="text-4xl font-serif mb-4">Style Tips & Inspiration</h1>
                <p className="text-muted-foreground text-lg">
                  Explore our collection of articles on fashion, styling, care tips, and more.
                </p>
              </div>

              <div className="max-w-4xl mx-auto space-y-8">
                {blogPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-card border border-border rounded-lg overflow-hidden hover:border-foreground/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-56 md:h-full object-cover"
                      />

                      <div className="md:col-span-2 p-6 flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-medium text-primary uppercase tracking-wide">
                            {post.category}
                          </span>
                          <h2 className="text-2xl font-serif my-3">{post.title}</h2>
                          <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User size={16} />
                            {post.author}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            {new Date(post.date).toLocaleDateString('en-GB', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Blog;
