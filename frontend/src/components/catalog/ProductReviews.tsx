import { useState, useEffect } from 'react';

interface Review {
  _id: string;
  productId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  createdAt: string;
}

interface ReviewsProps {
  productId?: string | number;
  productName?: string;
}

const Reviews = ({ productId, productName }: ReviewsProps) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  // Fetch reviews on component mount
  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || API_BASE_URL}/api/reviews/product/${productId}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
        setAvgRating(parseFloat(data.avgRating) || 0);
      } else {
        console.warn('⚠️ Failed to fetch reviews:', data.message);
      }
    } catch (err) {
      console.error('❌ Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating || !title.trim() || !comment.trim()) {
      setError('Please fill in all fields and select a rating');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      // Get user data from sessionStorage (where login stores it)
      const userStr = sessionStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user || !user.id) {
        setError('Please log in to submit a review');
        setSubmitting(false);
        return;
      }

      // Get token from sessionStorage (where login stores it)
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setSubmitting(false);
        return;
      }

      console.log('📤 Submitting review for product:', productId);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          customerId: user.id,
          customerName: user.fullName || user.email || 'Anonymous',
          rating,
          title,
          comment
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Review submitted successfully:', data.review);
        setSuccessMessage(data.message);
        setRating(0);
        setTitle('');
        setComment('');
        setShowReviewForm(false);
        
        // Refresh reviews after a short delay
        setTimeout(() => {
          fetchReviews();
          setSuccessMessage('');
        }, 2000);
      } else {
        console.warn('⚠️ Failed to submit review:', data.message);
        setError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      console.error('Review submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      console.log('👍 Marking review as helpful:', reviewId);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/helpful/${reviewId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Review marked as helpful successfully:', data.review);
        fetchReviews();
      } else {
        console.warn('⚠️ Failed to mark review as helpful:', data.message);
      }
    } catch (err) {
      console.error('❌ Failed to mark review as helpful:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold">{avgRating.toFixed(1)}</div>
              <div className="flex gap-1 mt-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}>
                    ★
                  </span>
                ))}
              </div>
              <div className="text-sm text-muted-foreground mt-2">{reviews.length} reviews</div>
            </div>
          </div>
        </div>
      )}

      {/* Write Review CTA */}
      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-serif mb-4">Share Your Experience</h3>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Have you purchased {productName}? Share your experience and help other customers make informed decisions.
        </p>
        <button 
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="inline-block px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 transition rounded font-medium"
        >
          Write a Review
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded">
          {successMessage}
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="border border-border rounded-lg p-8">
          <h4 className="text-lg font-semibold mb-6">Write Your Review</h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating *</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`text-3xl transition transform hover:scale-110 ${
                      star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && <p className="text-sm text-muted-foreground mt-2">{rating} out of 5 stars</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Review Title *</label>
              <input 
                type="text" 
                placeholder="Brief title for your review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Your Review *</label>
              <textarea 
                placeholder="Share your experience with this product..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-border rounded px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">{comment.length}/1000 characters</p>
            </div>

            <div className="flex gap-3">
              <button 
                type="submit" 
                disabled={submitting}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 border border-border rounded hover:bg-muted transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Customer Reviews</h3>
        
        {loading && <p className="text-muted-foreground">Loading reviews...</p>}
        
        {!loading && reviews.length === 0 && (
          <p className="text-muted-foreground">No approved reviews yet. Be the first to share your experience!</p>
        )}

        {reviews.map((review) => (
          <div key={review._id} className="border border-border rounded-lg p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>
                  ))}
                </div>
                <h4 className="font-semibold text-lg">{review.title}</h4>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-3">{review.customerName}</p>
            <p className="mb-4">{review.comment}</p>

            <button
              onClick={() => markHelpful(review._id)}
              className="text-sm text-primary hover:underline transition"
            >
              👍 Helpful ({review.helpful})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
