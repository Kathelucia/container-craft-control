
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
  X,
  Calendar as CalendarIcon,
  Save,
  Package,
  Settings,
  User,
  Clock
} from 'lucide-react';

interface NewBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchCreated: () => void;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface Machine {
  id: string;
  name: string;
  status: string;
}

interface Operator {
  id: string;
  full_name: string;
  shift: string;
}

export function NewBatchModal({ isOpen, onClose, onBatchCreated }: NewBatchModalProps) {
  const [batchNumber, setBatchNumber] = useState('');
  const [productId, setProductId] = useState('');
  const [machineId, setMachineId] = useState('');
  const [operatorId, setOperatorId] = useState('');
  const [targetQuantity, setTargetQuantity] = useState('');
  const [shift, setShift] = useState('');
  const [scheduledStart, setScheduledStart] = useState<Date | undefined>(undefined);
  const [scheduledEnd, setScheduledEnd] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  
  const { toast } = useToast();

  React.useEffect(() => {
    if (isOpen) {
      fetchData();
      generateBatchNumber();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, sku')
        .order('name');
      
      // Fetch machines
      const { data: machinesData } = await supabase
        .from('machines')
        .select('id, name, status')
        .order('name');
      
      // Fetch operators
      const { data: operatorsData } = await supabase
        .from('profiles')
        .select('id, full_name, shift')
        .eq('role', 'machine_operator')
        .order('full_name');

      setProducts(productsData || []);
      setMachines(machinesData || []);
      setOperators(operatorsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data for batch creation.',
        variant: 'destructive'
      });
    }
  };

  const generateBatchNumber = () => {
    const date = new Date();
    const dateStr = format(date, 'yyyyMMdd');
    const timeStr = format(date, 'HHmm');
    setBatchNumber(`BATCH-${dateStr}-${timeStr}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId || !machineId || !targetQuantity) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('production_batches')
        .insert({
          batch_number: batchNumber,
          product_id: productId,
          machine_id: machineId,
          assigned_operator: operatorId || null,
          target_quantity: parseInt(targetQuantity),
          shift: shift || null,
          scheduled_start: scheduledStart?.toISOString() || null,
          scheduled_end: scheduledEnd?.toISOString() || null,
          notes: notes || null,
          status: 'scheduled'
        });

      if (error) throw error;

      toast({
        title: 'Batch Created Successfully',
        description: `Production batch ${batchNumber} has been created.`
      });

      onBatchCreated();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating batch:', error);
      toast({
        title: 'Error',
        description: 'Failed to create production batch. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setBatchNumber('');
    setProductId('');
    setMachineId('');
    setOperatorId('');
    setTargetQuantity('');
    setShift('');
    setScheduledStart(undefined);
    setScheduledEnd(undefined);
    setNotes('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="bg-gray-900 border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Create New Production Batch
              </CardTitle>
              <CardDescription>
                Set up a new production batch with all required parameters
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Batch Number */}
            <div>
              <Label htmlFor="batch-number" className="text-gray-300">Batch Number *</Label>
              <Input
                id="batch-number"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                required
              />
            </div>

            {/* Product Selection */}
            <div>
              <Label className="text-gray-300">Product *</Label>
              <Select value={productId} onValueChange={setProductId} required>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Machine Selection */}
            <div>
              <Label className="text-gray-300">Machine *</Label>
              <Select value={machineId} onValueChange={setMachineId} required>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select a machine" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      <div className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>{machine.name}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          machine.status === 'running' ? 'bg-green-500/20 text-green-400' :
                          machine.status === 'idle' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {machine.status}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Quantity */}
            <div>
              <Label htmlFor="target-quantity" className="text-gray-300">Target Quantity *</Label>
              <Input
                id="target-quantity"
                type="number"
                min="1"
                value={targetQuantity}
                onChange={(e) => setTargetQuantity(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Enter target quantity"
                required
              />
            </div>

            {/* Operator Assignment */}
            <div>
              <Label className="text-gray-300">Assigned Operator</Label>
              <Select value={operatorId} onValueChange={setOperatorId}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select an operator (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {operators.map((operator) => (
                    <SelectItem key={operator.id} value={operator.id}>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{operator.full_name}</span>
                        {operator.shift && (
                          <span className="text-xs text-gray-400">({operator.shift})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Shift */}
            <div>
              <Label className="text-gray-300">Shift</Label>
              <Select value={shift} onValueChange={setShift}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="morning">Morning (6:00 - 14:00)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (14:00 - 22:00)</SelectItem>
                  <SelectItem value="night">Night (22:00 - 6:00)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Scheduled Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Scheduled Start</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledStart ? format(scheduledStart, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                    <Calendar
                      mode="single"
                      selected={scheduledStart}
                      onSelect={setScheduledStart}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-gray-300">Scheduled End</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledEnd ? format(scheduledEnd, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                    <Calendar
                      mode="single"
                      selected={scheduledEnd}
                      onSelect={setScheduledEnd}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-gray-300">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Add any additional notes or instructions..."
                rows={3}
              />
            </div>
          </CardContent>

          <div className="flex justify-end space-x-2 p-6 pt-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Batch
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
