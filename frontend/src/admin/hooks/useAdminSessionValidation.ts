import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';

/**
 * Hook for validating admin session across tabs
 * Ensures only one active admin session at a time
 */
export const useAdminSessionValidation = () => {
  const [sessionValid, setSessionValid] = useState(true);
  const [isConflict, setIsConflict] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const adminId = JSON.parse(localStorage.getItem('adminUser') || '{}').id;
    const sessionId = localStorage.getItem('adminSessionId');
    const tabId = localStorage.getItem('adminTabId');

    if (!adminId || !sessionId || !tabId) {
      return;
    }

    // Validate session immediately
    const validateSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/admin/validate-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminId, sessionId, tabId }),
        });

        const data = await response.json();

        if (!data.sessionValid) {
          setSessionValid(false);
          setIsConflict(data.conflictingSession || data.differentTab);
          setError(data.message);
        }
      } catch (err) {
        console.error('Session validation error:', err);
      }
    };

    // Validate on mount
    validateSession();

    // Set up periodic validation (every 30 seconds)
    const interval = setInterval(validateSession, 30000);

    // Validate on focus
    const handleFocus = () => {
      validateSession();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return { sessionValid, isConflict, error };
};

export default useAdminSessionValidation;
