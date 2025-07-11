
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Boxes,
  Warehouse,
  ShoppingCart,
  Activity
} from 'lucide-react';

interface RawMaterial {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
  unit_cost: number | null;
  location: string | null;
  supplier_id: string | null;
  created_at: string;
  updated_at: string;
}

interface StockMovement {
  id: string;
  material_id: string;
  movement_type: string;
  quantity: number;
  notes: string | null;
  created_at: string;
  raw_materials?: {
    name: string;
    sku: string;
  };
}

export function InventoryManagement() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const { toast } = useToast();

  // New material form state
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    sku: '',
    current_stock: '',
    minimum_stock: '',
    unit: '',
    unit_cost: '',
    location: ''
  });

  // Stock movement form state
  const [newMovement, setNewMovement] = useState({
    material_id: '',
    movement_type: 'in',
    quantity: '',
    notes: ''
  });

  useEffect(() => {
    fetchMaterials();
    fetchMovements();
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('raw_materials')
        .select('*')
        .order('name');

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch materials',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          raw_materials (name, sku)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setMovements(data || []);
    } catch (error) {
      console.error('Error fetching movements:', error);
    }
  };

  const createMaterial = async () => {
    try {
      const { error } = await supabase
        .from('raw_materials')
        .insert({
          name: newMaterial.name,
          sku: newMaterial.sku,
          current_stock: parseFloat(newMaterial.current_stock),
          minimum_stock: parseFloat(newMaterial.minimum_stock),
          unit: newMaterial.unit,
          unit_cost: newMaterial.unit_cost ? parseFloat(newMaterial.unit_cost) : null,
          location: newMaterial.location || null
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Material added successfully'
      });

      setIsDialogOpen(false);
      setNewMaterial({
        name: '',
        sku: '',
        current_stock: '',
        minimum_stock: '',
        unit: '',
        unit_cost: '',
        location: ''
      });
      fetchMaterials();
    } catch (error) {
      console.error('Error creating material:', error);
      toast({
        title: 'Error',
        description: 'Failed to create material',
        variant: 'destructive'
      });
    }
  };

  const createStockMovement = async () => {
    try {
      const quantity = parseFloat(newMovement.quantity);
      const isOutgoing = newMovement.movement_type === 'out';
      const adjustedQuantity = isOutgoing ? -quantity : quantity;

      // Create movement record
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          material_id: newMovement.material_id,
          movement_type: newMovement.movement_type,
          quantity: adjustedQuantity,
          notes: newMovement.notes || null
        });

      if (movementError) throw movementError;

      // Update material stock
      const material = materials.find(m => m.id === newMovement.material_id);
      if (material) {
        const newStock = material.current_stock + adjustedQuantity;
        
        const { error: updateError } = await supabase
          .from('raw_materials')
          .update({ current_stock: newStock })
          .eq('id', newMovement.material_id);

        if (updateError) throw updateError;
      }

      toast({
        title: 'Success',
        description: 'Stock movement recorded successfully'
      });

      setIsMovementDialogOpen(false);
      setNewMovement({
        material_id: '',
        movement_type: 'in',
        quantity: '',
        notes: ''
      });
      fetchMaterials();
      fetchMovements();
    } catch (error) {
      console.error('Error creating movement:', error);
      toast({
        title: 'Error',
        description: 'Failed to record stock movement',
        variant: 'destructive'
      });
    }
  };

  const getStockStatus = (material: RawMaterial) => {
    const stockRatio = material.current_stock / material.minimum_stock;
    if (stockRatio <= 0.5) return 'critical';
    if (stockRatio <= 1) return 'low';
    if (stockRatio <= 2) return 'good';
    return 'high';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'low': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'good': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'high': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'low': return <TrendingDown className="h-4 w-4 text-yellow-400" />;
      case 'good': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'high': return <Activity className="h-4 w-4 text-blue-400" />;
      default: return <Package className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockMaterials = materials.filter(material => 
    getStockStatus(material) === 'critical' || getStockStatus(material) === 'low'
  );

  const totalValue = materials.reduce((sum, material) => 
    sum + (material.current_stock * (material.unit_cost || 0)), 0
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
          <h1 className="text-3xl font-bold text-white mb-2">Inventory Management</h1>
          <p className="text-gray-400">Manage raw materials and track stock levels</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10">
                <Activity className="h-4 w-4 mr-2" />
                Stock Movement
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Record Stock Movement</DialogTitle>
                <DialogDescription>
                  Add or remove stock from inventory
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="material_select" className="text-gray-300">Material</Label>
                  <select
                    id="material_select"
                    value={newMovement.material_id}
                    onChange={(e) => setNewMovement(prev => ({ ...prev, material_id: e.target.value }))}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  >
                    <option value="">Select Material</option>
                    {materials.map(material => (
                      <option key={material.id} value={material.id}>
                        {material.name} ({material.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="movement_type" className="text-gray-300">Type</Label>
                    <select
                      id="movement_type"
                      value={newMovement.movement_type}
                      onChange={(e) => setNewMovement(prev => ({ ...prev, movement_type: e.target.value }))}
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                    >
                      <option value="in">Stock In</option>
                      <option value="out">Stock Out</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="quantity" className="text-gray-300">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newMovement.quantity}
                      onChange={(e) => setNewMovement(prev => ({ ...prev, quantity: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes" className="text-gray-300">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newMovement.notes}
                    onChange={(e) => setNewMovement(prev => ({ ...prev, notes: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={createStockMovement} className="bg-green-600 hover:bg-green-700">
                  Record Movement
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 hover-scale">
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Material</DialogTitle>
                <DialogDescription>
                  Add a new raw material to inventory
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-300">Name</Label>
                    <Input
                      id="name"
                      value={newMaterial.name}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku" className="text-gray-300">SKU</Label>
                    <Input
                      id="sku"
                      value={newMaterial.sku}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, sku: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="current_stock" className="text-gray-300">Current Stock</Label>
                    <Input
                      id="current_stock"
                      type="number"
                      value={newMaterial.current_stock}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, current_stock: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimum_stock" className="text-gray-300">Minimum Stock</Label>
                    <Input
                      id="minimum_stock"
                      type="number"
                      value={newMaterial.minimum_stock}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, minimum_stock: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit" className="text-gray-300">Unit</Label>
                    <Input
                      id="unit"
                      value={newMaterial.unit}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, unit: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="kg, pieces, etc."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unit_cost" className="text-gray-300">Unit Cost</Label>
                    <Input
                      id="unit_cost"
                      type="number"
                      step="0.01"
                      value={newMaterial.unit_cost}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, unit_cost: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-gray-300">Location</Label>
                    <Input
                      id="location"
                      value={newMaterial.location}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, location: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={createMaterial} className="bg-blue-600 hover:bg-blue-700">
                  Add Material
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Materials</p>
                <p className="text-2xl font-bold text-white">{materials.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-red-400">{lowStockMaterials.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-green-400">${totalValue.toLocaleString()}</p>
              </div>
              <Boxes className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Recent Movements</p>
                <p className="text-2xl font-bold text-purple-400">{movements.length}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-400" />
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
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {lowStockMaterials.length > 0 && (
        <Card className="betaflow-card border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Materials requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockMaterials.map(material => (
                <div key={material.id} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div>
                    <p className="font-medium text-white">{material.name}</p>
                    <p className="text-sm text-gray-400">{material.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-medium">{material.current_stock} {material.unit}</p>
                    <p className="text-xs text-gray-400">Min: {material.minimum_stock} {material.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Materials List */}
      <div className="grid gap-4">
        {filteredMaterials.map((material, index) => {
          const status = getStockStatus(material);
          const stockPercentage = (material.current_stock / material.minimum_stock) * 100;
          
          return (
            <Card key={material.id} className="betaflow-card hover:bg-gray-800/40 transition-all duration-200 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
                      <h3 className="font-semibold text-white">{material.name}</h3>
                    </div>
                    <Badge className={`${getStatusColor(status)} border`}>
                      {status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">SKU</p>
                    <p className="text-white font-medium">{material.sku}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Current Stock</p>
                    <p className="text-lg font-bold text-white">{material.current_stock} {material.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Minimum Stock</p>
                    <p className="text-sm text-gray-300">{material.minimum_stock} {material.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Unit Cost</p>
                    <p className="text-sm text-gray-300">{material.unit_cost ? `$${material.unit_cost}` : 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Value</p>
                    <p className="text-sm text-green-400">
                      ${((material.current_stock * (material.unit_cost || 0))).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm text-gray-300">{material.location || 'Not set'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Stock Level</span>
                    <span className="text-white">{Math.min(stockPercentage, 100).toFixed(0)}% of minimum</span>
                  </div>
                  <Progress 
                    value={Math.min(stockPercentage, 100)} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredMaterials.length === 0 && (
          <Card className="betaflow-card">
            <CardContent className="text-center py-12">
              <Warehouse className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Materials Found</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm 
                  ? 'No materials match your search terms' 
                  : 'Start by adding your first raw material'
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Material
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Stock Movements */}
      {movements.length > 0 && (
        <Card className="betaflow-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="h-5 w-5 text-purple-400 mr-2" />
              Recent Stock Movements
            </CardTitle>
            <CardDescription>Latest inventory transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {movements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {movement.quantity > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">
                        {movement.raw_materials?.name || 'Unknown Material'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {movement.raw_materials?.sku || 'Unknown SKU'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${movement.quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(movement.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
