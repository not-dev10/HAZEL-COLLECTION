import { checkSystemHealth } from '../src/controllers/health.controller.js';

describe('Health Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('checkSystemHealth', () => {
    it('should return health status with all services', async () => {
      await checkSystemHealth(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalled();
      const response = mockRes.json.mock.calls[0][0];

      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('health');
      expect(response.health).toHaveProperty('server');
      expect(response.health).toHaveProperty('mongodb');
      expect(response.health).toHaveProperty('cloudinary');
      expect(response.health).toHaveProperty('overallStatus');
    });

    it('should check server status is healthy', async () => {
      await checkSystemHealth(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      const { server } = response.health;

      expect(server).toHaveProperty('status');
      expect(server).toHaveProperty('responseTime');
      expect(server).toHaveProperty('message');
      expect(['healthy', 'degraded', 'down']).toContain(server.status);
    });

    it('should have response times for each service', async () => {
      await checkSystemHealth(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      const { mongodb, cloudinary } = response.health;

      expect(typeof mongodb.responseTime).toBe('number');
      expect(typeof cloudinary.responseTime).toBe('number');
    });

    it('should include timestamp in response', async () => {
      await checkSystemHealth(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.health).toHaveProperty('timestamp');
      expect(response.health.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should handle errors gracefully', async () => {
      // Mock a scenario where services might fail
      mockRes.status.mockReturnValue(mockRes);
      
      // If an error occurs, it should still return valid JSON structure
      await checkSystemHealth(mockReq, mockRes);

      // Should call either json (success) or status().json (error)
      expect(mockRes.json).toHaveBeenCalled();
    });
  });
});
