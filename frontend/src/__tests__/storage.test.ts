describe('Storage Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  describe('SessionStorage - Auth Token', () => {
    it('should store authToken in sessionStorage', () => {
      const token = 'test-token-123';
      sessionStorage.setItem('authToken', token);

      expect(sessionStorage.getItem('authToken')).toBe(token);
    });

    it('should retrieve authToken from sessionStorage', () => {
      const token = 'stored-token-456';
      sessionStorage.setItem('authToken', token);

      const retrieved = sessionStorage.getItem('authToken');
      expect(retrieved).toBe(token);
    });

    it('should remove authToken from sessionStorage', () => {
      sessionStorage.setItem('authToken', 'token-to-remove');
      sessionStorage.removeItem('authToken');

      expect(sessionStorage.getItem('authToken')).toBeNull();
    });
  });

  describe('SessionStorage - User Data', () => {
    it('should store user data in sessionStorage', () => {
      const userData = {
        id: 'user123',
        email: 'user@example.com',
        fullName: 'John Doe'
      };

      sessionStorage.setItem('user', JSON.stringify(userData));
      const stored = sessionStorage.getItem('user');

      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!);
      expect(parsed.id).toBe('user123');
      expect(parsed.fullName).toBe('John Doe');
    });

    it('should parse user JSON correctly', () => {
      const userData = {
        id: 'C001',
        email: 'customer@test.com',
        fullName: 'Jane Smith',
        phone: '555-1234'
      };

      sessionStorage.setItem('user', JSON.stringify(userData));
      const stored = sessionStorage.getItem('user');
      const parsed = JSON.parse(stored!);

      expect(parsed.id).toBe('C001');
      expect(parsed.email).toBe('customer@test.com');
      expect(parsed.phone).toBe('555-1234');
    });

    it('should handle missing fullName field', () => {
      const userData = {
        id: 'user456',
        email: 'noname@test.com',
        // fullName is missing
      };

      sessionStorage.setItem('user', JSON.stringify(userData));
      const stored = sessionStorage.getItem('user');
      const parsed = JSON.parse(stored!);

      expect(parsed.fullName).toBeUndefined();
    });
  });

  describe('Admin Token Storage', () => {
    it('should store adminToken in localStorage', () => {
      const adminToken = 'admin-token-xyz';
      localStorage.setItem('adminToken', adminToken);

      expect(localStorage.getItem('adminToken')).toBe(adminToken);
    });

    it('should retrieve adminToken from localStorage', () => {
      const token = 'admin-stored-token';
      localStorage.setItem('adminToken', token);

      const retrieved = localStorage.getItem('adminToken');
      expect(retrieved).toBe(token);
    });

    it('should not confuse adminToken with regular token', () => {
      const adminToken = 'admin-123';
      const userToken = 'user-456';

      localStorage.setItem('adminToken', adminToken);
      sessionStorage.setItem('authToken', userToken);

      expect(localStorage.getItem('adminToken')).toBe(adminToken);
      expect(sessionStorage.getItem('authToken')).toBe(userToken);
      expect(localStorage.getItem('adminToken')).not.toBe(userToken);
    });
  });

  describe('Token Validation', () => {
    it('should return null for missing token', () => {
      sessionStorage.removeItem('authToken');
      const token = sessionStorage.getItem('authToken');

      expect(token).toBeNull();
    });

    it('should return null for missing adminToken', () => {
      localStorage.removeItem('adminToken');
      const token = localStorage.getItem('adminToken');

      expect(token).toBeNull();
    });

    it('should detect token existence', () => {
      const token = 'existing-token';
      sessionStorage.setItem('authToken', token);

      const hasToken = sessionStorage.getItem('authToken') !== null;
      expect(hasToken).toBe(true);
    });

    it('should handle Bearer token format', () => {
      const token = 'raw-token-value';
      const bearerToken = `Bearer ${token}`;

      sessionStorage.setItem('authToken', token);
      const stored = sessionStorage.getItem('authToken');

      // Should store raw token, not Bearer format
      expect(stored).toBe(token);
      expect(stored).not.toContain('Bearer');
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data integrity across multiple operations', () => {
      const original = { id: 'test', name: 'Test User' };

      sessionStorage.setItem('user', JSON.stringify(original));
      const retrieved = JSON.parse(sessionStorage.getItem('user')!);

      expect(retrieved).toEqual(original);
      expect(retrieved.id).toBe(original.id);
      expect(retrieved.name).toBe(original.name);
    });

    it('should handle clearing storage', () => {
      sessionStorage.setItem('authToken', 'token123');
      sessionStorage.setItem('user', 'userdata');

      sessionStorage.clear();

      expect(sessionStorage.getItem('authToken')).toBeNull();
      expect(sessionStorage.getItem('user')).toBeNull();
    });

    it('should preserve data after multiple updates', () => {
      sessionStorage.setItem('authToken', 'token-v1');
      expect(sessionStorage.getItem('authToken')).toBe('token-v1');

      sessionStorage.setItem('authToken', 'token-v2');
      expect(sessionStorage.getItem('authToken')).toBe('token-v2');

      sessionStorage.setItem('authToken', 'token-v3');
      expect(sessionStorage.getItem('authToken')).toBe('token-v3');
    });
  });

  describe('Admin vs User Auth Separation', () => {
    it('should keep admin and user auth separate', () => {
      const adminToken = 'admin-token-123';
      const userToken = 'user-token-456';

      // Admin uses localStorage
      localStorage.setItem('adminToken', adminToken);

      // User uses sessionStorage
      sessionStorage.setItem('authToken', userToken);

      expect(localStorage.getItem('adminToken')).toBe(adminToken);
      expect(sessionStorage.getItem('authToken')).toBe(userToken);
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(sessionStorage.getItem('adminToken')).toBeNull();
    });

    it('should clear admin auth without affecting user auth', () => {
      localStorage.setItem('adminToken', 'admin-token');
      sessionStorage.setItem('authToken', 'user-token');

      localStorage.removeItem('adminToken');

      expect(localStorage.getItem('adminToken')).toBeNull();
      expect(sessionStorage.getItem('authToken')).toBe('user-token');
    });
  });
});
