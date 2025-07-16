import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  FileSpreadsheet,
  File,
  Calendar as CalendarIcon
} from 'lucide-react';

interface ReportType {
  value: string;
  label: string;
}

export function Reports() {
  const [reportType, setReportType] = useState<ReportType>({ value: 'production_summary', label: 'Production Summary' });
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const reportTypes: ReportType[] = [
    { value: 'production_summary', label: 'Production Summary' },
    { value: 'machine_performance', label: 'Machine Performance' },
    { value: 'operator_efficiency', label: 'Operator Efficiency' },
    { value: 'material_usage', label: 'Material Usage' },
  ];

  const generatePDFReport = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setProgress(100);

      // Generate mock PDF content
      const reportData = `
Production Report - ${reportType.label.toUpperCase()}
Generated: ${new Date().toLocaleDateString()}
Date Range: ${dateRange.from?.toLocaleDateString()} to ${dateRange.to?.toLocaleDateString()}

=== SUMMARY ===
Total Batches: 45
Completed: 38
In Progress: 7
Success Rate: 84.4%

=== DETAILS ===
Batch-001: Plastic Containers - 1,250 units
Batch-002: Food Packaging - 890 units
Batch-003: Industrial Parts - 2,100 units
      `.trim();

      // Create and download file
      const blob = new Blob([reportData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType.label.replace(/\s+/g, '_').toLowerCase()}_report_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Report Generated',
        description: `${reportType.label} report has been downloaded successfully.`
      });

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const generateExcelReport = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 90));
      }, 300);

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      clearInterval(progressInterval);
      setProgress(100);

      // Generate CSV content (Excel alternative)
      const csvContent = `Production Report,${reportType.label.replace(/,/g, '')}\nGenerated,${new Date().toLocaleDateString().replace(/,/g, '')}\n\nBatch Number,Product,Target Qty,Produced Qty,Status\nBATCH-001,Plastic Containers,1250,1250,Completed\nBATCH-002,Food Packaging,890,890,Completed\nBATCH-003,Industrial Parts,2100,1850,In Progress`;

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType.label.replace(/\s+/g, '_').toLowerCase()}_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Excel Report Generated',
        description: `${reportType.label} report has been downloaded as CSV.`
      });

    } catch (error) {
      console.error('Error generating Excel report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate Excel report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const generateCSVReport = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 20, 90));
      }, 250);

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      clearInterval(progressInterval);
      setProgress(100);

      const csvData = `Date,Batch,Product,Machine,Operator,Target,Produced,Efficiency\n${new Date().toLocaleDateString().replace(/,/g, '')},BATCH-001,Plastic Containers,Machine A,John Doe,1250,1250,100%\n${new Date().toLocaleDateString().replace(/,/g, '')},BATCH-002,Food Packaging,Machine B,Jane Smith,890,890,100%\n${new Date().toLocaleDateString().replace(/,/g, '')},BATCH-003,Industrial Parts,Machine C,Bob Johnson,2100,1850,88%`;

      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType.label.replace(/\s+/g, '_').toLowerCase()}_data_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'CSV Report Generated',
        description: `${reportType.label} data has been downloaded.`
      });

    } catch (error) {
      console.error('Error generating CSV report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate CSV report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
          <p className="text-gray-400">Generate production reports in various formats</p>
        </div>
      </div>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Report Configuration</CardTitle>
          <CardDescription className="text-gray-400">Customize your report settings</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Report Type</Label>
              <Select value={reportType.value} onValueChange={(value) => setReportType(reportTypes.find(type => type.value === value) || reportType)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select a report type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={
                      "w-full justify-start text-left font-normal bg-gray-800 border-gray-600 text-white hover:bg-gray-700" +
                      (dateRange?.from ? "pl-3.5" : "")
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        `${dateRange.from?.toLocaleDateString()} - ${dateRange.to?.toLocaleDateString()}`
                      ) : (
                        dateRange.from?.toLocaleDateString()
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('2023-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Additional filters can be added here based on the report type */}
          {reportType.value === 'machine_performance' && (
            <div>
              <Label htmlFor="machine-filter" className="text-gray-300">Filter by Machine</Label>
              <Input
                id="machine-filter"
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Enter machine name"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button
          onClick={generatePDFReport}
          disabled={isGenerating}
          className="bg-red-600 hover:bg-red-700"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Generate PDF
            </>
          )}
        </Button>

        <Button
          onClick={generateExcelReport}
          disabled={isGenerating}
          className="bg-green-600 hover:bg-green-700"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Generate Excel
            </>
          )}
        </Button>

        <Button
          onClick={generateCSVReport}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <File className="h-4 w-4 mr-2" />
              Generate CSV
            </>
          )}
        </Button>
      </div>

      {isGenerating && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Generating Report</CardTitle>
            <CardDescription className="text-gray-400">Please wait while the report is being generated...</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} />
            <p className="text-sm text-gray-400 mt-2">Generating {reportType.label} report... {progress}%</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
