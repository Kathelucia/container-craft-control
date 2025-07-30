import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { WelcomeHeader } from '@/components/welcome/WelcomeHeader';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Factory,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Activity,
  Plus,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Users,
  BarChart3,
  Zap
} from 'lucide-react';

interface ProductionBatch {
  id: string;
  product_name: string;
  batch_number: string;
  target_quantity: number;
  produced_quantity: number;
  status: string;
  machine_name: string;
  progress: number;
  shift: string;
  scheduled_start: string;
  actual_start?: string;
}

interface MachineStatus {
  id: string;
  name: string;
  status: string;
  utilization: number;
  efficiency: number;
}

interface ProductionAlert {
  id: string;
  title: string;
  message: string;
  severity: string;
  created_at: string;
  alert_type: string;
}

export function ProductionManagerDashboard() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [machines, setMachines] = useState<MachineStatus[]>([]);
  const [alerts, setAlerts] = useState<ProductionAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Sample data for charts (in production, this would come from real-time data)
  const productionData = [
    { day: 'Mon', planned: 1200, actual: 1150, efficiency: 95.8 },
    { day: 'Tue', planned: 1200, actual: 1280, efficiency: 106.7 },
    { day: 'Wed', planned: 1200, actual: 1100, efficiency: 91.7 },
    { day: 'Thu', planned: 1200, actual: 1320, efficiency: 110.0 },
    { day: 'Fri', planned: 1200, actual: 1190, efficiency: 99.2 },
    { day: 'Sat', planned: 800, actual: 820, efficiency: 102.5 },
    { day: 'Sun', planned: 600, actual: 580, efficiency: 96.7 }
  ];

  const shiftPerformance = [
    { shift: 'Morning', productivity: 95, efficiency: 92, defectRate: 2.1 },
    { shift: 'Afternoon', productivity: 88, efficiency: 90, defectRate: 2.8 },
    { shift: 'Night', productivity: 85, efficiency: 87, defectRate: 3.2 }
  ];

  const machineUtilization = [
    { name: 'Running', value: 8, color: '#22c55e' },
    { name: 'Idle', value: 2, color: '#f59e0b' },
    { name: 'Maintenance', value: 1, color: '#ef4444' },
    { name: 'Setup', value: 1, color: '#8b5cf6' }
  ];

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time subscriptions
    const batchesChannel = supabase
      .channel('production-batches')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'production_batches' 
      }, () => {
        loadBatches();
      })
      .subscribe();

    // Removed alerts subscription for now since table may not exist

    return () => {
      supabase.removeChannel(batchesChannel);
    };
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadBatches(),
        loadMachines(),
        loadAlerts()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBatches = async () => {
    const { data, error } = await supabase
      .from('production_batches')
      .select(`
        *,
        products(name),
        machines(name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading batches:', error);
      return;
    }

    const transformedBatches = data?.map(batch => ({
      id: batch.id,
      product_name: batch.products?.name || 'Unknown Product',
      batch_number: batch.batch_number,
      target_quantity: batch.target_quantity,
      produced_quantity: batch.produced_quantity || 0,
      status: batch.status,
      machine_name: batch.machines?.name || 'Unknown Machine',
      progress: batch.target_quantity > 0 ? (batch.produced_quantity || 0) / batch.target_quantity * 100 : 0,
      shift: batch.shift || 'Unknown',
      scheduled_start: batch.scheduled_start,
      actual_start: batch.actual_start
    })) || [];

    setBatches(transformedBatches);
  };

  const loadMachines = async () => {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading machines:', error);
      return;
    }

    // Transform machine data with sample utilization metrics
    const transformedMachines = data?.map((machine, index) => ({
      id: machine.id,
      name: machine.name,
      status: machine.status,
      utilization: 70 + (index * 5) % 30, // Sample data
      efficiency: 85 + (index * 3) % 15    // Sample data
    })) || [];

    setMachines(transformedMachines);
  };

  const loadAlerts = async () => {
    // For now, use sample alerts since the table may not have data
    const sampleAlerts: ProductionAlert[] = [
      {
        id: '1',
        title: 'Machine Temperature Alert',
        message: 'Injection Molding #3 temperature threshold exceeded',
        severity: 'high',
        created_at: new Date().toISOString(),
        alert_type: 'machine_fault'
      },
      {
        id: '2',
        title: 'Low Material Level',
        message: 'Extrusion Line #1 raw material running low',
        severity: 'medium',
        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        alert_type: 'inventory'
      },
      {
        id: '3',
        title: 'Quality Issue',
        message: 'Quality Station #2 defect rate above normal threshold',
        severity: 'high',
        created_at: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
        alert_type: 'quality'
      }
    ];

    setAlerts(sampleAlerts);
  };

  const handleStartBatch = async (batchId: string) => {
    const { error } = await supabase
      .from('production_batches')
      .update({
        status: 'in_progress',
        actual_start: new Date().toISOString()
      })
      .eq('id', batchId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to start batch',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Batch started successfully'
    });

    loadBatches();
  };

  const handlePauseBatch = async (batchId: string) => {
    const { error } = await supabase
      .from('production_batches')
      .update({ status: 'paused' })
      .eq('id', batchId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to pause batch',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Batch paused successfully'
    });

    loadBatches();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'in_progress': return 'default';
      case 'scheduled': return 'secondary';
      case 'paused': return 'outline';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  // Calculate key metrics
  const totalProduction = batches.reduce((sum, batch) => sum + batch.produced_quantity, 0);
  const runningBatches = batches.filter(batch => batch.status === 'in_progress').length;
  const avgEfficiency = productionData.reduce((sum, day) => sum + day.efficiency, 0) / productionData.length;
  const activeMachines = machines.filter(machine => machine.status === 'running').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading production dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <WelcomeHeader />

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="metric-card bg-gradient-to-br from-blue-600/20 to-blue-700/20 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Production</CardTitle>
            <Factory className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalProduction.toLocaleString()}</div>
            <div className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-green-400">+12.5%</span>
              <span className="text-muted-foreground ml-1">vs target</span>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card bg-gradient-to-br from-green-600/20 to-green-700/20 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Efficiency</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{avgEfficiency.toFixed(1)}%</div>
            <Progress value={avgEfficiency} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="metric-card bg-gradient-to-br from-emerald-600/20 to-emerald-700/20 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Machines</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeMachines}/{machines.length}</div>
            <div className="text-sm text-muted-foreground">{machines.length - activeMachines} offline</div>
          </CardContent>
        </Card>

        <Card className="metric-card bg-gradient-to-br from-purple-600/20 to-purple-700/20 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Running Batches</CardTitle>
            <Zap className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{runningBatches}</div>
            <div className="text-sm text-muted-foreground">{batches.length} total batches</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Production Chart */}
        <Card className="betaflow-card">
          <CardHeader>
            <CardTitle className="text-foreground">Weekly Production Overview</CardTitle>
            <CardDescription>Planned vs Actual Production with Efficiency</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }} 
                />
                <Bar dataKey="planned" fill="hsl(var(--muted))" name="Planned" />
                <Bar dataKey="actual" fill="hsl(var(--primary))" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Machine Utilization */}
        <Card className="betaflow-card">
          <CardHeader>
            <CardTitle className="text-foreground">Machine Status Distribution</CardTitle>
            <CardDescription>Current operational status of all machines</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={machineUtilization}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {machineUtilization.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {machineUtilization.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shift Performance Chart */}
      <Card className="betaflow-card">
        <CardHeader>
          <CardTitle className="text-foreground">Shift-wise Performance Analysis</CardTitle>
          <CardDescription>Productivity, efficiency, and quality metrics by shift</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={shiftPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="shift" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }} 
              />
              <Area type="monotone" dataKey="productivity" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="efficiency" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Production Batches */}
      <Card className="betaflow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center">
              <Package className="h-5 w-5 text-primary mr-2" />
              Active Production Batches
            </CardTitle>
            <CardDescription>Drag and drop to reschedule batches</CardDescription>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Batch
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {batches.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No active batches found</p>
            ) : (
              batches.map((batch) => (
                <div key={batch.id} className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border hover:bg-card/70 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant={getStatusBadgeVariant(batch.status)}>
                        {batch.status.replace('_', ' ')}
                      </Badge>
                      <span className="font-medium text-foreground">{batch.batch_number}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-foreground">{batch.product_name}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Machine: {batch.machine_name}</span>
                      <span>Shift: {batch.shift}</span>
                      <span>Progress: {batch.produced_quantity}/{batch.target_quantity}</span>
                    </div>
                    <Progress value={batch.progress} className="mt-2 w-full" />
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {batch.status === 'scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => handleStartBatch(batch.id)}
                        className="flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Start
                      </Button>
                    )}
                    {batch.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePauseBatch(batch.id)}
                        className="flex items-center gap-1"
                      >
                        <Pause className="h-3 w-3" />
                        Pause
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      <Card className="betaflow-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
            Critical Production Alerts
          </CardTitle>
          <CardDescription>Real-time notifications requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No active alerts</p>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border hover:bg-card/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <span className="font-medium text-foreground">{alert.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(alert.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}