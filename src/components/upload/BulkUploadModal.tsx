
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import {
  Upload,
  Download,
  FileSpreadsheet,
  Package,
  Users,
  Settings,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadResult {
  success: number;
  failed: number;
  errors: string[];
}

type TableName = keyof Database['public']['Tables'];

// Map upload types to actual table names
const TABLE_MAPPING: Record<string, TableName> = {
  'raw-materials': 'raw_materials',
  'products': 'products',
  'employees': 'profiles',
  'machines': 'machines'
} as const;

export function BulkUploadModal({ isOpen, onClose }: BulkUploadModalProps) {
  const [activeTab, setActiveTab] = useState('raw-materials');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();

  const uploadTypes = [
    {
      id: 'raw-materials',
      title: 'Raw Materials',
      icon: Package,
      description: 'Upload raw materials inventory data',
      requiredColumns: ['name', 'sku', 'unit', 'current_stock', 'minimum_stock']
    },
    {
      id: 'products',
      title: 'Products',
      icon: ShoppingCart,
      description: 'Upload product catalog data',
      requiredColumns: ['name', 'sku', 'category', 'unit_price']
    },
    {
      id: 'employees',
      title: 'Employees',
      icon: Users,
      description: 'Upload employee data',
      requiredColumns: ['full_name', 'email', 'role', 'department']
    },
    {
      id: 'machines',
      title: 'Machines',
      icon: Settings,
      description: 'Upload machine data',
      requiredColumns: ['name', 'type', 'location', 'status']
    }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please select a CSV file',
        variant: 'destructive'
      });
    }
  };

  const generateTemplate = (uploadType: string): string => {
    const headers = uploadTypes.find(type => type.id === uploadType)?.requiredColumns || [];
    return headers.join(',');
  };

  const downloadTemplate = (uploadType: string) => {
    const content = generateTemplate(uploadType);
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${uploadType}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }

    return data;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validateData = (data: any[], requiredColumns: string[]): string[] => {
    const errors: string[] = [];
    
    if (data.length === 0) {
      errors.push('No valid data found in CSV file');
      return errors;
    }

    const headers = Object.keys(data[0]);
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Additional validation for employee data
    if (activeTab === 'employees') {
      data.forEach((row, index) => {
        if (row.email && !isValidEmail(row.email)) {
          errors.push(`Row ${index + 1}: Invalid email format '${row.email}'`);
        }
        if (!row.email || row.email.trim() === '') {
          errors.push(`Row ${index + 1}: Email is required`);
        }
      });
    }

    return errors;
  };

  const uploadData = async (data: any[], tableName: TableName): Promise<UploadResult> => {
    const result: UploadResult = { success: 0, failed: 0, errors: [] };
    
    for (let i = 0; i < data.length; i++) {
      setProgress((i / data.length) * 100);
      
      try {
        let processedData = { ...data[i] };
        
        // Process data based on table type
        if (tableName === 'raw_materials') {
          processedData.current_stock = parseFloat(processedData.current_stock) || 0;
          processedData.minimum_stock = parseFloat(processedData.minimum_stock) || 0;
          if (processedData.unit_cost) {
            processedData.unit_cost = parseFloat(processedData.unit_cost) || null;
          }
        } else if (tableName === 'products') {
          if (processedData.unit_price) {
            processedData.unit_price = parseFloat(processedData.unit_price) || null;
          }
          if (processedData.production_time_minutes) {
            processedData.production_time_minutes = parseInt(processedData.production_time_minutes) || null;
          }
        } else if (tableName === 'machines') {
          if (processedData.specifications) {
            try {
              processedData.specifications = JSON.parse(processedData.specifications);
            } catch {
              processedData.specifications = null;
            }
          }
        }

        const { error } = await supabase
          .from(tableName)
          .insert(processedData);

        if (error) {
          result.failed++;
          result.errors.push(`Row ${i + 1}: ${error.message}`);
        } else {
          result.success++;
        }
      } catch (error) {
        result.failed++;
        result.errors.push(`Row ${i + 1}: Unexpected error`);
      }
    }

    return result;
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setResult(null);

    try {
      const csvText = await file.text();
      const data = parseCSV(csvText);
      
      const currentType = uploadTypes.find(type => type.id === activeTab);
      if (!currentType) return;

      const validationErrors = validateData(data, currentType.requiredColumns);
      if (validationErrors.length > 0) {
        setResult({ success: 0, failed: data.length, errors: validationErrors });
        setUploading(false);
        return;
      }

      const tableName = TABLE_MAPPING[activeTab];
      if (!tableName) {
        setResult({ success: 0, failed: data.length, errors: ['Invalid upload type'] });
        setUploading(false);
        return;
      }

      const uploadResult = await uploadData(data, tableName);
      setResult(uploadResult);

      if (uploadResult.success > 0) {
        toast({
          title: 'Upload completed',
          description: `Successfully uploaded ${uploadResult.success} records`
        });
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'An error occurred while processing the file',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Bulk Data Upload
          </DialogTitle>
          <DialogDescription>
            Upload CSV files to bulk import data into the system
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            {uploadTypes.map(type => (
              <TabsTrigger
                key={type.id}
                value={type.id}
                className="flex items-center text-xs"
              >
                <type.icon className="h-4 w-4 mr-1" />
                {type.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {uploadTypes.map(type => (
            <TabsContent key={type.id} value={type.id} className="space-y-4">
              <Card className="betaflow-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <type.icon className="h-5 w-5 mr-2" />
                    {type.title} Upload
                  </CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="border-blue-500/20 bg-blue-500/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Required columns: {type.requiredColumns.join(', ')}
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => downloadTemplate(type.id)}
                      className="border-green-500 text-green-400 hover:bg-green-500/10"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="csv-file" className="text-gray-300">
                      Select CSV File
                    </Label>
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  {file && (
                    <Alert className="border-green-500/20 bg-green-500/10">
                      <FileSpreadsheet className="h-4 w-4" />
                      <AlertDescription>
                        File selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </AlertDescription>
                    </Alert>
                  )}

                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Uploading...</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  {result && (
                    <Alert className={result.failed > 0 ? "border-yellow-500/20 bg-yellow-500/10" : "border-green-500/20 bg-green-500/10"}>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="space-y-2">
                        <div>
                          Upload completed: {result.success} successful, {result.failed} failed
                        </div>
                        {result.errors.length > 0 && (
                          <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                            <div className="font-medium">Errors:</div>
                            {result.errors.slice(0, 5).map((error, index) => (
                              <div key={index} className="text-red-400">{error}</div>
                            ))}
                            {result.errors.length > 5 && (
                              <div className="text-gray-400">...and {result.errors.length - 5} more errors</div>
                            )}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={resetUpload}
            className="border-gray-600 text-gray-400"
          >
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-400"
            >
              Close
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Data'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
