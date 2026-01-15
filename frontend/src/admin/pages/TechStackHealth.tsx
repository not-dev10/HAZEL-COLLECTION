import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Server, Database, Cloud, CheckCircle, AlertCircle, XCircle, Mail, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TokenManager from '@/utils/tokenManager';

interface PingData {
  timestamp: string;
  server: number;
  mongodb: number;
  cloudinary: number;
  email: number;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  message: string;
  lastChecked: string;
}

interface StackHealth {
  server: HealthStatus;
  mongodb: HealthStatus;
  cloudinary: HealthStatus;
  email?: HealthStatus;
  overallStatus: 'healthy' | 'degraded' | 'down';
}

interface SecurityInsights {
  securityScore: number;
  status: string;
  totalSuspiciousActivities: number;
  lockedAccounts: number;
  threats: {
    bruteForce: {
      count: number;
      logs: Array<{ timestamp: string; ip: string; attempts: number }>;
      lastOccurrence: string | null;
    };
    suspiciousLogin: {
      count: number;
      logs: Array<{ timestamp: string; ip: string; username: string; location: string; details: string }>;
      lastOccurrence: string | null;
    };
    permissionViolation: {
      count: number;
      logs: Array<{ timestamp: string; adminId: string; action: string; resource: string; details: string }>;
      lastOccurrence: string | null;
    };
  };
}

interface StorageInfo {
  used: number;
  total: number;
  percentage: number;
  collections?: number;
  documents?: number;
}

interface CloudinaryInfo {
  storage: {
    used: number;
    total: number;
    percentage: number;
    bytes: number;
  };
  credits: {
    remaining: number;
    total: number;
    percentage: number;
    status: 'abundant' | 'good' | 'warning' | 'critical';
  };
  bandwidth: {
    used: number;
    total: number;
    percentage: number;
  };
}

