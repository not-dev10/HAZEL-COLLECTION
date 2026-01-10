import Review from '../models/Review.js';

// Get all reviews (admin only)
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll();
    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get product reviews (public - approved only, or admin - all)
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const isAdmin = req.user?.role === 'admin';

    const reviews = await Review.findByProductId(productId, !isAdmin);

    // Calculate average rating
    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      count: reviews.length,
      avgRating,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { productId, customerId, customerName, rating, title, comment } = req.body;

    // Validate required fields
    if (!productId || !customerId || !customerName || !rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Check if customer has already reviewed this product
    const existingReview = await Review.findByCustomerAndProduct(customerId, productId);

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }

    const reviewId = await Review.create({
      productId,
      customerId,
      customerName,
      rating,
      title,
      comment,
    });

    const newReview = await Review.findById(reviewId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. It will be visible after admin approval.',
      review: newReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update review status (admin only)
export const updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected',
      });
    }

    const review = await Review.updateStatus(reviewId, status);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review status updated successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete review (admin only)
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const deleted = await Review.delete(reviewId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark review as helpful (anyone)
export const markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.incrementHelpful(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review marked as helpful',
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
