import { connectDB, getDB } from '../config/mongodb.js';
import axios from 'axios';
import { mailService } from '../utils/mailService.js';
import { emailRateLimiter } from '../utils/emailRateLimiter.js';
import { cloudinaryRateLimiter } from '../utils/cloudinaryRateLimiter.js';

/**
 * Check overall system health
 * Returns status of server, MongoDB, Cloudinary, and Email service
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
        
        // Get MongoDB storage stats
        try {
          const statsResult = await adminDb.serverStatus();
          const dbStatsResult = await database.stats();
          mongodbCheck.storage = {
            dataSize: (dbStatsResult.dataSize / 1024 / 1024).toFixed(2) + ' MB',
            storageSize: (dbStatsResult.storageSize / 1024 / 1024).toFixed(2) + ' MB',
            collections: dbStatsResult.collections,
            indexes: dbStatsResult.indexes
          };
        } catch (storageError) {
          console.warn('⚠️ Could not fetch MongoDB storage stats:', storageError.message);
        }
        
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
      lastChecked: new Date().toISOString(),
      credentials: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configured' : '❌ Missing',
        apiKey: process.env.CLOUDINARY_API_KEY ? '✅ Configured' : '❌ Missing',
        apiSecret: process.env.CLOUDINARY_API_SECRET ? '✅ Configured' : '❌ Missing'
      }
    };

    try {
      // Check if credentials are configured
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        cloudinaryCheck.status = 'degraded';
        cloudinaryCheck.message = 'Cloudinary credentials not fully configured';
        cloudinaryCheck.responseTime = 0;
      } else if (cloudinaryRateLimiter.shouldVerify()) {
        // Perform actual verification if 2 hours have passed
        console.log('☁️ Cloudinary verification due (>2 hours since last check)');
        const cloudinaryStartTime = Date.now();
        
        try {
          // Ping Cloudinary API for usage stats with timeout
          const response = await axios.get(
            `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/usage`,
            {
              auth: {
                username: process.env.CLOUDINARY_API_KEY,
                password: process.env.CLOUDINARY_API_SECRET
              },
              timeout: 5000
            }
          );
          
          const responseTime = Date.now() - cloudinaryStartTime;
          cloudinaryCheck.responseTime = responseTime;
          cloudinaryCheck.status = 'healthy';
          cloudinaryCheck.message = 'Cloudinary API responding normally (verified)';
          
          // Extract and cache storage information from response
          if (response.data) {
            const bytesUsed = response.data.bytes_used || 0;
            const bytesQuota = response.data.bytes_quota || 0;
            const creditsUsed = response.data.credits_used || 0;
            const creditsTotal = response.data.credits || 0;
            
            const storageData = {
              bytesUsed,
              bytesUsedDisplay: `${(bytesUsed / 1024 / 1024 / 1024).toFixed(2)} GB`,
              bytesQuota,
              bytesQuotaDisplay: `${(bytesQuota / 1024 / 1024 / 1024).toFixed(2)} GB`,
              usagePercent: bytesQuota ? 
                ((bytesUsed / bytesQuota) * 100).toFixed(2) + '%' : 
                'N/A',
              credits: {
                total: creditsTotal,
                used: creditsUsed,
                remaining: creditsTotal - creditsUsed,
                usagePercent: creditsTotal ? 
                  ((creditsUsed / creditsTotal) * 100).toFixed(2) + '%' : 
                  'N/A'
              }
            };
            
            cloudinaryCheck.storage = storageData.bytesUsedDisplay + ' / ' + storageData.bytesQuotaDisplay;
            cloudinaryCheck.storageData = storageData;
            cloudinaryRateLimiter.updateCache('healthy', 'Cloudinary verified', responseTime, storageData);
          }
          
          console.log('✅ Cloudinary health check passed');
        } catch (verifyError) {
          const responseTime = Date.now() - cloudinaryStartTime;
          
          // Handle different error codes
          if (verifyError.response?.status === 420) {
            console.warn('⚠️ Cloudinary API rate limit (420) - using cached data');
            cloudinaryCheck.status = 'degraded';
            cloudinaryCheck.message = 'Cloudinary rate limited - using cached status';
          } else if (verifyError.response?.status === 401) {
            cloudinaryCheck.status = 'degraded';
            cloudinaryCheck.message = 'Cloudinary authentication failed (401)';
            cloudinaryRateLimiter.updateCache('degraded', 'Authentication failed', responseTime);
          } else {
            cloudinaryCheck.status = 'degraded';
            cloudinaryCheck.message = `Cloudinary error: ${verifyError.message}`;
            cloudinaryRateLimiter.updateCache('degraded', verifyError.message, responseTime);
          }
          
          cloudinaryCheck.responseTime = responseTime;
          console.warn('⚠️ Cloudinary verification failed:', verifyError.message);
        }
      } else {
        // Use cached status to avoid rate limiting
        const cachedStatus = cloudinaryRateLimiter.getStatusWithCacheInfo();
        const cachedStorage = cloudinaryRateLimiter.getCachedStorage();
        console.log('☁️ Using cached Cloudinary status (next verification in 2 hours)');
        
        cloudinaryCheck.status = cachedStatus.status;
        cloudinaryCheck.message = `${cachedStatus.message} (cached - last check ${cachedStatus.timeSinceLastCheck})`;
        cloudinaryCheck.isCached = true;
        cloudinaryCheck.cachedAt = cachedStatus.cachedAt;
        cloudinaryCheck.nextVerification = cachedStatus.nextVerification;
        
        if (cachedStorage) {
          cloudinaryCheck.storage = 
            cachedStorage.bytesUsedDisplay + ' / ' + cachedStorage.bytesQuotaDisplay;
          cloudinaryCheck.storageData = cachedStorage;
        }
      }
    } catch (cloudinaryError) {
      console.warn('⚠️ Cloudinary health check error:', cloudinaryError.message);
      cloudinaryCheck.status = 'degraded';
      cloudinaryCheck.message = `Cloudinary error: ${cloudinaryError.message}`;
      cloudinaryCheck.responseTime = 0;
    }

    // Check Email Service
    let emailCheck = {
      status: 'healthy',
      responseTime: 0,
      message: 'Email service operational',
      lastChecked: new Date().toISOString()
    };

    try {
      // Use rate limiter to avoid hitting Google's rate limits
      if (emailRateLimiter.shouldVerify()) {
        console.log('📧 Email service verification due (>2 hours since last check)');
        const emailStartTime = Date.now();
        
        if (!mailService.initialized) {
          await mailService.initialize();
        }
        
        // Verify email connection with Google
        try {
          await mailService.verifyConnection();
          const responseTime = Date.now() - emailStartTime;
          emailRateLimiter.updateCache('healthy', 'Email service connected and verified', responseTime);
          const cachedStatus = emailRateLimiter.getCachedStatus();
          emailCheck = {
            status: 'healthy',
            responseTime,
            message: 'Email service connected and operational (verified)',
            lastChecked: new Date().toISOString(),
            cachedAt: cachedStatus?.cachedAt,
            nextVerification: cachedStatus?.nextVerification
          };
          console.log('✅ Email service health check passed');
        } catch (verifyError) {
          const responseTime = Date.now() - emailStartTime;
          emailRateLimiter.updateCache('degraded', `Email verification failed: ${verifyError.message}`, responseTime);
          const cachedStatus = emailRateLimiter.getCachedStatus();
          emailCheck = {
            status: 'degraded',
            responseTime,
            message: `Email service warning: ${verifyError.message}`,
            lastChecked: new Date().toISOString(),
            cachedAt: cachedStatus?.cachedAt,
            nextVerification: cachedStatus?.nextVerification
          };
          console.warn('⚠️ Email service verification failed:', verifyError.message);
        }
      } else {
        // Use cached status to avoid rate limiting
        const cachedStatus = emailRateLimiter.getStatusWithCacheInfo();
        console.log('📧 Using cached email status (next verification in 2 hours)');
        emailCheck = {
          status: cachedStatus.status,
          responseTime: 0,
          message: `${cachedStatus.message} (cached - last check ${cachedStatus.timeSinceLastCheck})`,
          lastChecked: new Date().toISOString(),
          isCached: true,
          cachedAt: cachedStatus.cachedAt,
          nextVerification: cachedStatus.nextVerification
        };
      }
    } catch (emailError) {
      console.warn('⚠️ Email service health check error:', emailError.message);
      emailCheck = {
        status: 'degraded',
        responseTime: 0,
        message: `Email service error: ${emailError.message}`,
        lastChecked: new Date().toISOString()
      };
    }

    // Calculate overall status
    const statuses = [serverCheck.status, mongodbCheck.status, cloudinaryCheck.status, emailCheck.status];
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
      cloudinary: cloudinaryCheck.status,
      email: emailCheck.status
    });

    res.json({
      success: true,
      health: {
        server: serverCheck,
        mongodb: mongodbCheck,
        cloudinary: cloudinaryCheck,
        email: emailCheck,
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
/**
 * Get detailed storage information
 */
