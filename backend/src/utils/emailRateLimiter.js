/**
 * Email Service Rate Limiter
 * Prevents exceeding Google SMTP rate limits by caching verification results
 * Verifies connection only every 2 hours
 */

class EmailRateLimiter {
  constructor() {
    this.lastVerificationTime = null;
    this.cachedStatus = null;
    this.verificationInterval = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  }

  /**
   * Check if verification should be performed
   * Returns true if 2 hours have passed since last verification
   */
  shouldVerify() {
    if (!this.lastVerificationTime) {
      return true; // First verification
    }

    const timeSinceLastVerification = Date.now() - this.lastVerificationTime;
    return timeSinceLastVerification >= this.verificationInterval;
  }

  /**
   * Get cached status without making API call
   */
  getCachedStatus() {
    return this.cachedStatus;
  }

  /**
   * Update cache with new verification result
   */
  updateCache(status, message, responseTime) {
    this.lastVerificationTime = Date.now();
    this.cachedStatus = {
      status,
      message,
      responseTime,
      cached: true,
      cachedAt: new Date(this.lastVerificationTime).toISOString(),
      nextVerification: new Date(this.lastVerificationTime + this.verificationInterval).toISOString()
    };
    return this.cachedStatus;
  }

  /**
   * Get status info including cache metadata
   */
  getStatusWithCacheInfo() {
    if (!this.cachedStatus) {
      return {
        status: 'unknown',
        message: 'Email service status not yet checked',
        cached: false
      };
    }

    return {
      ...this.cachedStatus,
      timeSinceLastCheck: this.getTimeSinceLastCheck(),
      shouldVerifyNow: this.shouldVerify()
    };
  }

  /**
   * Get time elapsed since last verification (human readable)
   */
  getTimeSinceLastCheck() {
    if (!this.lastVerificationTime) return 'Never';

    const elapsed = Date.now() - this.lastVerificationTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s ago`;
    return `${seconds}s ago`;
  }

  /**
   * Reset cache (for testing or manual refresh)
   */
  reset() {
    this.lastVerificationTime = null;
    this.cachedStatus = null;
    console.log('📧 Email rate limiter cache cleared');
  }
}

// Create singleton instance
export const emailRateLimiter = new EmailRateLimiter();
