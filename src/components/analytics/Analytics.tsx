
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  Package,
  Users,
  Zap,
  AlertTriangle
} from 'lucide-react';

const productionData = [
  { month: 'Jan', produced: 1200, target: 1000, efficiency: 120 },
  { month: 'Feb', produced: 1350, target: 1200, efficiency: 112.5 },
  { month: 'Mar', produced: 1100, target: 1300, efficiency: 84.6 },
  { month: 'Apr', produced: 1450, target: 1400, efficiency: 103.6 },
  { month: 'May', produced: 1600, target: 1500, efficiency: 106.7 },
  { month: 'Jun', produced: 1750, target: 1600, efficiency: 109.4 },
];

const machineUtilizationData = [
  { name: 'Injection Molding #1', utilization: 85, downtime: 15, color: '#3b82f6' },
  { name: 'Injection Molding #2', utilization: 92, downtime: 8, color: '#10b981' },
  { name: 'Blow Molding #1', utilization: 78, downtime: 22, color: '#f59e0b' },
  { name: 'Extrusion Line #1', utilization: 88, downtime: 12, color: '#8b5cf6' },
  { name: 'Quality Station #1', utilization: 95, downtime: 5, color: '#06b6d4' },
];

const defectRateData = [
  { week: 'Week 1', rate: 2.1, target: 2.0 },
  { week: 'Week 2', rate: 1.8, target: 2.0 },
  { week: 'Week 3', rate: 2.3, target: 2.0 },
  { week: 'Week 4', rate: 1.9, target: 2.0 },
  { week: 'Week 5', rate: 1.6, target: 2.0 },
  { week: 'Week 6', rate: 2.0, target: 2.0 },
];

const orderStatusData = [
  { name: 'Completed', value: 45, color: '#10b981' },
  { name: 'In Progress', value: 25, color: '#3b82f6' },
  { name: 'Pending', value: 20, color: '#f59e0b' },
  { name: 'Cancelled', value: 10, color: '#ef4444' },
];

export function Analytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

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
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Production insights and performance metrics</p>
        </div>
        <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
          <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="metric-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Overall Efficiency</p>
                <p className="text-2xl font-bold text-white">94.2%</p>
                <div className="flex items-center text-sm mt-1">
                  <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                  <span className="text-green-400">+5.2%</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Production Output</p>
                <p className="text-2xl font-bold text-white">1,750</p>
                <div className="flex items-center text-sm mt-1">
                  <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                  <span className="text-green-400">+9.4%</span>
                </div>
              </div>
              <Package className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Machine Utilization</p>
                <p className="text-2xl font-bold text-white">87.6%</p>
                <div className="flex items-center text-sm mt-1">
                  <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                  <span className="text-green-400">+2.3%</span>
                </div>
              </div>
              <Zap className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Defect Rate</p>
                <p className="text-2xl font-bold text-white">1.9%</p>
                <div className="flex items-center text-sm mt-1">
                  <TrendingDown className="h-4 w-4 text-green-400 mr-1" />
                  <span className="text-green-400">-0.2%</span>
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="betaflow-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="h-5 w-5 text-blue-400 mr-2" />
              Production vs Target
            </CardTitle>
            <CardDescription>Monthly production performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productionData}>
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
                <Bar dataKey="target" fill="#6b7280" name="Target" />
                <Bar dataKey="produced" fill="#3b82f6" name="Produced" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="betaflow-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="h-5 w-5 text-green-400 mr-2" />
              Efficiency Trend
            </CardTitle>
            <CardDescription>Production efficiency over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={productionData}>
                <defs>
                  <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                  dataKey="efficiency" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorEfficiency)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Machine Utilization & Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="betaflow-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="h-5 w-5 text-purple-400 mr-2" />
              Machine Utilization
            </CardTitle>
            <CardDescription>Equipment efficiency and downtime</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {machineUtilizationData.map((machine, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">{machine.name}</span>
                    <span className="text-sm text-gray-400">{machine.utilization}%</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${machine.utilization}%`,
                          backgroundColor: machine.color
                        }}
                      />
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        machine.utilization >= 90 ? 'border-green-500 text-green-400' :
                        machine.utilization >= 80 ? 'border-yellow-500 text-yellow-400' :
                        'border-red-500 text-red-400'
                      }`}
                    >
                      {machine.utilization >= 90 ? 'Excellent' :
                       machine.utilization >= 80 ? 'Good' : 'Needs Attention'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="betaflow-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <PieChartIcon className="h-5 w-5 text-orange-400 mr-2" />
              Order Status Distribution
            </CardTitle>
            <CardDescription>Current order status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {orderStatusData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-400">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Metrics */}
      <Card className="betaflow-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
            Quality Control Metrics
          </CardTitle>
          <CardDescription>Defect rate trends and quality targets</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={defectRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 3]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#ffffff'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#6b7280" 
                strokeDasharray="5 5"
                name="Target"
              />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#f59e0b" 
                strokeWidth={3}
                name="Actual Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card className="betaflow-card">
        <CardHeader>
          <CardTitle className="text-white">Performance Insights</CardTitle>
          <CardDescription>Key observations and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-green-400">Positive Trends</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Production efficiency increased by 5.2%</p>
                    <p className="text-gray-400 text-sm">Consistent improvement over the last 3 months</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Machine utilization above 85%</p>
                    <p className="text-gray-400 text-sm">All critical machines performing well</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingDown className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Defect rate trending downward</p>
                    <p className="text-gray-400 text-sm">Quality improvements showing results</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-yellow-400">Areas for Improvement</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Blow Molding #1 underperforming</p>
                    <p className="text-gray-400 text-sm">Consider maintenance or process optimization</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Week 3 defect rate spike</p>
                    <p className="text-gray-400 text-sm">Investigate root cause and implement controls</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Order processing delays</p>
                    <p className="text-gray-400 text-sm">20% of orders still pending - review workflow</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
