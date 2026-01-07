import { useState } from 'react';

interface ReviewsProps {
  productId?: string | number;
  productName?: string;
}

const Reviews = ({ productId, productName }: ReviewsProps) => {
  const [showReviewForm, setShowReviewForm] = useState(false);

  return (
    <div className="space-y-8">
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

      {/* Review Form (hidden by default) */}
      {showReviewForm && (
        <div className="border border-border rounded-lg p-8">
          <h4 className="text-lg font-semibold mb-6">Write Your Review</h4>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="text-2xl hover:scale-110 transition"
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Review Title</label>
              <input type="text" placeholder="Brief title for your review" className="w-full border border-border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Your Review</label>
              <textarea placeholder="Share your experience with this product..." className="w-full border border-border rounded px-3 py-2 min-h-[100px]" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition">
                Submit Review
              </button>
              <button type="button" onClick={() => setShowReviewForm(false)} className="px-4 py-2 border border-border rounded hover:bg-muted transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Reviews;
