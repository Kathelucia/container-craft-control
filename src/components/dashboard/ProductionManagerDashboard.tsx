
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  Play, Pause, Square, AlertTriangle, TrendingUp, TrendingDown,
  Settings, Users, Clock, Target, Factory, Package, Zap, Calendar,
  Activity, CheckCircle
} from 'lucide-react';
import { WelcomeHeader } from '@/components/welcome/WelcomeHeader';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductionBatch {
  id: string;
  batch_number: string;
  products: { name: string; sku: string };
  machines: { name: string; status: string };
  target_quantity: number;
  produced_quantity: number;
  status: string;
  scheduled_start: string;
  actual_start: string;
  shift: string;
}

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: string;
  alert_type: string;
  created_at: string;
}

interface DashboardMetrics {
  totalBatches: number;
  activeBatches: number;
  completedToday: number;
  efficiency: number;
  rejectedUnits: number;
  downtime: number;
}

const ProductionManagerDashboard = () => {
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalBatches: 0,
    activeBatches: 0,
    completedToday: 0,
    efficiency: 0,
    rejectedUnits: 0,
    downtime: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Sample production data for charts
  const productionData = [
    { day: 'Mon', planned: 100, actual: 95, efficiency: 95 },
    { day: 'Tue', planned: 120, actual: 118, efficiency: 98 },
    { day: 'Wed', planned: 110, actual: 105, efficiency: 95 },
    { day: 'Thu', planned: 130, actual: 135, efficiency: 104 },
    { day: 'Fri', planned: 115, actual: 112, efficiency: 97 },
    { day: 'Sat', planned: 90, actual: 88, efficiency: 98 },
    { day: 'Sun', planned: 80, actual: 82, efficiency: 103 }
  ];

  const machineUtilization = [
    { name: 'Machine A', value: 85, color: '#0088FE' },
    { name: 'Machine B', value: 92, color: '#00C49F' },
    { name: 'Machine C', value: 78, color: '#FFBB28' },
    { name: 'Machine D', value: 96, color: '#FF8042' },
    { name: 'Machine E', value: 65, color: '#8884D8' }
  ];

  const machineStatusData = [
    { name: 'Running', value: 8, color: '#22c55e' },
    { name: 'Idle', value: 2, color: '#f59e0b' },
    { name: 'Maintenance', value: 1, color: '#ef4444' },
  ];

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time subscription for alerts
    const alertsChannel = supabase
      .channel('production-alerts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'production_alerts' },
        () => fetchAlerts()
      )
      .subscribe();

    // Set up real-time subscription for batches
    const batchesChannel = supabase
      .channel('production-batches')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'production_batches' },
        () => fetchBatches()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(alertsChannel);
      supabase.removeChannel(batchesChannel);
    };
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    await Promise.all([fetchBatches(), fetchAlerts(), fetchMetrics()]);
    setLoading(false);
  };

  const fetchBatches = async () => {
    const { data, error } = await supabase
      .from('production_batches')
      .select(`
        *,
        products (name, sku),
        machines (name, status)
      `)
      .order('scheduled_start', { ascending: true });

    if (error) {
      toast({ title: "Error", description: "Failed to fetch production batches", variant: "destructive" });
    } else {
      setBatches(data || []);
    }
  };

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('production_alerts')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      toast({ title: "Error", description: "Failed to fetch alerts", variant: "destructive" });
    } else {
      setAlerts(data || []);
    }
  };

  const fetchMetrics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch batch metrics
      const { data: batchData } = await supabase
        .from('production_batches')
        .select('status, target_quantity, produced_quantity, rejected_quantity');

      if (batchData) {
        const totalBatches = batchData.length;
        const activeBatches = batchData.filter(b => b.status === 'in_progress').length;
        const completedToday = batchData.filter(b => b.status === 'completed').length;
        
        const totalTarget = batchData.reduce((sum, b) => sum + (b.target_quantity || 0), 0);
        const totalProduced = batchData.reduce((sum, b) => sum + (b.produced_quantity || 0), 0);
        const efficiency = totalTarget > 0 ? Math.round((totalProduced / totalTarget) * 100) : 0;
        
        const rejectedUnits = batchData.reduce((sum, b) => sum + (b.rejected_quantity || 0), 0);

        setMetrics({
          totalBatches,
          activeBatches,
          completedToday,
          efficiency,
          rejectedUnits,
          downtime: 45 // Mock data
        });
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const updateBatchStatus = async (batchId: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    
    if (newStatus === 'in_progress' && !batches.find(b => b.id === batchId)?.actual_start) {
      updates.actual_start = new Date().toISOString();
    }

    const { error } = await supabase
      .from('production_batches')
      .update(updates)
      .eq('id', batchId);

    if (error) {
      toast({ title: "Error", description: "Failed to update batch status", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Batch status updated successfully" });
      fetchBatches();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'in_progress': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'paused': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
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
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800/70 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                      {alert.severity}
                    </Badge>
                    <span className="font-medium text-white">{alert.title}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{alert.message}</p>
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(alert.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionManagerDashboard;
