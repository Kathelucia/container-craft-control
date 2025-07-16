
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BulkUploadButton } from '@/components/upload/BulkUploadButton';
import {
  Settings,
  Plus,
  Search,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Wrench
} from 'lucide-react';

interface Machine {
  id: string;
  name: string;
  type: string;
  status: string;
  location: string | null;
  last_maintenance: string | null;
  next_maintenance: string | null;
  specifications: any;
  created_at: string;
}

export function MachineStatus() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('name');

      if (error) throw error;
      setMachines(data || []);
    } catch (error) {
      console.error('Error fetching machines:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch machines',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'idle': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'maintenance': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'breakdown': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'offline': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-4 w-4 text-green-400" />;
      case 'idle': return <Clock className="h-4 w-4 text-blue-400" />;
      case 'maintenance': return <Wrench className="h-4 w-4 text-yellow-400" />;
      case 'breakdown': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'offline': return <CheckCircle className="h-4 w-4 text-gray-400" />;
      default: return <Settings className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredMachines = machines.filter(machine =>
    machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (machine.location && machine.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <h1 className="text-3xl font-bold text-white mb-2">Machine Status</h1>
          <p className="text-gray-400">Monitor and manage machine operations</p>
        </div>
        <div className="flex space-x-2">
          <BulkUploadButton />
          <Button className="bg-blue-600 hover:bg-blue-700 hover-scale">
            <Plus className="h-4 w-4 mr-2" />
            Add Machine
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Machines</p>
                <p className="text-2xl font-bold text-white">{machines.length}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Running</p>
                <p className="text-2xl font-bold text-green-400">
                  {machines.filter(m => m.status === 'running').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Idle</p>
                <p className="text-2xl font-bold text-blue-400">
                  {machines.filter(m => m.status === 'idle').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Maintenance</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {machines.filter(m => m.status === 'maintenance').length}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Issues</p>
                <p className="text-2xl font-bold text-red-400">
                  {machines.filter(m => m.status === 'breakdown').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="betaflow-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search machines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Machine List */}
      <div className="grid gap-4">
        {filteredMachines.map((machine, index) => (
          <Card key={machine.id} className="betaflow-card hover:bg-gray-800/40 transition-all duration-200 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(machine.status)}
                    <h3 className="font-semibold text-white text-lg">{machine.name}</h3>
                  </div>
                  <Badge className={`${getStatusColor(machine.status)} border`}>
                    {machine.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Type</p>
                  <p className="text-white font-medium">{machine.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm text-white">{machine.location || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Last Maintenance</p>
                  <p className="text-sm text-white">
                    {machine.last_maintenance 
                      ? new Date(machine.last_maintenance).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Next Maintenance</p>
                  <p className="text-sm text-white">
                    {machine.next_maintenance 
                      ? new Date(machine.next_maintenance).toLocaleDateString()
                      : 'Not scheduled'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Added</p>
                  <p className="text-sm text-white">
                    {new Date(machine.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {machine.specifications && (
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400 mb-2">Specifications</p>
                  <div className="text-sm text-gray-300">
                    {Object.entries(machine.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace('_', ' ')}</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredMachines.length === 0 && (
          <Card className="betaflow-card">
            <CardContent className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Machines Found</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm 
                  ? 'No machines match your search terms' 
                  : 'Start by adding your first machine'
                }
              </p>
              {!searchTerm && (
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Machine
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
