import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { NewBatchModal } from './NewBatchModal';
import {
  Play,
  Pause,
  Square,
  AlertTriangle,
  Clock,
  Package,
  Settings,
  Plus
} from 'lucide-react';

interface ProductionBatch {
  id: string;
  batch_number: string;
  product_id: string;
  machine_id: string;
  target_quantity: number;
  produced_quantity: number | null;
  status: string;
  scheduled_start: string | null;
  actual_start: string | null;
  products?: {
    name: string;
    sku: string;
  };
  machines?: {
    name: string;
    status: string;
  };
}

export function ProductionWorkflow() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('production_batches')
        .select(`
          *,
          products (name, sku),
          machines (name, status)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBatchStatus = async (batchId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'in_progress' && !batches.find(b => b.id === batchId)?.actual_start) {
        updateData.actual_start = new Date().toISOString();
      }
      
      if (newStatus === 'completed') {
        updateData.actual_end = new Date().toISOString();
      }

      const { error } = await supabase
        .from('production_batches')
        .update(updateData)
        .eq('id', batchId);

      if (error) throw error;
      fetchBatches();
    } catch (error) {
      console.error('Error updating batch:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'in_progress': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'paused': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleNewBatchCreated = () => {
    fetchBatches(); // Refresh the list
    setShowNewBatchModal(false);
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Production Workflow</h1>
          <p className="text-gray-400">Manage and monitor production batches in real-time</p>
        </div>
        <Button 
          onClick={() => setShowNewBatchModal(true)}
          className="bg-blue-600 hover:bg-blue-700 hover-scale"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Batch
        </Button>
      </div>

      {/* Production Batches */}
      <div className="grid gap-6">
        {batches.map((batch, index) => {
          const progress = batch.produced_quantity && batch.target_quantity 
            ? (batch.produced_quantity / batch.target_quantity) * 100 
            : 0;

          return (
            <Card key={batch.id} className="betaflow-card animate-fade-in hover-scale" style={{animationDelay: `${index * 100}ms`}}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-lg">
                      Batch {batch.batch_number}
                    </CardTitle>
                    <CardDescription>
                      {batch.products?.name} ({batch.products?.sku})
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(batch.status)} text-white`}>
                      {batch.status.replace('_', ' ')}
                    </Badge>
                    {user?.role === 'production_manager' && (
                      <div className="flex space-x-1">
                        {batch.status === 'scheduled' && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateBatchStatus(batch.id, 'in_progress')}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {batch.status === 'in_progress' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-yellow-500 text-yellow-400"
                              onClick={() => updateBatchStatus(batch.id, 'paused')}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gray-600 hover:bg-gray-700"
                              onClick={() => updateBatchStatus(batch.id, 'completed')}
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {batch.status === 'paused' && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateBatchStatus(batch.id, 'in_progress')}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Machine</p>
                    <p className="text-sm font-medium text-white flex items-center">
                      <Settings className="h-4 w-4 mr-1" />
                      {batch.machines?.name || 'Not assigned'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Target Quantity</p>
                    <p className="text-sm font-medium text-white flex items-center">
                      <Package className="h-4 w-4 mr-1" />
                      {batch.target_quantity.toLocaleString()} units
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Produced</p>
                    <p className="text-sm font-medium text-white">
                      {(batch.produced_quantity || 0).toLocaleString()} units
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Started</p>
                    <p className="text-sm font-medium text-white flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {batch.actual_start 
                        ? new Date(batch.actual_start).toLocaleDateString()
                        : 'Not started'
                      }
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{Math.round(progress)}% complete</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {batch.status === 'in_progress' && progress < 100 && (
                  <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-800">
                    <div className="flex items-center text-blue-400">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span className="text-sm">Production in progress - Monitor for quality issues</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {batches.length === 0 && (
          <Card className="betaflow-card">
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Production Batches</h3>
              <p className="text-gray-400 mb-4">Get started by creating your first production batch</p>
              <Button 
                onClick={() => setShowNewBatchModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Batch
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Batch Modal */}
      <NewBatchModal
        isOpen={showNewBatchModal}
        onClose={() => setShowNewBatchModal(false)}
        onBatchCreated={handleNewBatchCreated}
      />
    </div>
  );
}
