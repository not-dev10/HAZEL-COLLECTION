import { connectDB, getDB } from '../config/mongodb.js';
import axios from 'axios';

/**
 * Check overall system health
 * Returns status of server, MongoDB, and Cloudinary
 */
export const checkSystemHealth = async (req, res) => {
  try {
    console.log('🏥 Checking system health...');
    
    const startTime = Date.now();
    
    // Check Server Status
    const serverCheck = {
      status: 'healthy',
      responseTime: 0,
      message: 'Server is running',
      lastChecked: new Date().toISOString()
    };

    // Check MongoDB Connection
    let mongodbCheck = {
      status: 'healthy',
      responseTime: 0,
      message: 'MongoDB connected',
      lastChecked: new Date().toISOString()
    };

    try {
      const mongoStartTime = Date.now();
      
      // Try to ping the database
      const database = getDB();
      if (database) {
        // Simple health check by attempting a ping on the admin database
        const adminDb = database.admin();
        await adminDb.ping();
        mongodbCheck.responseTime = Date.now() - mongoStartTime;
        mongodbCheck.status = 'healthy';
        mongodbCheck.message = 'MongoDB connected and responsive';
        console.log('✅ MongoDB health check passed');
      } else {
        throw new Error('Database connection not available');
      }
    } catch (mongoError) {
      console.error('❌ MongoDB health check failed:', mongoError.message);
      mongodbCheck.status = 'down';
      mongodbCheck.message = `MongoDB error: ${mongoError.message}`;
      mongodbCheck.responseTime = Date.now() - startTime;
    }

    // Check Cloudinary Connection
    let cloudinaryCheck = {
      status: 'healthy',
      responseTime: 0,
      message: 'Cloudinary API accessible',
      lastChecked: new Date().toISOString()
    };

    try {
      const cloudinaryStartTime = Date.now();
      
      // Ping Cloudinary API
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const response = await axios.get(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/usage`, {
          auth: {
            username: process.env.CLOUDINARY_API_KEY,
            password: process.env.CLOUDINARY_API_SECRET
          },
          timeout: 5000
        });
        
        cloudinaryCheck.responseTime = Date.now() - cloudinaryStartTime;
        cloudinaryCheck.status = response.status === 200 ? 'healthy' : 'degraded';
        cloudinaryCheck.message = 'Cloudinary API responding normally';
        console.log('✅ Cloudinary health check passed');
      } else {
        cloudinaryCheck.status = 'degraded';
        cloudinaryCheck.message = 'Cloudinary credentials not configured';
      }
    } catch (cloudinaryError) {
      console.warn('⚠️ Cloudinary health check warning:', cloudinaryError.message);
      cloudinaryCheck.status = 'degraded';
      cloudinaryCheck.message = `Cloudinary warning: ${cloudinaryError.message}`;
      cloudinaryCheck.responseTime = Date.now() - startTime;
    }

    // Calculate overall status
    const statuses = [serverCheck.status, mongodbCheck.status, cloudinaryCheck.status];
    let overallStatus = 'healthy';
    
    if (statuses.includes('down')) {
      overallStatus = 'down';
    } else if (statuses.includes('degraded')) {
      overallStatus = 'degraded';
    }

    serverCheck.responseTime = Date.now() - startTime;

    console.log('🏥 Health check complete:', {
      overall: overallStatus,
      server: serverCheck.status,
      mongodb: mongodbCheck.status,
      cloudinary: cloudinaryCheck.status
    });

    res.json({
      success: true,
      health: {
        server: serverCheck,
        mongodb: mongodbCheck,
        cloudinary: cloudinaryCheck,
        overallStatus: overallStatus,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Health check error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to check system health',
      error: error.message
    });
  }
};
