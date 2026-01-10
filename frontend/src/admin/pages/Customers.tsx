import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Mail, Phone, MessageSquare, MapPin, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  joinDate: string;
  lastPurchase: string;
}

const Customers: React.FC = () => {
  const [customers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1-234-567-8901',
      totalOrders: 5,
      totalSpent: 349.95,
      status: 'active',
      joinDate: '2023-06-15',
      lastPurchase: '2024-01-05',
    },
    {
      id: '2',
      name: 'Emma Davis',
      email: 'emma@example.com',
      phone: '+1-234-567-8902',
      totalOrders: 3,
      totalSpent: 189.97,
      status: 'active',
      joinDate: '2023-09-22',
      lastPurchase: '2024-01-06',
    },
    {
      id: '3',
      name: 'Jessica Miller',
      email: 'jessica@example.com',
      phone: '+1-234-567-8903',
      totalOrders: 8,
      totalSpent: 599.92,
      status: 'active',
      joinDate: '2023-03-10',
      lastPurchase: '2024-01-07',
    },
    {
      id: '4',
      name: 'Amanda Wilson',
      email: 'amanda@example.com',
      phone: '+1-234-567-8904',
      totalOrders: 1,
      totalSpent: 49.99,
      status: 'inactive',
      joinDate: '2023-12-01',
      lastPurchase: '2023-12-10',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filteredCustomers = customers.filter(customer =>
    (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.includes(searchTerm)) &&
    (!filterStatus || customer.status === filterStatus)
  );

  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'active').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    averageOrderValue: customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.reduce((sum, c) => sum + c.totalOrders, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Customers</h2>
        <p className="text-gray-600 mt-1">Manage and track customer information.</p>
      </div>

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
              <div className="text-3xl font-bold mt-2">${stats.totalRevenue.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <div className="text-3xl font-bold mt-2">${stats.averageOrderValue.toFixed(2)}</div>
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Last Purchase</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map(customer => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell className="text-gray-600">{customer.email}</TableCell>
                        <TableCell className="text-gray-600">{customer.phone}</TableCell>
                        <TableCell className="font-semibold">{customer.totalOrders}</TableCell>
                        <TableCell className="font-semibold">${customer.totalSpent.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{customer.joinDate}</TableCell>
                        <TableCell className="text-sm">{customer.lastPurchase}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye size={16} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
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
                                      <p className="text-sm text-gray-600">Status</p>
                                      <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                                        {customer.status}
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
                                      <p className="text-3xl font-bold">${customer.totalSpent.toFixed(2)}</p>
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Customers;
