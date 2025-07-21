import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WelcomeHeader } from '@/components/welcome/WelcomeHeader';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  Users,
  FileText,
  AlertCircle,
  Download
} from 'lucide-react';
import dashboardBg from '@/assets/dashboard-bg.jpg';

const salesData = [
  { month: 'Jan', revenue: 164000, orders: 420 },
  { month: 'Feb', revenue: 178000, orders: 465 },
  { month: 'Mar', revenue: 185000, orders: 480 },
  { month: 'Apr', revenue: 198000, orders: 520 },
  { month: 'May', revenue: 215000, orders: 580 },
  { month: 'Jun', revenue: 245000, orders: 635 },
];

const inventoryAlerts = [
  { item: 'PET Plastic Granules', level: 2450, minLevel: 5000, status: 'low' },
  { item: 'HDPE Resin Grade A', level: 850, minLevel: 2000, status: 'critical' },
  { item: 'Production Labels', level: 15600, minLevel: 8000, status: 'good' },
];

const recentOrders = [
  { id: 'ORD-2024-0548', customer: 'AquaPure Industries', amount: 28750, status: 'processing', date: '2024-01-15' },
  { id: 'ORD-2024-0549', customer: 'FreshFlow Corp', amount: 19300, status: 'shipped', date: '2024-01-15' },
  { id: 'ORD-2024-0550', customer: 'CleanBottle Solutions', amount: 34800, status: 'pending', date: '2024-01-16' },
];

export function AdminExecutiveDashboard() {
  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
        style={{ backgroundImage: `url(${dashboardBg})` }}
      />
      <div className="relative z-10 space-y-6">
        <WelcomeHeader />

      {/* Key Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="metric-card bg-gradient-to-br from-green-600/20 to-green-700/20 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white animate-fade-in">$245,000</div>
            <div className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-green-400">+18.2%</span>
              <span className="text-gray-400 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card bg-gradient-to-br from-blue-600/20 to-blue-700/20 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white animate-fade-in">42</div>
            <div className="text-sm text-gray-400">18 pending, 24 in progress</div>
          </CardContent>
        </Card>

        <Card className="metric-card bg-gradient-to-br from-purple-600/20 to-purple-700/20 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Inventory Items</CardTitle>
            <Package className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white animate-fade-in">284</div>
            <div className="text-sm text-red-400">2 critical stock alerts</div>
          </CardContent>
        </Card>

        <Card className="metric-card bg-gradient-to-br from-orange-600/20 to-orange-700/20 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white animate-fade-in">48</div>
            <div className="text-sm text-gray-400">3 shifts, 16 per shift</div>
          </CardContent>
        </Card>
      </div>

      {/* Sales & Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="betaflow-card">
          <CardHeader>
            <CardTitle className="text-white">Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="betaflow-card">
          <CardHeader>
            <CardTitle className="text-white">Order Volume</CardTitle>
            <CardDescription>Monthly order count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }} 
                />
                <Bar dataKey="orders" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Orders & Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="betaflow-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <ShoppingCart className="h-5 w-5 text-blue-400 mr-2" />
              Recent Orders
            </CardTitle>
            <CardDescription>Latest customer orders and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-white">{order.id}</h3>
                      <Badge 
                        variant={order.status === 'shipped' ? 'default' : order.status === 'processing' ? 'secondary' : 'outline'}
                        className={
                          order.status === 'shipped' ? 'bg-green-500/10 text-green-400' :
                          order.status === 'processing' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-yellow-500/10 text-yellow-400'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{order.customer}</p>
                    <p className="text-sm text-gray-500">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{order.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 border-blue-500 text-blue-400 hover:bg-blue-500/10">
              View All Orders
            </Button>
          </CardContent>
        </Card>

        {/* Inventory Alerts */}
        <Card className="betaflow-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
              Inventory Alerts
            </CardTitle>
            <CardDescription>Stock levels requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventoryAlerts.map((item, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border ${
                    item.status === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                    item.status === 'low' ? 'bg-yellow-500/10 border-yellow-500/20' :
                    'bg-green-500/10 border-green-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{item.item}</h3>
                      <p className="text-sm text-gray-400">
                        Current: {item.level} | Min: {item.minLevel}
                      </p>
                    </div>
                    <Badge 
                      variant={item.status === 'critical' ? 'destructive' : item.status === 'low' ? 'default' : 'secondary'}
                      className={
                        item.status === 'critical' ? 'bg-red-500 text-white' :
                        item.status === 'low' ? 'bg-yellow-500 text-black' :
                        'bg-green-500 text-white'
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 border-purple-500 text-purple-400 hover:bg-purple-500/10">
              <Package className="h-4 w-4 mr-2" />
              View Full Inventory
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reports Section */}
      <Card className="betaflow-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileText className="h-5 w-5 text-green-400 mr-2" />
            Quick Reports
          </CardTitle>
          <CardDescription>Generate and download business reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center justify-center p-4 h-auto border-green-500 text-green-400 hover:bg-green-500/10">
              <div className="text-center">
                <Download className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Sales Report</div>
                <div className="text-xs text-gray-400">Monthly sales data</div>
              </div>
            </Button>
            <Button variant="outline" className="flex items-center justify-center p-4 h-auto border-blue-500 text-blue-400 hover:bg-blue-500/10">
              <div className="text-center">
                <Download className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Production Report</div>
                <div className="text-xs text-gray-400">Manufacturing metrics</div>
              </div>
            </Button>
            <Button variant="outline" className="flex items-center justify-center p-4 h-auto border-purple-500 text-purple-400 hover:bg-purple-500/10">
              <div className="text-center">
                <Download className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Inventory Report</div>
                <div className="text-xs text-gray-400">Stock levels & alerts</div>
              </div>
            </Button>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
