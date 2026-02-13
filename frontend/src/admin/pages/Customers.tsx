import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Mail, Phone, MessageSquare, MapPin, Eye, Loader2, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import TokenManager from '@/utils/tokenManager';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  joinDate: string;
  lastPurchase: string;
  accountCreated: string;
  lastLogin: string;
  preferredCategory: string;
  loyalty: 'bronze' | 'silver' | 'gold' | 'platinum';
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get admin token from TokenManager
        const adminToken = TokenManager.getAccessToken();
        if (!adminToken) {
          console.warn('No admin token found in localStorage');
          setError('Admin authentication required');
          setLoading(false);
          return;
        }

        console.log('📥 Fetching customers with token:', adminToken.substring(0, 20) + '...');

        // Build query parameters
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (filterStatus) params.append('status', filterStatus);
        params.append('limit', '100'); // Fetch all customers for now

        const url = `${API_BASE_URL}/api/customers?${params}`;
        console.log('📍 API URL:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          }
        });

        console.log('📊 Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.text();
          console.error('❌ Response error:', errorData);
          
          if (response.status === 401) {
            setError('Unauthorized - please login as admin');
          } else {
            setError(`Failed to fetch customers (${response.status})`);
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log('✅ Customers data received:', data);

        if (data.success && data.data) {
          console.log(`📦 Loaded ${data.data.length} customers`);
          setCustomers(data.data);
        } else if (Array.isArray(data)) {
          console.log(`📦 Loaded ${data.length} customers (direct array)`);
          setCustomers(data);
        } else {
          console.warn('⚠️ No customers found:', data);
          setError(data.message || 'No customers found');
        }
      } catch (err) {
        console.error('❌ Error fetching customers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch customers');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus]);

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      setDeleting(true);
      const adminToken = TokenManager.getAccessToken();
      
      if (!adminToken) {
        setError('Admin authentication required');
        setDeleteConfirm(null);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Failed to delete customer';
        setError(errorMessage);
        toast.error(errorMessage);
        setDeleteConfirm(null);
        setDeleting(false);
        return;
      }

      // Remove customer from list
      setCustomers(customers.filter(c => c.id !== customerId));
      setDeleteConfirm(null);
      toast.success('✅ Customer deleted successfully');
      console.log('✅ Customer deleted successfully');
    } catch (err) {
      console.error('Error deleting customer:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.includes(searchTerm)) &&
    (!filterStatus || customer.status === filterStatus)
  );

  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'active').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    averageOrderValue: customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.reduce((sum, c) => sum + c.totalOrders, 1) : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Customers</h2>
        <p className="text-gray-600 mt-1">Manage and track customer information.</p>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <div className="text-3xl font-bold mt-2">{stats.totalCustomers}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Active Customers</p>
              <div className="text-3xl font-bold text-green-600 mt-2">{stats.activeCustomers}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <div className="text-3xl font-bold mt-2">£{stats.totalRevenue.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <div className="text-3xl font-bold mt-2">£{stats.averageOrderValue.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setFilterStatus(null)}>
            All Customers
          </TabsTrigger>
          <TabsTrigger value="active" onClick={() => setFilterStatus('active')}>
            Active
          </TabsTrigger>
          <TabsTrigger value="inactive" onClick={() => setFilterStatus('inactive')}>
            Inactive
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filterStatus || 'all'}>
          <Card className="mt-4">
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin mr-2" size={24} />
                  <p className="text-gray-600">Loading customers...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Loyalty</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Purchase</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map(customer => (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell className="text-gray-600">{customer.email}</TableCell>
                            <TableCell className="text-gray-600">{customer.phone}</TableCell>
                            <TableCell className="text-gray-600">{customer.city}</TableCell>
                            <TableCell className="font-semibold">{customer.totalOrders}</TableCell>
                            <TableCell className="font-semibold">£{customer.totalSpent.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={
                                customer.loyalty === 'platinum' ? 'default' :
                                customer.loyalty === 'gold' ? 'outline' :
                                customer.loyalty === 'silver' ? 'secondary' : 'outline'
                              }>
                                {customer.loyalty.charAt(0).toUpperCase() + customer.loyalty.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                                {customer.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{customer.lastPurchase}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" title="View details">
                                      <Eye size={16} />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Customer Details</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-6">
                                {/* Personal Info */}
                                <div>
                                  <h4 className="font-semibold mb-4">Personal Information</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-gray-600">Full Name</p>
                                      <p className="font-semibold">{customer.name}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Loyalty Status</p>
                                      <Badge variant={
                                        customer.loyalty === 'platinum' ? 'default' :
                                        customer.loyalty === 'gold' ? 'outline' :
                                        customer.loyalty === 'silver' ? 'secondary' : 'outline'
                                      }>
                                        {customer.loyalty.charAt(0).toUpperCase() + customer.loyalty.slice(1)}
                                      </Badge>
                                    </div>
                                    <div className="col-span-2">
                                      <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <Mail size={16} /> Email
                                      </p>
                                      <p className="font-semibold">{customer.email}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <Phone size={16} /> Phone
                                      </p>
                                      <p className="font-semibold">{customer.phone}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Address Information */}
                                <div className="border-t pt-6">
                                  <h4 className="font-semibold mb-4">Address Information</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                      <p className="text-sm text-gray-600">Street Address</p>
                                      <p className="font-semibold">{customer.address}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">City</p>
                                      <p className="font-semibold">{customer.city}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Country</p>
                                      <p className="font-semibold">{customer.country}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Account Information */}
                                <div className="border-t pt-6">
                                  <h4 className="font-semibold mb-4">Account Information</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-gray-600">Account Created</p>
                                      <p className="font-semibold">{customer.accountCreated}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Last Login</p>
                                      <p className="font-semibold">{customer.lastLogin}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Account Status</p>
                                      <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Preferred Category</p>
                                      <p className="font-semibold">{customer.preferredCategory}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Purchase History */}
                                <div className="border-t pt-6">
                                  <h4 className="font-semibold mb-4">Purchase History</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-gray-600">Total Orders</p>
                                      <p className="text-3xl font-bold">{customer.totalOrders}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Total Spent</p>
                                      <p className="text-3xl font-bold">£{customer.totalSpent.toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Join Date</p>
                                      <p className="font-semibold">{customer.joinDate}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Last Purchase</p>
                                      <p className="font-semibold">{customer.lastPurchase}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="border-t pt-6 flex gap-2">
                                  <Button variant="outline">
                                    <MessageSquare size={16} className="mr-2" /> Send Message
                                  </Button>
                                  <Button variant="outline">
                                    <MapPin size={16} className="mr-2" /> View Orders
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Dialog open={deleteConfirm === customer.id} onOpenChange={(open) => setDeleteConfirm(open ? customer.id : null)}>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="sm" title="Delete customer">
                                <Trash2 size={16} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Customer</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete <strong>{customer.name}</strong>? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleting}>
                                  Cancel
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => handleDeleteCustomer(customer.id)}
                                  disabled={deleting}
                                >
                                  {deleting ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Trash2 className="mr-2" size={16} />}
                                  Delete
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                      ))
                    ) : (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                            No customers found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Customers;
