
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  Activity
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type MachineStatus = Database['public']['Enums']['machine_status'];

interface Machine {
  id: string;
  name: string;
  type: string;
  status: MachineStatus;
  location: string | null;
  last_maintenance: string | null;
  next_maintenance: string | null;
  specifications: any;
}

export function MachineStatus() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const updateMachineStatus = async (machineId: string, newStatus: MachineStatus) => {
    try {
      const { error } = await supabase
        .from('machines')
        .update({ status: newStatus })
        .eq('id', machineId);

      if (error) throw error;
      fetchMachines();
    } catch (error) {
      console.error('Error updating machine status:', error);
    }
  };

  const getStatusIcon = (status: MachineStatus) => {
    switch (status) {
      case 'running': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'idle': return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'maintenance': return <Wrench className="h-5 w-5 text-blue-400" />;
      case 'breakdown': return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'offline': return <Activity className="h-5 w-5 text-gray-400" />;
      default: return <Settings className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: MachineStatus) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'maintenance': return 'bg-blue-500';
      case 'breakdown': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Machine Status</h1>
        <p className="text-gray-400">Monitor and control all production machines</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {machines.map((machine) => (
          <Card key={machine.id} className="betaflow-card">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(machine.status)}
                  <div>
                    <CardTitle className="text-white">{machine.name}</CardTitle>
                    <CardDescription>{machine.type}</CardDescription>
                  </div>
                </div>
                <Badge className={`${getStatusColor(machine.status)} text-white`}>
                  {machine.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="text-sm text-white">{machine.location || 'Not specified'}</p>
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

                <div className="pt-3 space-y-2">
                  <div className="flex space-x-2">
                    {machine.status === 'idle' && (
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 flex-1"
                        onClick={() => updateMachineStatus(machine.id, 'running')}
                      >
                        Start
                      </Button>
                    )}
                    {machine.status === 'running' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-yellow-500 text-yellow-400 flex-1"
                        onClick={() => updateMachineStatus(machine.id, 'idle')}
                      >
                        Stop
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-blue-500 text-blue-400"
                      onClick={() => updateMachineStatus(machine.id, 'maintenance')}
                    >
                      <Wrench className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {machines.length === 0 && (
          <div className="col-span-full">
            <Card className="betaflow-card">
              <CardContent className="text-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Machines Found</h3>
                <p className="text-gray-400">Add machines to start monitoring their status</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
