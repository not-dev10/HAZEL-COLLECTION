import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  MessageSquare,
  Star,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Send,
} from 'lucide-react';

// Types
interface Review {
  id: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  helpful: number;
}

interface SupportQuery {
  id: string;
  ticketId: string;
  customerId: string;
  customerName: string;
  category: 'billing' | 'shipping' | 'product' | 'general' | 'return';
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  dateCreated: string;
  lastUpdated: string;
  responses: Response[];
}

interface Response {
  id: string;
  from: 'customer' | 'admin';
  message: string;
  date: string;
}

// Sample Data
const sampleReviews: Review[] = [
  {
    id: '1',
    productId: 'P001',
    productName: 'Summer Dress',
    customerId: 'C001',
    customerName: 'Sarah Johnson',
    rating: 5,
    title: 'Perfect fit and amazing quality!',
    comment: 'The dress is exactly as described. Great material and fits perfectly. Highly recommend!',
    status: 'approved',
    date: '2024-01-20',
    helpful: 24,
  },
  {
    id: '2',
    productId: 'P002',
    productName: 'Casual T-Shirt',
    customerId: 'C002',
    customerName: 'Mike Davis',
    rating: 4,
    title: 'Good quality, runs small',
    comment: 'Nice t-shirt but runs a bit small. I ordered a size up and it fits well now.',
    status: 'approved',
    date: '2024-01-19',
    helpful: 12,
  },
  {
    id: '3',
    productId: 'P003',
    productName: 'Denim Jeans',
    customerId: 'C003',
    customerName: 'Emma Wilson',
    rating: 3,
    title: 'Decent but color faded quickly',
    comment: 'Jeans are comfortable but the color started fading after a few washes.',
    status: 'pending',
    date: '2024-01-21',
    helpful: 5,
  },
  {
    id: '4',
    productId: 'P001',
    productName: 'Summer Dress',
    customerId: 'C004',
    customerName: 'Lisa Chen',
    rating: 2,
    title: 'Material quality issues',
    comment: 'The seams came apart after first wear. Not satisfied with this purchase.',
    status: 'pending',
    date: '2024-01-22',
    helpful: 3,
  },
];

const sampleQueries: SupportQuery[] = [
  {
    id: '1',
    ticketId: 'TKT-001',
    customerId: 'C001',
    customerName: 'Sarah Johnson',
    category: 'shipping',
    subject: 'Order not received after 2 weeks',
    message: 'I ordered item PD-001 on Jan 1st but havent received it yet. Can you please check the status?',
    status: 'in-progress',
    priority: 'high',
    dateCreated: '2024-01-15',
    lastUpdated: '2024-01-22',
    responses: [
      {
        id: 'R1',
        from: 'admin',
        message: 'Thank you for contacting us. We are looking into your order status. We will update you within 24 hours.',
        date: '2024-01-16',
      },
      {
        id: 'R2',
        from: 'customer',
        message: 'Still waiting for the update. This is urgent as I need it for an event.',
        date: '2024-01-20',
      },
    ],
  },
  {
    id: '2',
    ticketId: 'TKT-002',
    customerId: 'C002',
    customerName: 'Mike Davis',
    category: 'product',
    subject: 'Defective item received',
    message: 'The t-shirt I received has a hole in it. I need a replacement immediately.',
    status: 'open',
    priority: 'high',
    dateCreated: '2024-01-22',
    lastUpdated: '2024-01-22',
    responses: [],
  },
  {
    id: '3',
    ticketId: 'TKT-003',
    customerId: 'C003',
    customerName: 'Emma Wilson',
    category: 'billing',
    subject: 'Wrong amount charged',
    message: 'I was charged £150 but the order total was £120. Can you please refund the difference?',
    status: 'resolved',
    priority: 'medium',
    dateCreated: '2024-01-10',
    lastUpdated: '2024-01-18',
    responses: [
      {
        id: 'R1',
        from: 'admin',
        message: 'We have processed a refund of £30 to your original payment method. It should appear within 3-5 business days.',
        date: '2024-01-18',
      },
    ],
  },
  {
    id: '4',
    ticketId: 'TKT-004',
    customerId: 'C004',
    customerName: 'Lisa Chen',
    category: 'return',
    subject: 'Return request for wrong size',
    message: 'I ordered size M but received L. Can I return it for the correct size?',
    status: 'closed',
    priority: 'medium',
    dateCreated: '2024-01-05',
    lastUpdated: '2024-01-12',
    responses: [
      {
        id: 'R1',
        from: 'admin',
        message: 'We have sent you a return label. Please ship the item back within 7 days.',
        date: '2024-01-06',
      },
      {
        id: 'R2',
        from: 'customer',
        message: 'Item returned. When will I get my replacement?',
        date: '2024-01-10',
      },
      {
        id: 'R3',
        from: 'admin',
        message: 'Your replacement has been shipped. Tracking number: TRACK123456',
        date: '2024-01-12',
      },
    ],
  },
];

const SupportReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [queries, setQueries] = useState<SupportQuery[]>([]);
  const [searchReviews, setSearchReviews] = useState('');
  const [searchQueries, setSearchQueries] = useState('');
  const [filterReviewStatus, setFilterReviewStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [filterQueryStatus, setFilterQueryStatus] = useState<'all' | 'open' | 'in-progress' | 'resolved' | 'closed'>('all');
  const [selectedQuery, setSelectedQuery] = useState<SupportQuery | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Fetch reviews from backend
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.warn('No admin token found in localStorage');
        setReviews([]);
        setLoadingReviews(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized - token may be invalid');
          setReviews([]);
        } else if (response.status === 403) {
          console.error('Forbidden - admin access required');
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
        setLoadingReviews(false);
        return;
      }

      const data = await response.json();
      if (data.success) {
        console.log('✅ Admin reviews fetched successfully:', {
          count: data.count,
          reviews: data.reviews
        });
        // Transform backend reviews to match UI format
        const transformedReviews = data.reviews.map((review: any) => ({
          id: review._id,
          productId: review.productId,
          productName: 'Product', // Note: backend doesn't include product name, you may want to fetch it
          customerId: review.customerId,
          customerName: review.customerName,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          status: review.status,
          date: new Date(review.createdAt).toISOString().split('T')[0],
          helpful: review.helpful
        }));
        setReviews(transformedReviews);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.customerName.toLowerCase().includes(searchReviews.toLowerCase()) ||
                         review.productName.toLowerCase().includes(searchReviews.toLowerCase());
    const matchesStatus = filterReviewStatus === 'all' || review.status === filterReviewStatus;
    return matchesSearch && matchesStatus;
  });

  // Filter queries
  const filteredQueries = queries.filter(query => {
    const matchesSearch = query.customerName.toLowerCase().includes(searchQueries.toLowerCase()) ||
                         query.ticketId.toLowerCase().includes(searchQueries.toLowerCase()) ||
                         query.subject.toLowerCase().includes(searchQueries.toLowerCase());
    const matchesStatus = filterQueryStatus === 'all' || query.status === filterQueryStatus;
    return matchesSearch && matchesStatus;
  });

  // Review handlers
  const handleApproveReview = async (id: string) => {
    try {
      console.log('✅ Approving review:', id);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'approved' })
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Review approved successfully:', data.review);
        setReviews(reviews.map(review => 
          review.id === id ? { ...review, status: 'approved' } : review
        ));
        setShowSuccessMsg(true);
        setTimeout(() => setShowSuccessMsg(false), 3000);
      } else {
        console.warn('⚠️ Failed to approve review:', data.message);
      }
    } catch (error) {
      console.error('❌ Failed to approve review:', error);
    }
  };

  const handleRejectReview = async (id: string) => {
    try {
      console.log('❌ Rejecting review:', id);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Review rejected successfully:', data.review);
        setReviews(reviews.map(review => 
          review.id === id ? { ...review, status: 'rejected' } : review
        ));
        setShowSuccessMsg(true);
        setTimeout(() => setShowSuccessMsg(false), 3000);
      } else {
        console.warn('⚠️ Failed to reject review:', data.message);
      }
    } catch (error) {
      console.error('❌ Failed to reject review:', error);
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      console.log('🗑️ Deleting review:', id);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Review deleted successfully');
        setReviews(reviews.filter(review => review.id !== id));
        setShowSuccessMsg(true);
        setTimeout(() => setShowSuccessMsg(false), 3000);
      } else {
        console.warn('⚠️ Failed to delete review:', data.message);
      }
    } catch (error) {
      console.error('❌ Failed to delete review:', error);
    }
  };

  // Query handlers
  const handleUpdateQueryStatus = (id: string, newStatus: SupportQuery['status']) => {
    console.log('📋 Updating query status:', { queryId: id, newStatus });
    const updatedQuery = queries.find(q => q.id === id);
    setQueries(queries.map(query => 
      query.id === id ? { ...query, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] } : query
    ));
    console.log('✅ Query status updated successfully:', {
      ticketId: updatedQuery?.ticketId,
      oldStatus: updatedQuery?.status,
      newStatus
    });
    setShowSuccessMsg(true);
    setTimeout(() => setShowSuccessMsg(false), 3000);
  };

  const handleSendResponse = () => {
    if (!selectedQuery || !responseMessage.trim()) {
      console.warn('⚠️ Cannot send response - missing query or message');
      return;
    }

    console.log('💬 Sending response to ticket:', {
      ticketId: selectedQuery.ticketId,
      messageLength: responseMessage.length
    });

    const updatedQueries = queries.map(query => {
      if (query.id === selectedQuery.id) {
        return {
          ...query,
          responses: [
            ...query.responses,
            {
              id: `R${query.responses.length + 1}`,
              from: 'admin' as const,
              message: responseMessage,
              date: new Date().toISOString().split('T')[0],
            },
          ],
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      }
      return query;
    });

    setQueries(updatedQueries);
    setSelectedQuery(updatedQueries.find(q => q.id === selectedQuery.id) || null);
    setResponseMessage('');
    console.log('✅ Response sent successfully to ticket:', selectedQuery.ticketId);
    setShowSuccessMsg(true);
    setTimeout(() => setShowSuccessMsg(false), 3000);
  };

  const handleDeleteQuery = (id: string) => {
    console.log('🗑️ Deleting support ticket:', id);
    const deletedQuery = queries.find(q => q.id === id);
    setQueries(queries.filter(query => query.id !== id));
    setSelectedQuery(null);
    console.log('✅ Support ticket deleted successfully:', {
      ticketId: deletedQuery?.ticketId,
      subject: deletedQuery?.subject
    });
    setShowSuccessMsg(true);
    setTimeout(() => setShowSuccessMsg(false), 3000);
  };

  // Get stats
  const reviewStats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    avgRating: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
  };

  const queryStats = {
    total: queries.length,
    open: queries.filter(q => q.status === 'open').length,
    inProgress: queries.filter(q => q.status === 'in-progress').length,
    resolved: queries.filter(q => q.status === 'resolved').length,
    closed: queries.filter(q => q.status === 'closed').length,
  };

  // Log stats on load
  console.log('📊 Support & Reviews Dashboard Stats:', {
    reviews: reviewStats,
    queries: queryStats
  });

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccessMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={18} />
          Operation completed successfully!
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewStats.total}</div>
            <p className="text-xs text-gray-500 mt-1">Average Rating: ⭐ {reviewStats.avgRating}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{reviewStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Queries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queryStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open Tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{queryStats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>In Progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{queryStats.inProgress}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Star size={16} /> Reviews
          </TabsTrigger>
          <TabsTrigger value="queries" className="flex items-center gap-2">
            <MessageSquare size={16} /> Support Queries
          </TabsTrigger>
        </TabsList>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Product Reviews</CardTitle>
              <CardDescription>Manage and moderate customer reviews</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 flex-col md:flex-row">
                <Input
                  placeholder="Search by product name or customer..."
                  value={searchReviews}
                  onChange={(e) => setSearchReviews(e.target.value)}
                  className="flex-1"
                />
                <Select value={filterReviewStatus} onValueChange={(value: any) => setFilterReviewStatus(value)}>
                  <SelectTrigger className="md:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reviews Table */}
              <div className="overflow-x-auto">
                {loadingReviews ? (
                  <div className="text-center py-8 text-muted-foreground">Loading reviews...</div>
                ) : filteredReviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No reviews found</div>
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Review Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReviews.map(review => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">{review.productName}</TableCell>
                        <TableCell>{review.customerName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {'⭐'.repeat(review.rating)}
                            <span className="text-gray-500">({review.rating}/5)</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{review.title}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              review.status === 'approved' ? 'default' :
                              review.status === 'pending' ? 'secondary' :
                              'destructive'
                            }
                          >
                            {review.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{review.date}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye size={16} />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Review Details</DialogTitle>
                                  <DialogDescription>
                                    {review.productName} by {review.customerName}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="font-semibold">Rating</label>
                                    <div>{'⭐'.repeat(review.rating)} ({review.rating}/5)</div>
                                  </div>
                                  <div>
                                    <label className="font-semibold">Title</label>
                                    <p>{review.title}</p>
                                  </div>
                                  <div>
                                    <label className="font-semibold">Comment</label>
                                    <p className="text-gray-600">{review.comment}</p>
                                  </div>
                                  <div>
                                    <label className="font-semibold">Helpful Count</label>
                                    <p>{review.helpful} users found this helpful</p>
                                  </div>
                                  {review.status === 'pending' && (
                                    <div className="flex gap-2 pt-4 border-t">
                                      <Button 
                                        onClick={() => handleApproveReview(review.id)}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                      >
                                        Approve
                                      </Button>
                                      <Button 
                                        onClick={() => handleRejectReview(review.id)}
                                        variant="destructive"
                                        className="flex-1"
                                      >
                                        Reject
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 size={16} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Review</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This review will be permanently deleted. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="flex gap-2">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteReview(review.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Queries Tab */}
        <TabsContent value="queries" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Manage customer support queries and tickets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 flex-col md:flex-row">
                <Input
                  placeholder="Search by ticket ID, customer name, or subject..."
                  value={searchQueries}
                  onChange={(e) => setSearchQueries(e.target.value)}
                  className="flex-1"
                />
                <Select value={filterQueryStatus} onValueChange={(value: any) => setFilterQueryStatus(value)}>
                  <SelectTrigger className="md:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Queries Table */}
              <div className="overflow-x-auto">
                {queries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No support tickets yet.</p>
                    <p className="text-sm mt-2">Support queries backend integration coming soon.</p>
                  </div>
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQueries.map(query => (
                      <TableRow key={query.id}>
                        <TableCell className="font-medium">{query.ticketId}</TableCell>
                        <TableCell>{query.customerName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{query.category}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{query.subject}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              query.status === 'open' ? 'destructive' :
                              query.status === 'in-progress' ? 'secondary' :
                              'default'
                            }
                          >
                            {query.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={query.priority === 'high' ? 'destructive' : 'secondary'}
                          >
                            {query.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{query.dateCreated}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedQuery(query)}>
                                  <MessageSquare size={16} />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{query.ticketId} - {query.subject}</DialogTitle>
                                  <DialogDescription>
                                    {query.customerName} • {query.category} • Status: {query.status}
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                  {/* Original Message */}
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-semibold text-sm text-gray-600">Original Message</p>
                                    <p className="text-sm text-gray-600 mt-1">{query.message}</p>
                                  </div>

                                  {/* Conversation */}
                                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                    {query.responses.map(response => (
                                      <div 
                                        key={response.id}
                                        className={`p-3 rounded-lg ${response.from === 'admin' ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'}`}
                                      >
                                        <p className="text-xs font-semibold text-gray-600 mb-1">
                                          {response.from === 'admin' ? '👤 Support Team' : '👥 Customer'} • {response.date}
                                        </p>
                                        <p className="text-sm text-gray-700">{response.message}</p>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Status Update */}
                                  <div className="space-y-2 border-t pt-4">
                                    <label className="text-sm font-semibold">Update Status</label>
                                    <Select value={query.status} onValueChange={(status) => handleUpdateQueryStatus(query.id, status as any)}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Response Message */}
                                  {query.status !== 'closed' && (
                                    <div className="space-y-2 border-t pt-4">
                                      <label className="text-sm font-semibold">Send Response</label>
                                      <Textarea
                                        placeholder="Type your response here..."
                                        value={responseMessage}
                                        onChange={(e) => setResponseMessage(e.target.value)}
                                        className="min-h-24 resize-none"
                                      />
                                      <Button 
                                        onClick={handleSendResponse}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                                        disabled={!responseMessage.trim()}
                                      >
                                        <Send size={16} className="mr-2" /> Send Response
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 size={16} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This support ticket will be permanently deleted. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="flex gap-2">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteQuery(query.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportReviews;
