import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Server, Database, Cloud, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

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
  overallStatus: 'healthy' | 'degraded' | 'down';
}

const TechStackHealth: React.FC = () => {
  const [health, setHealth] = useState<StackHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const checkHealth = async () => {
    try {
      setLoading(true);
      console.log('🔍 Checking tech stack health...');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/health`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        console.warn('⚠️ Health check failed with status:', response.status);
        throw new Error('Failed to fetch health status');
      }

      const data = await response.json();
      console.log('✅ Health check complete:', data);
      setHealth(data.health);
    } catch (error) {
      console.error('❌ Error checking health:', error);
      // Set a default error state
      setHealth({
        server: { status: 'down', responseTime: 0, message: 'Unable to connect', lastChecked: new Date().toISOString() },
        mongodb: { status: 'down', responseTime: 0, message: 'Unable to check', lastChecked: new Date().toISOString() },
        cloudinary: { status: 'down', responseTime: 0, message: 'Unable to check', lastChecked: new Date().toISOString() },
        overallStatus: 'down',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing health status...');
      checkHealth();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tech Stack Health</h1>
          <p className="text-muted-foreground mt-1">Monitor your application infrastructure</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {autoRefresh ? 'Auto-refreshing' : 'Auto-refresh'}
          </Button>
          <Button onClick={checkHealth} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Check Now
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

      {/* Service Status Cards */}
      {health ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div>
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TechStackHealth;
