
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  ShoppingCart,
  Plus,
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Calendar
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

interface CustomerOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  status: OrderStatus;
  total_amount: number | null;
  order_date: string;
  delivery_date: string | null;
  notes: string | null;
  created_at: string;
}

export function SalesOrders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const { toast } = useToast();

  // New order form state
  const [newOrder, setNewOrder] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    total_amount: '',
    delivery_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    try {
      const orderNumber = `ORD-${Date.now()}`;
      
      const { error } = await supabase
        .from('customer_orders')
        .insert({
          order_number: orderNumber,
          customer_name: newOrder.customer_name,
          customer_email: newOrder.customer_email || null,
          customer_phone: newOrder.customer_phone || null,
          customer_address: newOrder.customer_address || null,
          total_amount: newOrder.total_amount ? parseFloat(newOrder.total_amount) : null,
          delivery_date: newOrder.delivery_date || null,
          notes: newOrder.notes || null
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Order created successfully'
      });

      setIsDialogOpen(false);
      setNewOrder({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
        total_amount: '',
        delivery_date: '',
        notes: ''
      });
      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create order',
        variant: 'destructive'
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('customer_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Order status updated successfully'
      });

      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-blue-400" />;
      case 'in_production': return <Package className="h-4 w-4 text-purple-400" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'shipped': return <Truck className="h-4 w-4 text-blue-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-red-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'confirmed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'in_production': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'shipped': return 'bg-blue-600/10 text-blue-500 border-blue-600/20';
      case 'delivered': return 'bg-green-600/10 text-green-500 border-green-600/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Sales & Orders</h1>
          <p className="text-gray-400">Manage customer orders and track sales performance</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 hover-scale">
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Order</DialogTitle>
              <DialogDescription>
                Add a new customer order to the system
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name" className="text-gray-300">Customer Name</Label>
                  <Input
                    id="customer_name"
                    value={newOrder.customer_name}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, customer_name: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="customer_email" className="text-gray-300">Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={newOrder.customer_email}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, customer_email: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_phone" className="text-gray-300">Phone</Label>
                  <Input
                    id="customer_phone"
                    value={newOrder.customer_phone}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, customer_phone: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="total_amount" className="text-gray-300">Total Amount</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    value={newOrder.total_amount}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, total_amount: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="customer_address" className="text-gray-300">Address</Label>
                <Input
                  id="customer_address"
                  value={newOrder.customer_address}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, customer_address: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="delivery_date" className="text-gray-300">Delivery Date</Label>
                <Input
                  id="delivery_date"
                  type="date"
                  value={newOrder.delivery_date}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, delivery_date: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="notes" className="text-gray-300">Notes</Label>
                <Textarea
                  id="notes"
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, notes: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createOrder} className="bg-blue-600 hover:bg-blue-700">
                Create Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="betaflow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_production">In Production</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order, index) => (
          <Card key={order.id} className="betaflow-card hover:bg-gray-800/40 transition-all duration-200 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <h3 className="font-semibold text-white">{order.order_number}</h3>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} border`}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Select
                    value={order.status}
                    onValueChange={(value) => updateOrderStatus(order.id, value as OrderStatus)}
                  >
                    <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="in_production">In Production</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Customer</p>
                  <p className="text-white font-medium">{order.customer_name}</p>
                  {order.customer_email && (
                    <p className="text-gray-400 text-xs">{order.customer_email}</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-400">Amount</p>
                  <p className="text-white font-medium">
                    {order.total_amount ? `$${order.total_amount.toLocaleString()}` : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Order Date</p>
                  <p className="text-white font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(order.order_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Delivery Date</p>
                  <p className="text-white font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
              </div>

              {order.notes && (
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-400 text-xs">Notes</p>
                  <p className="text-white text-sm">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredOrders.length === 0 && (
          <Card className="betaflow-card">
            <CardContent className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Orders Found</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No orders match your current filters' 
                  : 'Start by creating your first customer order'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Order
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center">
                {getStatusIcon(selectedOrder.status)}
                <span className="ml-2">{selectedOrder.order_number}</span>
              </DialogTitle>
              <DialogDescription>
                Order details and customer information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Customer Name</Label>
                  <p className="text-white">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Status</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={`${getStatusColor(selectedOrder.status)} border`}>
                      {selectedOrder.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
              {selectedOrder.customer_email && (
                <div>
                  <Label className="text-gray-400">Email</Label>
                  <p className="text-white">{selectedOrder.customer_email}</p>
                </div>
              )}
              {selectedOrder.customer_phone && (
                <div>
                  <Label className="text-gray-400">Phone</Label>
                  <p className="text-white">{selectedOrder.customer_phone}</p>
                </div>
              )}
              {selectedOrder.customer_address && (
                <div>
                  <Label className="text-gray-400">Address</Label>
                  <p className="text-white">{selectedOrder.customer_address}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Total Amount</Label>
                  <p className="text-white">{selectedOrder.total_amount ? `$${selectedOrder.total_amount.toLocaleString()}` : 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Delivery Date</Label>
                  <p className="text-white">{selectedOrder.delivery_date ? new Date(selectedOrder.delivery_date).toLocaleDateString() : 'Not set'}</p>
                </div>
              </div>
              {selectedOrder.notes && (
                <div>
                  <Label className="text-gray-400">Notes</Label>
                  <p className="text-white">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
