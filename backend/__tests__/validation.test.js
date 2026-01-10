/**
 * Data Validation Tests
 * Tests for review submission data and validation logic
 */

describe('Review Data Validation', () => {
  // Validation helper functions
  const validateReviewData = (data) => {
    const errors = [];

    if (!data.productId || typeof data.productId !== 'string') {
      errors.push('productId is required and must be a string');
    }
    if (!data.customerId || typeof data.customerId !== 'string') {
      errors.push('customerId is required and must be a string');
    }
    if (!data.customerName || typeof data.customerName !== 'string') {
      errors.push('customerName is required and must be a string');
    }
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      errors.push('rating must be between 1 and 5');
    }
    if (!data.title || data.title.trim() === '') {
      errors.push('title is required and cannot be empty');
    }
    if (!data.comment || data.comment.trim() === '') {
      errors.push('comment is required and cannot be empty');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  describe('Required Fields', () => {
    it('should accept valid review data', () => {
      const validData = {
        productId: 'P001',
        customerId: 'C001',
        customerName: 'John Doe',
        rating: 5,
        title: 'Great product!',
        comment: 'Excellent quality and fast shipping.'
      };

      const validation = validateReviewData(validData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject missing productId', () => {
      const invalidData = {
        customerId: 'C001',
        customerName: 'John Doe',
        rating: 5,
        title: 'Great product!',
        comment: 'Excellent quality and fast shipping.'
      };

      const validation = validateReviewData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('productId'))).toBe(true);
    });

    it('should reject missing customerId', () => {
      const invalidData = {
        productId: 'P001',
        customerName: 'John Doe',
        rating: 5,
        title: 'Great product!',
        comment: 'Excellent quality and fast shipping.'
      };

      const validation = validateReviewData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('customerId'))).toBe(true);
    });

    it('should reject missing customerName', () => {
      const invalidData = {
        productId: 'P001',
        customerId: 'C001',
        rating: 5,
        title: 'Great product!',
        comment: 'Excellent quality and fast shipping.'
      };

      const validation = validateReviewData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('customerName'))).toBe(true);
    });

    it('should reject missing rating', () => {
      const invalidData = {
        productId: 'P001',
        customerId: 'C001',
        customerName: 'John Doe',
        title: 'Great product!',
        comment: 'Excellent quality and fast shipping.'
      };

      const validation = validateReviewData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('rating'))).toBe(true);
    });

    it('should reject missing title', () => {
      const invalidData = {
        productId: 'P001',
        customerId: 'C001',
        customerName: 'John Doe',
        rating: 5,
        comment: 'Excellent quality and fast shipping.'
      };

      const validation = validateReviewData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('title'))).toBe(true);
    });

    it('should reject missing comment', () => {
      const invalidData = {
        productId: 'P001',
        customerId: 'C001',
        customerName: 'John Doe',
        rating: 5,
        title: 'Great product!'
      };

      const validation = validateReviewData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('comment'))).toBe(true);
    });
  });

  describe('Rating Validation', () => {
    it('should accept rating 1', () => {
      const data = {
        productId: 'P001',
        customerId: 'C001',
        customerName: 'John Doe',
        rating: 1,
        title: 'Poor',
        comment: 'Not satisfied'
      };

      const validation = validateReviewData(data);
      expect(validation.isValid).toBe(true);
    });

    it('should accept rating 5', () => {
      const data = {
        productId: 'P001',
        customerId: 'C001',
        customerName: 'John Doe',
        rating: 5,
        title: 'Great',
        comment: 'Excellent'
      };

      const validation = validateReviewData(data);
      expect(validation.isValid).toBe(true);
    });

    it('should accept all ratings 1-5', () => {
      for (let i = 1; i <= 5; i++) {
        const data = {
          productId: 'P001',
          customerId: 'C001',
          customerName: 'John Doe',
          rating: i,
          title: `Rating ${i}`,
          comment: 'Test'
        };

        const validation = validateReviewData(data);
        expect(validation.isValid).toBe(true);
      }
    });

    it('should reject rating 0', () => {
      const data = {
        productId: 'P001',
        customerId: 'C001',
        customerName: 'John Doe',
        rating: 0,
        title: 'Invalid',
        comment: 'Test'
      };

      const validation = validateReviewData(data);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('rating'))).toBe(true);
    });

    it('should reject rating 6', () => {
      const data = {
        productId: 'P001',
        customerId: 'C001',
        customerName: 'John Doe',
        rating: 6,
        title: 'Invalid',
        comment: 'Test'
      };

      const validation = validateReviewData(data);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('rating'))).toBe(true);
    });

    it('should reject non-numeric rating', () => {
      const data = {
        productId: 'P001',
        customerId: 'C001',
        customerName: 'John Doe',
        rating: 'five',
        title: 'Invalid',
        comment: 'Test'
      };

      const validation = validateReviewData(data);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('rating'))).toBe(true);
    });
  });

  describe('Text Field Validation', () => {
    it('should reject empty title', () => {
      const data = {
        productId: 'P001',
        customerId: 'C001',
        customerName: 'John Doe',
        rating: 5,
        title: '',
        comment: 'Test'
      };

      const validation = validateReviewData(data);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('title'))).toBe(true);
    });

    it('should reject whitespace-only title', () => {
      const data = {
        productId: 'P001',
        customerId: 'C001',
        customerName: 'John Doe',
        rating: 5,
        title: '   ',
        comment: 'Test'
      };

      const validation = validateReviewData(data);
      expect(validation.isValid).toBe(false);
    });

    it('should reject empty comment', () => {
      const data = {
        productId: 'P001',
        customerId: 'C001',
        customerName: 'John Doe',
        rating: 5,
        title: 'Good',
        comment: ''
      };

      const validation = validateReviewData(data);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('comment'))).toBe(true);
    });

    it('should accept long title and comment', () => {
      const data = {
        productId: 'P001',
        customerId: 'C001',
        customerName: 'John Doe',
        rating: 5,
        title: 'A'.repeat(100),
        comment: 'B'.repeat(500)
      };

      const validation = validateReviewData(data);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Type Validation', () => {
    it('should reject non-string productId', () => {
      const data = {
        productId: 123,
        customerId: 'C001',
        customerName: 'John Doe',
        rating: 5,
        title: 'Good',
        comment: 'Test'
      };

      const validation = validateReviewData(data);
      expect(validation.isValid).toBe(false);
    });

    it('should reject non-string customerId', () => {
      const data = {
        productId: 'P001',
        customerId: 456,
        customerName: 'John Doe',
        rating: 5,
        title: 'Good',
        comment: 'Test'
      };

      const validation = validateReviewData(data);
      expect(validation.isValid).toBe(false);
    });
  });
});
