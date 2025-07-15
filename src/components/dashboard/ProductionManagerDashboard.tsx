
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WelcomeHeader } from '@/components/welcome/WelcomeHeader';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Factory,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Activity
} from 'lucide-react';

const productionData = [
  { day: 'Mon', planned: 1200, actual: 1150, efficiency: 95.8 },
  { day: 'Tue', planned: 1200, actual: 1280, efficiency: 106.7 },
  { day: 'Wed', planned: 1200, actual: 1100, efficiency: 91.7 },
  { day: 'Thu', planned: 1200, actual: 1320, efficiency: 110.0 },
  { day: 'Fri', planned: 1200, actual: 1190, efficiency: 99.2 },
];

const machineStatusData = [
  { name: 'Running', value: 8, color: '#22c55e' },
  { name: 'Idle', value: 2, color: '#f59e0b' },
  { name: 'Maintenance', value: 1, color: '#ef4444' },
];

const recentAlerts = [
  { id: 1, machine: 'Injection Molding #3', issue: 'Temperature threshold exceeded', severity: 'high', time: '2 min ago' },
  { id: 2, machine: 'Extrusion Line #1', issue: 'Low material level', severity: 'medium', time: '15 min ago' },
  { id: 3, machine: 'Quality Station #2', issue: 'Defect rate above normal', severity: 'high', time: '32 min ago' },
];

export function ProductionManagerDashboard() {
  return (
    <div className="space-y-6">
      <WelcomeHeader />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="metric-card bg-gradient-to-br from-blue-600/20 to-blue-700/20 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Today's Production</CardTitle>
            <Factory className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1,285</div>
            <div className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-green-400">+12.5%</span>
              <span className="text-gray-400 ml-1">vs target</span>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card bg-gradient-to-br from-green-600/20 to-green-700/20 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Overall Efficiency</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">94.2%</div>
            <Progress value={94.2} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="metric-card bg-gradient-to-br from-emerald-600/20 to-emerald-700/20 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Machines</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">8/11</div>
            <div className="text-sm text-gray-400">3 in maintenance</div>
          </CardContent>
        </Card>

        <Card className="metric-card bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Defect Rate</CardTitle>
            <Package className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">2.1%</div>
            <div className="flex items-center text-sm">
              <TrendingDown className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-green-400">-0.3%</span>
              <span className="text-gray-400 ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Chart */}
        <Card className="betaflow-card">
          <CardHeader>
            <CardTitle className="text-white">Weekly Production Overview</CardTitle>
            <CardDescription>Planned vs Actual Production</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }} 
                />
                <Bar dataKey="planned" fill="#6b7280" name="Planned" />
                <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Machine Status */}
        <Card className="betaflow-card">
          <CardHeader>
            <CardTitle className="text-white">Machine Status Distribution</CardTitle>
            <CardDescription>Current operational status of all machines</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={machineStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {machineStatusData.map((entry, index) => (
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
              {machineStatusData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-400">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card className="betaflow-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
            Recent Alerts
          </CardTitle>
          <CardDescription>Real-time notifications from production floor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800/70 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                      {alert.severity}
                    </Badge>
                    <span className="font-medium text-white">{alert.machine}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{alert.issue}</p>
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {alert.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