export const getStorageInfo = async (req, res) => {
  try {
    const database = getDB();
    const storageInfo = {
      mongodb: {},
      cloudinary: {}
    };

    // Get MongoDB storage info
    try {
      const dbStats = await database.stats();
      
      storageInfo.mongodb = {
        status: 'healthy',
        dataSize: dbStats.dataSize,
        dataSizeDisplay: `${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`,
        storageSize: dbStats.storageSize,
        storageSizeDisplay: `${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB`,
        collections: dbStats.collections,
        indexes: dbStats.indexes,
        avgObjSize: dbStats.avgObjSize
      };
      console.log('✅ MongoDB storage info retrieved');
    } catch (mongoError) {
      console.error('❌ Failed to get MongoDB storage info:', mongoError.message);
      storageInfo.mongodb = {
        status: 'error',
        message: mongoError.message
      };
    }

    // Get Cloudinary storage info
    try {
      if (cloudinaryRateLimiter.shouldVerify()) {
        // Perform fresh verification
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
          storageInfo.cloudinary = {
            status: 'not_configured',
            message: 'Cloudinary credentials not configured'
          };
        } else {
          const response = await axios.get(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/usage`, {
            auth: {
              username: process.env.CLOUDINARY_API_KEY,
              password: process.env.CLOUDINARY_API_SECRET
            },
            timeout: 5000
          });

          if (response.data) {
            const bytesUsed = response.data.bytes_used || 0;
            const bytesQuota = response.data.bytes_quota || 0;
            const creditsUsed = response.data.credits_used || 0;
            const creditsTotal = response.data.credits || 0;
            
            const storageData = {
              status: 'healthy',
              storage: {
                bytesUsed,
                bytesUsedDisplay: `${(bytesUsed / 1024 / 1024 / 1024).toFixed(2)} GB`,
                bytesQuota,
                bytesQuotaDisplay: `${(bytesQuota / 1024 / 1024 / 1024).toFixed(2)} GB`,
                usagePercent: bytesQuota ? ((bytesUsed / bytesQuota) * 100).toFixed(2) + '%' : 'N/A'
              },
              credits: {
                total: creditsTotal,
                used: creditsUsed,
                remaining: creditsTotal - creditsUsed,
                usagePercent: creditsTotal ? ((creditsUsed / creditsTotal) * 100).toFixed(2) + '%' : 'N/A'
              },
              resources: response.data.resources || 0,
              transformations: response.data.transformations || 0
            };
            
            storageInfo.cloudinary = storageData;
            cloudinaryRateLimiter.updateCache('healthy', 'Cloudinary storage retrieved', 0, storageData);
            console.log('✅ Cloudinary storage info retrieved');
          }
        }
      } else {
        // Use cached data
        const cachedStorage = cloudinaryRateLimiter.getCachedStorage();
        if (cachedStorage) {
          storageInfo.cloudinary = {
            ...cachedStorage,
            cached: true,
            timeSinceLastCheck: cloudinaryRateLimiter.getTimeSinceLastCheck()
          };
          console.log('☁️ Using cached Cloudinary storage info');
        } else {
          storageInfo.cloudinary = {
            status: 'unknown',
            message: 'Cloudinary storage not yet checked'
          };
        }
      }
    } catch (cloudinaryError) {
      // Handle rate limiting gracefully
      if (cloudinaryError.response?.status === 420) {
        console.warn('⚠️ Cloudinary rate limit (420) - returning cached storage data');
        const cachedStorage = cloudinaryRateLimiter.getCachedStorage();
        storageInfo.cloudinary = cachedStorage || {
          status: 'rate_limited',
          message: 'API rate limited - please try again later',
          cached: true
        };
      } else {
        console.error('❌ Failed to get Cloudinary storage info:', cloudinaryError.message);
        storageInfo.cloudinary = {
          status: 'error',
          message: cloudinaryError.message
        };
      }
    }

    res.json({
      success: true,
      storage: storageInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Storage info error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve storage information',
      error: error.message
    });
  }
};

/**
 * Get security insights and threat analysis
 */
export const getSecurityInsights = async (req, res) => {
  try {
    const database = getDB();
    const securityCollection = database.collection('securityEvents');
    const authLogsCollection = database.collection('authLogs');
    
    // Get date ranges for analysis (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get brute force attempts (failed logins from same IP)
    const failedLogins = await authLogsCollection
      .find({
        eventType: 'LOGIN_FAILED',
        timestamp: { $gte: sevenDaysAgo }
      })
      .toArray();

    const bruteForceMap = {};
    failedLogins.forEach(log => {
      const key = `${log.ip}`;
      if (!bruteForceMap[key]) {
        bruteForceMap[key] = {
          ip: log.ip,
          attempts: 0,
          lastOccurrence: log.timestamp,
          emails: []
        };
      }
      bruteForceMap[key].attempts++;
      if (log.email && !bruteForceMap[key].emails.includes(log.email)) {
        bruteForceMap[key].emails.push(log.email);
      }
    });

    const bruteForceThreats = Object.values(bruteForceMap)
      .filter(threat => threat.attempts > 5) // Flag if more than 5 attempts
      .map(threat => ({
        timestamp: threat.lastOccurrence,
        ip: threat.ip,
        attempts: threat.attempts,
        targets: threat.emails
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    // Get suspicious logins (unusual locations/times)
    const allLogins = await authLogsCollection
      .find({
        eventType: 'LOGIN_SUCCESS',
        timestamp: { $gte: sevenDaysAgo }
      })
      .toArray();

    const suspiciousLogins = allLogins
      .filter(login => {
        // Flag logins with no userAgent as suspicious
        return !login.userAgent || login.userAgent.includes('curl') || login.userAgent.includes('Postman');
      })
      .map(login => ({
        timestamp: login.timestamp,
        ip: login.ip,
        username: login.email || 'unknown',
        userAgent: login.userAgent || 'none',
        location: 'Detected'
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    // Get security events
    const securityEvents = await securityCollection
      .find({
        timestamp: { $gte: sevenDaysAgo }
      })
      .toArray();

    const permissionViolations = securityEvents
      .filter(event => event.severity === 'HIGH' || event.severity === 'CRITICAL')
      .map(event => ({
        timestamp: event.timestamp,
        adminId: event.details?.userId || 'unknown',
        action: event.eventType,
        resource: event.details?.resource || 'unknown',
        details: event.description
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    // Calculate security score
    let securityScore = 100;
    securityScore -= Math.min(bruteForceThreats.length * 5, 30); // Max -30 for brute force
    securityScore -= Math.min(suspiciousLogins.length * 3, 20); // Max -20 for suspicious logins
    securityScore -= Math.min(permissionViolations.length * 2, 20); // Max -20 for violations
    securityScore = Math.max(securityScore, 0);

    // Determine overall security status
    let securityStatus = 'excellent';
    if (securityScore >= 80) securityStatus = 'excellent';
    else if (securityScore >= 60) securityStatus = 'good';
    else if (securityScore >= 40) securityStatus = 'warning';
    else securityStatus = 'critical';

    const insights = {
      securityScore,
      status: securityStatus,
      totalSuspiciousActivities: bruteForceThreats.length + suspiciousLogins.length + permissionViolations.length,
      lockedAccounts: 0, // Can be enhanced with actual account lockout data
      threats: {
        bruteForce: {
          count: bruteForceThreats.length,
          logs: bruteForceThreats,
          lastOccurrence: bruteForceThreats.length > 0 ? bruteForceThreats[0].timestamp : null
        },
        suspiciousLogin: {
          count: suspiciousLogins.length,
          logs: suspiciousLogins,
          lastOccurrence: suspiciousLogins.length > 0 ? suspiciousLogins[0].timestamp : null
        },
        permissionViolation: {
          count: permissionViolations.length,
          logs: permissionViolations,
          lastOccurrence: permissionViolations.length > 0 ? permissionViolations[0].timestamp : null
        }
      }
    };

    res.json({
      success: true,
      insights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Security insights error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve security insights',
      error: error.message
    });
  }
};
/**
 * Test email service by sending a test email
 * @route POST /api/health/test-email
 */
export const testEmailService = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    console.log('📧 Testing email service...');
    console.log(`   Target email: ${email}`);
    console.log(`   Mail service initialized: ${mailService.initialized}`);

    if (!mailService.initialized) {
      console.log('   Initializing mail service...');
      await mailService.initialize();
    }

    const testResult = await mailService.sendOrderStatusUpdateEmail(email, {
      orderId: '507f1f77bcf86cd799439011',
      orderNumber: 'TEST-001',
      status: 'shipped',
      items: [
        { name: 'Test Product', quantity: 1, price: 50.00, total: 50.00 }
      ],
      totalAmount: 50.00,
      trackingNumber: 'TRACK123456789',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()
    });

    console.log('📨 Test email result:', testResult);

    if (testResult) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        email: email,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email - check server logs for details'
      });
    }
  } catch (error) {
    console.error('❌ Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing email service',
      error: error.message,
      details: error.toString()
    });
  }
};