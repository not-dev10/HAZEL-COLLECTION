import { HomePage } from "../models/HomePage.js";

export const getHomePageContent = async (req, res) => {
  try {
    const content = await HomePage.getHomePageContent();
    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Get home page content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch home page content',
      error: error.message
    });
  }
};

export const updateCarouselSlides = async (req, res) => {
  try {
    const { slides } = req.body;

    if (!slides || !Array.isArray(slides)) {
      return res.status(400).json({
        success: false,
        message: 'Slides must be provided as an array'
      });
    }

    // Sort slides by order
    const sortedSlides = slides.sort((a, b) => a.order - b.order);

    const result = await HomePage.updateCarouselSlides(sortedSlides);
    
    res.json({
      success: true,
      message: 'Carousel slides updated successfully',
      data: result.value
    });
  } catch (error) {
    console.error('Update carousel slides error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update carousel slides',
      error: error.message
    });
  }
};

export const updateNewArrivalsSection = async (req, res) => {
  try {
    const { heading, subheading, limit, visible } = req.body;

    const newArrivalsData = {
      heading: heading || "New Arrivals",
      subheading: subheading || "Discover Our Collection",
      limit: limit || 8,
      visible: visible !== undefined ? visible : true
    };

    const result = await HomePage.updateNewArrivalsSection(newArrivalsData);
    
    res.json({
      success: true,
      message: 'New Arrivals section updated successfully',
      data: result.value
    });
  } catch (error) {
    console.error('Update new arrivals section error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update new arrivals section',
      error: error.message
    });
  }
};

export const updateBridalSection = async (req, res) => {
  try {
    const { visible, heading, subheading, description, buttonText, buttonLink, image, imageUrl } = req.body;

    const bridalData = {
      visible: visible !== undefined ? visible : true,
      heading: heading || "Bridal Collection 2025",
      subheading: subheading || "The Art of Craftsmanship",
      description: description || "Each piece is meticulously handcrafted by our master artisans, preserving centuries-old techniques while embracing contemporary elegance. Our bridal collection celebrates the beauty of tradition interwoven with modern sophistication.",
      buttonText: buttonText || "Explore Collection",
      buttonLink: buttonLink || "/collection/bridals",
      // 🔧 FIX: Prioritize imageUrl (from upload), fallback to image (Cloudinary ID)
      imageUrl: imageUrl || "",
      image: image || "editorial-bridal"
    };

    console.log('💾 Updating bridal section:', {
      hasImageUrl: !!bridalData.imageUrl,
      imageUrl: bridalData.imageUrl?.substring(0, 60),
      image: bridalData.image
    });

    const result = await HomePage.updateBridalSection(bridalData);
    
    res.json({
      success: true,
      message: 'Bridal section updated successfully',
      data: result.value
    });
  } catch (error) {
    console.error('Update bridal section error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bridal section',
      error: error.message
    });
  }
};

export const updateCollectionBanner = async (req, res) => {
  try {
    const { visible, collections } = req.body;

    if (!collections || !Array.isArray(collections)) {
      return res.status(400).json({
        success: false,
        message: 'Collections must be provided as an array'
      });
    }

    // Sort collections by order
    const sortedCollections = collections.sort((a, b) => a.order - b.order);

    const collectionBannerData = {
      visible: visible !== undefined ? visible : true,
      collections: sortedCollections
    };

    const result = await HomePage.updateCollectionBanner(collectionBannerData);
    
    res.json({
      success: true,
      message: 'Collection banner updated successfully',
      data: result.value
    });
  } catch (error) {
    console.error('Update collection banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update collection banner',
      error: error.message
    });
  }
};

export const updateHomePageContent = async (req, res) => {
  try {
    const updates = req.body;

    const result = await HomePage.updateHomePageContent(updates);
    
    res.json({
      success: true,
      message: 'Home page content updated successfully',
      data: result.value
    });
  } catch (error) {
    console.error('Update home page content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update home page content',
      error: error.message
    });
  }
};
