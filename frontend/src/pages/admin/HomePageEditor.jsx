import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Loader2, ChevronUp, ChevronDown, Trash2, Upload, Plus } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

export default function HomePageEditor() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingSlideId, setUploadingSlideId] = useState(null);
  const [message, setMessage] = useState(null);
  const [homePageData, setHomePageData] = useState({
    carousel: { slides: [] },
    newArrivals: {},
    bridalSection: {},
    collectionBanner: { collections: [] }
  });

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Fetch home page content on mount
  useEffect(() => {
    fetchHomePageContent();
  }, []);

  const fetchHomePageContent = async () => {
    try {
      setLoading(true);
      console.log('📖 Loading home page content...');
      const response = await fetch(`${API_BASE_URL}/api/home-page`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      
      console.log('📖 Fetched home page data:', {
        success: data.success,
        carouselSlides: data.data?.carousel?.slides?.length,
        newArrivals: data.data?.newArrivals?.visible,
        bridalImageUrl: data.data?.bridalSection?.imageUrl?.substring(0, 50),
        collectionsCount: data.data?.collectionBanner?.collections?.length
      });

      if (data.success && data.data) {
        setHomePageData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch home page content:', error);
      showMessage('Failed to load home page content', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ============ IMAGE UPLOAD HANDLER ============
  const handleImageUpload = async (e, slideId, section = 'carousel', collectionId = null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadingSlideId(slideId);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', section === 'carousel' ? 'hero' : section === 'bridal' ? 'detail' : 'collection');

      // Log FormData contents
      console.log('📤 Uploading file:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        folder: section === 'carousel' ? 'hero' : section === 'bridal' ? 'detail' : 'collection'
      });

      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });

      const data = await response.json();
      console.log('📥 Upload response:', data);

      if (data.success && data.url) {
        // Update the slide/section with the image URL
        if (section === 'carousel') {
          handleCarouselChange(slideId, 'imageUrl', data.url);
        } else if (section === 'bridal') {
          setHomePageData(prev => ({
            ...prev,
            bridalSection: { ...prev.bridalSection, imageUrl: data.url }
          }));
        } else if (section === 'collection') {
          handleCollectionChange(collectionId, 'imageUrl', data.url);
        }
        showMessage('Image uploaded successfully');
      } else {
        showMessage(data.message || 'Upload failed', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('Failed to upload image', 'error');
    } finally {
      setUploading(false);
      setUploadingSlideId(null);
    }
  };

  // ============ CAROUSEL HANDLERS ============
  const handleCarouselChange = (slideId, field, value) => {
    setHomePageData(prev => ({
      ...prev,
      carousel: {
        slides: prev.carousel.slides.map(slide =>
          slide.id === slideId ? { ...slide, [field]: value } : slide
        )
      }
    }));
  };

  const addNewSlide = () => {
    const newId = Math.max(...homePageData.carousel.slides.map(s => s.id), 0) + 1;
    const newOrder = Math.max(...homePageData.carousel.slides.map(s => s.order), 0) + 1;
    
    setHomePageData(prev => ({
      ...prev,
      carousel: {
        slides: [
          ...prev.carousel.slides,
          {
            id: newId,
            image: '',
            imageUrl: '',
            collection: '',
            subtitle: '',
            cta: 'SHOP NOW',
            order: newOrder
          }
        ]
      }
    }));
    showMessage('New slide added');
  };

  const deleteSlide = (slideId) => {
    if (homePageData.carousel.slides.length === 1) {
      showMessage('Cannot delete the last slide', 'error');
      return;
    }
    
    setHomePageData(prev => ({
      ...prev,
      carousel: {
        slides: prev.carousel.slides.filter(s => s.id !== slideId)
      }
    }));
    showMessage('Slide deleted');
  };

  const moveSlide = (slideId, direction) => {
    const slides = [...homePageData.carousel.slides];
    const currentIndex = slides.findIndex(s => s.id === slideId);
    
    if (direction === 'up' && currentIndex > 0) {
      const newOrder = slides[currentIndex - 1].order;
      slides[currentIndex - 1].order = slides[currentIndex].order;
      slides[currentIndex].order = newOrder;
    } else if (direction === 'down' && currentIndex < slides.length - 1) {
      const newOrder = slides[currentIndex + 1].order;
      slides[currentIndex + 1].order = slides[currentIndex].order;
      slides[currentIndex].order = newOrder;
    }
    
    setHomePageData(prev => ({
      ...prev,
      carousel: { slides: slides.sort((a, b) => a.order - b.order) }
    }));
  };

  const saveCarousel = async () => {
    try {
      setSaving(true);
      console.log('💾 Saving carousel slides:', {
        count: homePageData.carousel.slides.length,
        slides: homePageData.carousel.slides.map(s => ({
          id: s.id,
          hasImageUrl: !!s.imageUrl,
          imageUrl: s.imageUrl?.substring(0, 50),
          image: s.image
        }))
      });
      const response = await fetch(`${API_BASE_URL}/api/home-page/carousel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ slides: homePageData.carousel.slides })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Carousel updated successfully');
      } else {
        showMessage(data.message || 'Failed to update carousel', 'error');
      }
    } catch (error) {
      console.error('Save carousel error:', error);
      showMessage('Failed to save carousel', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ============ NEW ARRIVALS HANDLERS ============
  const handleNewArrivalsChange = (field, value) => {
    setHomePageData(prev => ({
      ...prev,
      newArrivals: { ...prev.newArrivals, [field]: value }
    }));
  };

  const saveNewArrivals = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/home-page/new-arrivals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(homePageData.newArrivals)
      });

      const data = await response.json();
      if (data.success) {
        showMessage('New Arrivals section updated successfully');
      } else {
        showMessage(data.message || 'Failed to update New Arrivals', 'error');
      }
    } catch (error) {
      console.error('Save new arrivals error:', error);
      showMessage('Failed to save New Arrivals section', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ============ BRIDAL SECTION HANDLERS ============
  const handleBridalChange = (field, value) => {
    setHomePageData(prev => ({
      ...prev,
      bridalSection: { ...prev.bridalSection, [field]: value }
    }));
  };

  const saveBridalSection = async () => {
    try {
      setSaving(true);
      console.log('💾 Saving bridal section:', {
        hasImageUrl: !!homePageData.bridalSection.imageUrl,
        imageUrl: homePageData.bridalSection.imageUrl?.substring(0, 50),
        heading: homePageData.bridalSection.heading
      });
      const response = await fetch(`${API_BASE_URL}/api/home-page/bridal-section`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(homePageData.bridalSection)
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Bridal section updated successfully');
      } else {
        showMessage(data.message || 'Failed to update Bridal section', 'error');
      }
    } catch (error) {
      console.error('Save bridal section error:', error);
      showMessage('Failed to save Bridal section', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ============ COLLECTION BANNER HANDLERS ============
  const handleCollectionChange = (collectionId, field, value) => {
    setHomePageData(prev => ({
      ...prev,
      collectionBanner: {
        ...prev.collectionBanner,
        collections: prev.collectionBanner.collections.map(col =>
          col.id === collectionId ? { ...col, [field]: value } : col
        )
      }
    }));
  };

  const moveCollection = (collectionId, direction) => {
    const collections = [...homePageData.collectionBanner.collections];
    const currentIndex = collections.findIndex(c => c.id === collectionId);
    
    if (direction === 'up' && currentIndex > 0) {
      const newOrder = collections[currentIndex - 1].order;
      collections[currentIndex - 1].order = collections[currentIndex].order;
      collections[currentIndex].order = newOrder;
    } else if (direction === 'down' && currentIndex < collections.length - 1) {
      const newOrder = collections[currentIndex + 1].order;
      collections[currentIndex + 1].order = collections[currentIndex].order;
      collections[currentIndex].order = newOrder;
    }
    
    setHomePageData(prev => ({
      ...prev,
      collectionBanner: {
        ...prev.collectionBanner,
        collections: collections.sort((a, b) => a.order - b.order)
      }
    }));
  };

  const saveCollectionBanner = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/home-page/collection-banner`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          visible: homePageData.collectionBanner.visible,
          collections: homePageData.collectionBanner.collections
        })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Collection banner updated successfully');
      } else {
        showMessage(data.message || 'Failed to update Collection banner', 'error');
      }
    } catch (error) {
      console.error('Save collection banner error:', error);
      showMessage('Failed to save Collection banner', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800' 
            : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <Tabs defaultValue="carousel" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="carousel">Carousel</TabsTrigger>
          <TabsTrigger value="arrivals">New Arrivals</TabsTrigger>
          <TabsTrigger value="bridal">Bridal</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>

        {/* ============ CAROUSEL TAB ============ */}
        <TabsContent value="carousel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Carousel Slides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {homePageData.carousel.slides?.map((slide, index) => (
                <div key={slide.id} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Slide {index + 1}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveSlide(slide.id, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                        title="Move up"
                      >
                        <ChevronUp size={18} />
                      </button>
                      <button
                        onClick={() => moveSlide(slide.id, 'down')}
                        disabled={index === homePageData.carousel.slides.length - 1}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                        title="Move down"
                      >
                        <ChevronDown size={18} />
                      </button>
                      <button
                        onClick={() => deleteSlide(slide.id)}
                        className="p-1 hover:bg-red-200 rounded text-red-600"
                        title="Delete slide"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Upload Image</label>
                    <div className="flex gap-2 items-center">
                      <label className="flex-1 flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100">
                        <div className="flex items-center gap-2">
                          <Upload size={16} />
                          <span className="text-sm">
                            {uploadingSlideId === slide.id ? 'Uploading...' : 'Choose image'}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, slide.id, 'carousel')}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {slide.imageUrl && (
                      <div className="mt-2">
                        <img src={slide.imageUrl} alt="Preview" className="h-32 w-full object-cover rounded" />
                        <p className="text-xs text-gray-500 mt-1">Image URL: {slide.imageUrl.substring(0, 50)}...</p>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Image Key</label>
                      <Input
                        value={slide.image}
                        onChange={(e) => handleCarouselChange(slide.id, 'image', e.target.value)}
                        placeholder="e.g., hero-bridal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Collection Title</label>
                      <Input
                        value={slide.collection}
                        onChange={(e) => handleCarouselChange(slide.id, 'collection', e.target.value)}
                        placeholder="e.g., Studio Portraits"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Subtitle</label>
                    <Input
                      value={slide.subtitle}
                      onChange={(e) => handleCarouselChange(slide.id, 'subtitle', e.target.value)}
                      placeholder="e.g., Hezal the Label Bridal 2025"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Button Text (CTA)</label>
                      <Input
                        value={slide.cta}
                        onChange={(e) => handleCarouselChange(slide.id, 'cta', e.target.value)}
                        placeholder="e.g., LIVE NOW"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Display Order</label>
                      <Input
                        type="number"
                        value={slide.order}
                        onChange={(e) => handleCarouselChange(slide.id, 'order', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <Button 
                  onClick={addNewSlide}
                  variant="outline"
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Slide
                </Button>
                <Button 
                  onClick={saveCarousel} 
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Save Carousel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ NEW ARRIVALS TAB ============ */}
        <TabsContent value="arrivals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>New Arrivals Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Section Heading</label>
                <Input
                  value={homePageData.newArrivals.heading || ''}
                  onChange={(e) => handleNewArrivalsChange('heading', e.target.value)}
                  placeholder="e.g., New Arrivals"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Section Subheading</label>
                <Input
                  value={homePageData.newArrivals.subheading || ''}
                  onChange={(e) => handleNewArrivalsChange('subheading', e.target.value)}
                  placeholder="e.g., Discover Our Collection"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Products to Display</label>
                  <Input
                    type="number"
                    value={homePageData.newArrivals.limit || 8}
                    onChange={(e) => handleNewArrivalsChange('limit', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Visible</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="arrivals-visible"
                      checked={homePageData.newArrivals.visible !== false}
                      onChange={(e) => handleNewArrivalsChange('visible', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="arrivals-visible" className="text-sm">Show New Arrivals section</label>
                  </div>
                </div>
              </div>

              <Button 
                onClick={saveNewArrivals} 
                disabled={saving}
                className="w-full"
              >
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save New Arrivals
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ BRIDAL SECTION TAB ============ */}
        <TabsContent value="bridal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bridal Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Visible</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="bridal-visible"
                    checked={homePageData.bridalSection.visible !== false}
                    onChange={(e) => handleBridalChange('visible', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="bridal-visible" className="text-sm">Show Bridal section</label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Heading</label>
                  <Input
                    value={homePageData.bridalSection.heading || ''}
                    onChange={(e) => handleBridalChange('heading', e.target.value)}
                    placeholder="e.g., Bridal Collection 2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subheading</label>
                  <Input
                    value={homePageData.bridalSection.subheading || ''}
                    onChange={(e) => handleBridalChange('subheading', e.target.value)}
                    placeholder="e.g., The Art of Craftsmanship"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={homePageData.bridalSection.description || ''}
                  onChange={(e) => handleBridalChange('description', e.target.value)}
                  placeholder="Enter detailed description..."
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Button Text</label>
                  <Input
                    value={homePageData.bridalSection.buttonText || ''}
                    onChange={(e) => handleBridalChange('buttonText', e.target.value)}
                    placeholder="e.g., Explore Collection"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Button Link</label>
                  <Input
                    value={homePageData.bridalSection.buttonLink || ''}
                    onChange={(e) => handleBridalChange('buttonLink', e.target.value)}
                    placeholder="e.g., /collection/bridals"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Upload Image</label>
                <div className="flex gap-2 items-center">
                  <label className="flex-1 flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <Upload size={16} />
                      <span className="text-sm">
                        {uploadingSlideId === 'bridal' ? 'Uploading...' : 'Choose image'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'bridal', 'bridal')}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
                {homePageData.bridalSection.imageUrl && (
                  <div className="mt-2">
                    <img src={homePageData.bridalSection.imageUrl} alt="Preview" className="h-40 w-full object-cover rounded" />
                    <p className="text-xs text-gray-500 mt-1">Image URL: {homePageData.bridalSection.imageUrl.substring(0, 50)}...</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image Key</label>
                <Input
                  value={homePageData.bridalSection.image || ''}
                  onChange={(e) => handleBridalChange('image', e.target.value)}
                  placeholder="e.g., editorial-bridal"
                />
              </div>

              <Button 
                onClick={saveBridalSection} 
                disabled={saving}
                className="w-full"
              >
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save Bridal Section
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ COLLECTIONS TAB ============ */}
        <TabsContent value="collections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Collection Banner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Visible</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="collection-visible"
                    checked={homePageData.collectionBanner.visible !== false}
                    onChange={(e) => setHomePageData(prev => ({
                      ...prev,
                      collectionBanner: { ...prev.collectionBanner, visible: e.target.checked }
                    }))}
                    className="w-4 h-4"
                  />
                  <label htmlFor="collection-visible" className="text-sm">Show Collection banner</label>
                </div>
              </div>

              <div className="space-y-6">
                {homePageData.collectionBanner.collections?.map((collection, index) => (
                  <div key={collection.id} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{collection.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => moveCollection(collection.id, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                          title="Move up"
                        >
                          <ChevronUp size={18} />
                        </button>
                        <button
                          onClick={() => moveCollection(collection.id, 'down')}
                          disabled={index === homePageData.collectionBanner.collections.length - 1}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                          title="Move down"
                        >
                          <ChevronDown size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Title</label>
                        <Input
                          value={collection.title}
                          onChange={(e) => handleCollectionChange(collection.id, 'title', e.target.value)}
                          placeholder="e.g., Ready To Wear"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Subtitle</label>
                        <Input
                          value={collection.subtitle}
                          onChange={(e) => handleCollectionChange(collection.id, 'subtitle', e.target.value)}
                          placeholder="e.g., Effortless Elegance"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Image Key</label>
                        <Input
                          value={collection.image}
                          onChange={(e) => handleCollectionChange(collection.id, 'image', e.target.value)}
                          placeholder="e.g., collection-rtw"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Link</label>
                        <Input
                          value={collection.link}
                          onChange={(e) => handleCollectionChange(collection.id, 'link', e.target.value)}
                          placeholder="e.g., /collection/ready-to-wear"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Upload Image</label>
                      <div className="flex gap-2 items-center">
                        <label className="flex-1 flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100">
                          <div className="flex items-center gap-2">
                            <Upload size={16} />
                            <span className="text-sm">
                              {uploadingSlideId === `collection-${collection.id}` ? 'Uploading...' : 'Choose image'}
                            </span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, `collection-${collection.id}`, 'collection', collection.id)}
                            disabled={uploading}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {collection.imageUrl && (
                        <div className="mt-2">
                          <img src={collection.imageUrl} alt={collection.title} className="h-32 w-full object-cover rounded" />
                          <p className="text-xs text-gray-500 mt-1">Image URL: {collection.imageUrl.substring(0, 50)}...</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Display Order</label>
                      <Input
                        type="number"
                        value={collection.order}
                        onChange={(e) => handleCollectionChange(collection.id, 'order', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={saveCollectionBanner} 
                disabled={saving}
                className="w-full"
              >
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save Collection Banner
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
