import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Shield, AlertTriangle, Activity, Trash2, Calendar, Download } from 'lucide-react';
import TokenManager from '@/utils/tokenManager';

interface AuditLog {
  _id?: string;
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  ip: string;
  userId?: string;
  email?: string;
}

interface AuthLog {
  _id?: string;
  timestamp: string;
  eventType: string;
  email: string;
  ip: string;
  userAgent: string;
}

interface SecurityEvent {
  _id?: string;
  timestamp: string;
  eventType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
}

interface StorageStats {
  auditLogs: {
    count: number;
    sizeBytes: number;
    sizeMB: string;
  };
  authLogs: {
    count: number;
    sizeBytes: number;
    sizeMB: string;
  };
  securityEvents: {
    count: number;
    sizeBytes: number;
    sizeMB: string;
  };
}

const SecurityAndLogs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'auth' | 'security' | 'storage'>('audit');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/logs/audit?startDate=${dateRange.start}&endDate=${dateRange.end}&limit=100`,
        {
          headers: { Authorization: `Bearer ${TokenManager.getAccessToken()}` }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/logs/auth?startDate=${dateRange.start}&endDate=${dateRange.end}&limit=100`,
        {
          headers: { Authorization: `Bearer ${TokenManager.getAccessToken()}` }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setAuthLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch auth logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/logs/security?startDate=${dateRange.start}&endDate=${dateRange.end}&limit=100`,
        {
          headers: { Authorization: `Bearer ${TokenManager.getAccessToken()}` }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSecurityEvents(data.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStorageStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/logs/storage`, {
        headers: { Authorization: `Bearer ${TokenManager.getAccessToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStorageStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch storage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearOldLogs = async () => {
    if (!confirm('Are you sure? This will delete logs older than 90 days. This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/logs/clear-old`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TokenManager.getAccessToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ daysOld: 90 })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ ${data.message}`);
        await fetchStorageStats();
      } else {
        alert('Failed to clear logs');
      }
    } catch (error) {
      console.error('Failed to clear logs:', error);
      alert('Error clearing logs');
    } finally {
      setLoading(false);
    }
  };

  const exportData = (data: any[], filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-600 text-white';
      case 'HIGH':
        return 'bg-orange-600 text-white';
      case 'MEDIUM':
        return 'bg-yellow-600 text-white';
      case 'LOW':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getStatusCodeColor = (code: number) => {
    if (code < 300) return 'text-green-600';
    if (code < 400) return 'text-blue-600';
    if (code < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    } else if (activeTab === 'auth') {
      fetchAuthLogs();
    } else if (activeTab === 'security') {
      fetchSecurityEvents();
    } else if (activeTab === 'storage') {
      fetchStorageStats();
    }
  }, [activeTab, dateRange]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8" />
          Security & Logs
        </h1>
        <Button onClick={() => {
          if (activeTab === 'audit') fetchAuditLogs();
          else if (activeTab === 'auth') fetchAuthLogs();
          else if (activeTab === 'security') fetchSecurityEvents();
          else fetchStorageStats();
        }} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {(['audit', 'auth', 'security', 'storage'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Date Range Filter */}
      {activeTab !== 'storage' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filter by Date Range</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                className="border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                className="border rounded px-3 py-2"
              />
            </div>
            <Button>
              <Calendar className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Audit Logs
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportData(auditLogs, 'audit-logs.json')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardTitle>
            <CardDescription>API requests and activity log ({auditLogs.length} entries)</CardDescription>
          </CardHeader>
          <CardContent>
            {auditLogs.length === 0 ? (
              <p className="text-gray-500">No audit logs found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left">Timestamp</th>
                      <th className="px-4 py-2 text-left">Method</th>
                      <th className="px-4 py-2 text-left">Path</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Duration</th>
                      <th className="px-4 py-2 text-left">IP</th>
                      <th className="px-4 py-2 text-left">User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-2">
                          <Badge variant="secondary">{log.method}</Badge>
                        </td>
                        <td className="px-4 py-2 font-mono text-xs">{log.path}</td>
                        <td className={`px-4 py-2 font-bold ${getStatusCodeColor(log.statusCode)}`}>
                          {log.statusCode}
                        </td>
                        <td className="px-4 py-2">{log.duration}ms</td>
                        <td className="px-4 py-2 font-mono text-xs">{log.ip}</td>
                        <td className="px-4 py-2">{log.email || log.userId || 'Guest'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Auth Logs Tab */}
      {activeTab === 'auth' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Authentication Logs
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportData(authLogs, 'auth-logs.json')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardTitle>
            <CardDescription>Login and authentication events ({authLogs.length} entries)</CardDescription>
          </CardHeader>
          <CardContent>
            {authLogs.length === 0 ? (
              <p className="text-gray-500">No auth logs found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left">Timestamp</th>
                      <th className="px-4 py-2 text-left">Event</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">IP</th>
                      <th className="px-4 py-2 text-left">User Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {authLogs.map((log, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-2">
                          <Badge variant={log.eventType.includes('SUCCESS') ? 'default' : 'destructive'}>
                            {log.eventType}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">{log.email}</td>
                        <td className="px-4 py-2 font-mono text-xs">{log.ip}</td>
                        <td className="px-4 py-2 text-xs">{log.userAgent || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Events Tab */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Security Events
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportData(securityEvents, 'security-events.json')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardTitle>
            <CardDescription>Security threats and violations ({securityEvents.length} events)</CardDescription>
          </CardHeader>
          <CardContent>
            {securityEvents.length === 0 ? (
              <p className="text-green-600 font-medium">✅ No security events detected</p>
            ) : (
              <div className="space-y-4">
                {securityEvents.map((event, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                          <span className="font-semibold">{event.eventType}</span>
                        </div>
                        <p className="text-gray-700 mb-2">{event.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Storage Stats Tab */}
      {activeTab === 'storage' && (
        <div className="space-y-4">
          {storageStats && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Audit Logs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{storageStats.auditLogs.count}</p>
                    <p className="text-sm text-gray-500">entries</p>
                    <p className="text-lg font-semibold text-blue-600 mt-2">
                      {storageStats.auditLogs.sizeMB}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Auth Logs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{storageStats.authLogs.count}</p>
                    <p className="text-sm text-gray-500">entries</p>
                    <p className="text-lg font-semibold text-blue-600 mt-2">
                      {storageStats.authLogs.sizeMB}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Security Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{storageStats.securityEvents.count}</p>
                    <p className="text-sm text-gray-500">entries</p>
                    <p className="text-lg font-semibold text-red-600 mt-2">
                      {storageStats.securityEvents.sizeMB}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    Log Cleanup
                    <Button
                      variant="destructive"
                      onClick={handleClearOldLogs}
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Logs Older Than 90 Days
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Automatically deletes logs older than 90 days to save storage space
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    ⚠️ This action cannot be undone. Make sure you have backups if needed.
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SecurityAndLogs;
