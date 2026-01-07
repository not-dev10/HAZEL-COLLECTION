import AnnouncementBar from '@/components/common/AnnouncementBar';
import Header from '@/components/layout/Header';
import HeroCarousel from '@/components/home/HeroCarousel';
import ProductGrid from '@/components/home/ProductGrid';
import EditorialSection from '@/components/home/EditorialSection';
import CollectionBanner from '@/components/home/CollectionBanner';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/common/ScrollToTop';

const Home = () => {
  return (
    <div className="min-h-screen">
      <AnnouncementBar />
      <Header />
      <main>
        <HeroCarousel />
        <ProductGrid />
        <EditorialSection />
        <CollectionBanner />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Home;