const TechStackHealth: React.FC = () => {
  const [health, setHealth] = useState<StackHealth | null>(null);
  const [security, setSecurity] = useState<SecurityInsights | null>(null);
  const [mongoStorage, setMongoStorage] = useState<StorageInfo | null>(null);
  const [cloudinaryInfo, setCloudinaryInfo] = useState<CloudinaryInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [expandedThreats, setExpandedThreats] = useState<{ [key: string]: boolean }>({
    bruteForce: false,
    suspiciousLogin: false,
    permissionViolation: false
  });
  const [pingHistory, setPingHistory] = useState<PingData[]>([]);

  const checkHealth = async () => {
    try {
      setLoading(true);
      console.log('🔍 Checking tech stack health...');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/health`, {
        headers: {
          'Authorization': `Bearer ${TokenManager.getAccessToken()}`
        }
      });

      if (!response.ok) {
        console.warn('⚠️ Health check failed with status:', response.status);
        throw new Error('Failed to fetch health status');
      }

      const data = await response.json();
      console.log('✅ Health check complete:', data);
      setHealth(data.health);
      
      // Add to ping history
      const newPingData: PingData = {
        timestamp: new Date().toLocaleTimeString(),
        server: data.health.server.responseTime,
        mongodb: data.health.mongodb.responseTime,
        cloudinary: data.health.cloudinary.responseTime,
        email: data.health.email?.responseTime || 0
      };
      
      setPingHistory(prev => {
        const updated = [...prev, newPingData];
        // Keep only last 20 data points
        return updated.slice(-20);
      });
      
      // Fetch security insights
      await fetchSecurityInsights();
      
      // Fetch storage information
      await fetchStorageInfo();
    } catch (error) {
      console.error('❌ Error checking health:', error);
      // Set a default error state
      setHealth({
        server: { status: 'down', responseTime: 0, message: 'Unable to connect', lastChecked: new Date().toISOString() },
        mongodb: { status: 'down', responseTime: 0, message: 'Unable to check', lastChecked: new Date().toISOString() },
        cloudinary: { status: 'down', responseTime: 0, message: 'Unable to check', lastChecked: new Date().toISOString() },
        email: { status: 'down', responseTime: 0, message: 'Unable to check', lastChecked: new Date().toISOString() },
        overallStatus: 'down',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityInsights = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/health/security`, {
        headers: {
          'Authorization': `Bearer ${TokenManager.getAccessToken()}`
        }
      });

      if (!response.ok) {
        console.warn('⚠️ Security fetch failed');
        return;
      }

      const data = await response.json();
      setSecurity(data.insights);
    } catch (error) {
      console.error('❌ Error fetching security insights:', error);
    }
  };
  const fetchStorageInfo = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/health/storage`, {
        headers: {
          'Authorization': `Bearer ${TokenManager.getAccessToken()}`
        }
      });

      if (!response.ok) {
        console.warn('⚠️ Storage fetch failed');
        return;
      }

      const data = await response.json();
      
      // Transform MongoDB data to match StorageInfo interface
      if (data.storage?.mongodb) {
        const mongoData = data.storage.mongodb;
        setMongoStorage({
          used: mongoData.dataSize || 0,
          total: mongoData.storageSize || 0,
          percentage: mongoData.storageSize ? ((mongoData.dataSize / mongoData.storageSize) * 100) : 0,
          collections: mongoData.collections,
          documents: mongoData.collections // Will be updated if we have document count
        });
      }
      
      // Transform Cloudinary data to match CloudinaryInfo interface
      if (data.storage?.cloudinary && data.storage.cloudinary.status === 'healthy') {
        const cloudData = data.storage.cloudinary;
        setCloudinaryInfo({
          storage: {
            used: cloudData.storage.bytesUsed || 0,
            total: cloudData.storage.bytesQuota || 0,
            percentage: cloudData.storage.bytesQuota ? ((cloudData.storage.bytesUsed / cloudData.storage.bytesQuota) * 100) : 0,
            bytes: cloudData.storage.bytesUsed || 0
          },
          credits: {
            remaining: cloudData.credits.remaining || 0,
            total: cloudData.credits.total || 0,
            percentage: cloudData.credits.total ? ((cloudData.credits.remaining / cloudData.credits.total) * 100) : 0,
            status: cloudData.credits.remaining > (cloudData.credits.total * 0.75) ? 'abundant' :
                    cloudData.credits.remaining > (cloudData.credits.total * 0.50) ? 'good' :
                    cloudData.credits.remaining > (cloudData.credits.total * 0.25) ? 'warning' : 'critical'
          },
          bandwidth: {
            used: cloudData.resources || 0,
            total: 1000000, // Placeholder
            percentage: 0
          }
        });
      }
    } catch (error) {
      console.error('❌ Error fetching storage info:', error);
    }
  };
  useEffect(() => {
    // Initial check
    checkHealth();
    
    // Automatic health check every 1 second
    const interval = setInterval(() => {
      checkHealth();
    }, 1000); // Update every 1 second

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Degraded</Badge>;
      case 'down':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Down</Badge>;
      default:
        return null;
    }
  };

  const ServiceCard = ({ 
    icon: Icon, 
    label, 
    status, 
    responseTime, 
    message 
  }: { 
    icon: any; 
    label: string; 
    status: string; 
    responseTime: number; 
    message: string;
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-gray-600" />
            <CardTitle className="text-lg">{label}</CardTitle>
          </div>
          {getStatusBadge(status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <span className="text-sm text-muted-foreground">{message}</span>
        </div>
        {responseTime > 0 && (
          <div className="text-xs text-gray-500">
            Response time: <span className="font-semibold">{responseTime}ms</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const StorageCard = ({ 
    label, 
    used, 
    total, 
    percentage, 
    icon: Icon,
    color = 'blue'
  }: { 
    label: string; 
    used: number; 
    total: number; 
    percentage: number; 
    icon: any;
    color?: string;
  }) => {
    const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const getColorClass = () => {
      if (percentage >= 90) return 'bg-red-600';
      if (percentage >= 75) return 'bg-orange-600';
      if (percentage >= 50) return 'bg-yellow-600';
      return 'bg-green-600';
    };

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="w-6 h-6 text-gray-600" />
              <CardTitle className="text-lg">{label}</CardTitle>
            </div>
            <Badge className={`bg-blue-100 text-blue-800 hover:bg-blue-100`}>
              {percentage.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all ${getColorClass()}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Used: <span className="font-semibold">{formatBytes(used)}</span></span>
              <span className="text-gray-600">Total: <span className="font-semibold">{formatBytes(total)}</span></span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tech Stack Health</h1>
          <p className="text-muted-foreground mt-1">Monitor your application infrastructure - Updates every second</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={checkHealth} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Overall Status Card */}
      {health && (
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Overall Status</CardTitle>
                <CardDescription>System-wide health indicator</CardDescription>
              </div>
              {getStatusBadge(health.overallStatus)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {getStatusIcon(health.overallStatus)}
              <div>
                <p className="font-medium capitalize">
                  {health.overallStatus === 'healthy' && '✅ All systems operational'}
                  {health.overallStatus === 'degraded' && '⚠️ Some services experiencing issues'}
                  {health.overallStatus === 'down' && '🔴 Critical services down'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Last checked: {new Date(health.server.lastChecked).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Ping Graph */}
      {pingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Live Response Time Graph</CardTitle>
            <CardDescription>Service response times over the last {pingHistory.length} checks (ms)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pingHistory} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value) => `${value}ms`}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="server" 
                  stroke="#3b82f6" 
                  dot={false}
                  strokeWidth={2}
                  name="Server"
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="mongodb" 
                  stroke="#10b981" 
                  dot={false}
                  strokeWidth={2}
                  name="MongoDB"
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="cloudinary" 
                  stroke="#f59e0b" 
                  dot={false}
                  strokeWidth={2}
                  name="Cloudinary"
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="email" 
                  stroke="#ec4899" 
                  dot={false}
                  strokeWidth={2}
                  name="Email Service"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Service Status Cards */}
      {health ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ServiceCard
            icon={Server}
            label="Server"
            status={health.server.status}
            responseTime={health.server.responseTime}
            message={health.server.message}
          />
          <ServiceCard
            icon={Database}
            label="MongoDB"
            status={health.mongodb.status}
            responseTime={health.mongodb.responseTime}
            message={health.mongodb.message}
          />
          <ServiceCard
            icon={Cloud}
            label="Cloudinary"
            status={health.cloudinary.status}
            responseTime={health.cloudinary.responseTime}
            message={health.cloudinary.message}
          />
          <ServiceCard
            icon={Mail}
            label="Email Service"
            status={health.email?.status || 'unknown'}
            responseTime={health.email?.responseTime || 0}
            message={health.email?.message || 'Email service status'}
          />
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          {loading ? 'Checking health status...' : 'Unable to fetch health status'}
        </div>
      )}

      {/* Details Card */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>Detailed health information for each service</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Server className="w-4 h-4" /> Server Status
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{health.server.message}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{health.server.responseTime}ms</p>
                  </div>
                </div>
              </div>
              <div className="border-b pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Database className="w-4 h-4" /> MongoDB Connection
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{health.mongodb.message}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{health.mongodb.responseTime}ms</p>
                  </div>
                </div>
              </div>
              <div className="border-b pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Cloud className="w-4 h-4" /> Cloudinary API
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{health.cloudinary.message}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{health.cloudinary.responseTime}ms</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email Service
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{health.email?.message || 'No email service configured'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{health.email?.responseTime || 0}ms</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Storage Monitoring Section */}
      {(mongoStorage || cloudinaryInfo) && (
        <>
          <div className="border-t pt-8 mt-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Database className="w-6 h-6" /> Storage & Resources
            </h2>
          </div>

          {/* MongoDB Storage */}
          {mongoStorage && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">MongoDB Database Storage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StorageCard
                  icon={Database}
                  label="MongoDB Storage"
                  used={mongoStorage.used}
                  total={mongoStorage.total}
                  percentage={mongoStorage.percentage}
                  color="emerald"
                />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Database Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Collections:</span>
                      <span className="font-semibold text-lg">{mongoStorage.collections || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Documents:</span>
                      <span className="font-semibold text-lg">{mongoStorage.documents || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Cloudinary Storage & Credits */}
          {cloudinaryInfo && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Cloudinary Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Storage */}
                <StorageCard
                  icon={Cloud}
                  label="Cloudinary Storage"
                  used={cloudinaryInfo.storage.used}
                  total={cloudinaryInfo.storage.total}
                  percentage={cloudinaryInfo.storage.percentage}
                  color="amber"
                />

                {/* Credits */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">API Credits</CardTitle>
                      <Badge className={`${
                        cloudinaryInfo.credits.status === 'abundant' ? 'bg-green-100 text-green-800' :
                        cloudinaryInfo.credits.status === 'good' ? 'bg-blue-100 text-blue-800' :
                        cloudinaryInfo.credits.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {cloudinaryInfo.credits.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-3 rounded-full transition-all ${
                            cloudinaryInfo.credits.percentage >= 75 ? 'bg-green-600' :
                            cloudinaryInfo.credits.percentage >= 50 ? 'bg-blue-600' :
                            cloudinaryInfo.credits.percentage >= 25 ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${Math.min(cloudinaryInfo.credits.percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Remaining: <span className="font-semibold">{cloudinaryInfo.credits.remaining}</span></span>
                        <span className="text-gray-600">Total: <span className="font-semibold">{cloudinaryInfo.credits.total}</span></span>
                      </div>
                      <div className="text-center pt-2 border-t">
                        <p className="text-xs text-gray-500">{cloudinaryInfo.credits.percentage.toFixed(1)}% Credits Remaining</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bandwidth */}
                <StorageCard
                  icon={Cloud}
                  label="Monthly Bandwidth"
                  used={cloudinaryInfo.bandwidth.used}
                  total={cloudinaryInfo.bandwidth.total}
                  percentage={cloudinaryInfo.bandwidth.percentage}
                  color="purple"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Security Insights Section */}
      {security && (
        <>
          <div className="border-t pt-8 mt-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6" /> Security Insights
            </h2>
          </div>

          {/* Security Score Card */}
          <Card className="border-2 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Security Score</CardTitle>
                  <CardDescription>Overall system security health</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-purple-600">{security.securityScore}</div>
                  <Badge className={`mt-2 ${
                    security.status === 'excellent' ? 'bg-green-100 text-green-800' :
                    security.status === 'good' ? 'bg-blue-100 text-blue-800' :
                    security.status === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                    security.status === 'poor' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {security.status?.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    security.securityScore >= 80 ? 'bg-green-600' :
                    security.securityScore >= 60 ? 'bg-blue-600' :
                    security.securityScore >= 40 ? 'bg-yellow-600' :
                    security.securityScore >= 20 ? 'bg-orange-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${security.securityScore}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Based on suspicious activities, locked accounts, and threat levels
              </p>
            </CardContent>
          </Card>

          {/* Security Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{security.totalSuspiciousActivities}</p>
                  <p className="text-sm text-muted-foreground mt-2">Suspicious Activities</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">{security.lockedAccounts}</p>
                  <p className="text-sm text-muted-foreground mt-2">Locked Accounts</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{security.threats.bruteForce.count}</p>
                  <p className="text-sm text-muted-foreground mt-2">Brute Force Attempts</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600">{security.threats.suspiciousLogin.count}</p>
                  <p className="text-sm text-muted-foreground mt-2">Suspicious Logins</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Threat Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Threat Summary & Logs</CardTitle>
              <CardDescription>Security threats detected in the system with detailed logs and timestamps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Brute Force Attempts */}
              <div className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedThreats(prev => ({ ...prev, bruteForce: !prev.bruteForce }))}
                  className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 transition border-b border-red-200"
                >
                  <div className="flex items-center gap-3">
                    <Badge className="bg-red-100 text-red-800">{security.threats.bruteForce.count}</Badge>
                    <span className="font-medium">Brute Force Attempts</span>
                  </div>
                  <span className={`transform transition ${expandedThreats.bruteForce ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {expandedThreats.bruteForce && (
                  <div className="p-4 bg-white space-y-2">
                    {security.threats.bruteForce.logs.length > 0 ? (
                      security.threats.bruteForce.logs.map((log, idx) => (
                        <div key={idx} className="text-sm border-l-2 border-red-300 pl-3 py-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">IP: {log.ip}</p>
                              <p className="text-xs text-gray-600">Attempts: {log.attempts}</p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No brute force attempts detected</p>
                    )}
                  </div>
                )}
              </div>

              {/* Suspicious Login Activities */}
              <div className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedThreats(prev => ({ ...prev, suspiciousLogin: !prev.suspiciousLogin }))}
                  className="w-full flex items-center justify-between p-4 bg-yellow-50 hover:bg-yellow-100 transition border-b border-yellow-200"
                >
                  <div className="flex items-center gap-3">
                    <Badge className="bg-yellow-100 text-yellow-800">{security.threats.suspiciousLogin.count}</Badge>
                    <span className="font-medium">Suspicious Login Activities</span>
                  </div>
                  <span className={`transform transition ${expandedThreats.suspiciousLogin ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {expandedThreats.suspiciousLogin && (
                  <div className="p-4 bg-white space-y-2">
                    {security.threats.suspiciousLogin.logs.length > 0 ? (
                      security.threats.suspiciousLogin.logs.map((log, idx) => (
                        <div key={idx} className="text-sm border-l-2 border-yellow-300 pl-3 py-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium">{log.username}</p>
                              <p className="text-xs text-gray-600">IP: {log.ip}</p>
                              <p className="text-xs text-gray-600">Location: {log.location}</p>
                              <p className="text-xs text-gray-700 mt-1 italic">{log.details}</p>
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No suspicious login activities detected</p>
                    )}
                  </div>
                )}
              </div>

              {/* Permission Violations */}
              <div className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedThreats(prev => ({ ...prev, permissionViolation: !prev.permissionViolation }))}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition border-b border-blue-200"
                >
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-100 text-blue-800">{security.threats.permissionViolation.count}</Badge>
                    <span className="font-medium">Permission Violations</span>
                  </div>
                  <span className={`transform transition ${expandedThreats.permissionViolation ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {expandedThreats.permissionViolation && (
                  <div className="p-4 bg-white space-y-2">
                    {security.threats.permissionViolation.logs.length > 0 ? (
                      security.threats.permissionViolation.logs.map((log, idx) => (
                        <div key={idx} className="text-sm border-l-2 border-blue-300 pl-3 py-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium">{log.action}</p>
                              <p className="text-xs text-gray-600">Admin ID: {log.adminId}</p>
                              <p className="text-xs text-gray-600">Resource: {log.resource}</p>
                              <p className="text-xs text-gray-700 mt-1 italic">{log.details}</p>
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No permission violations detected</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default TechStackHealth;
