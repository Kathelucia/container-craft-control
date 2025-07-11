
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  FileText,
  Download,
  Calendar as CalendarIcon,
  BarChart3,
  Package,
  Users,
  TrendingUp,
  Factory,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Filter
} from 'lucide-react';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  frequency: string;
  lastGenerated?: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'production-summary',
    name: 'Production Summary',
    description: 'Overall production metrics, efficiency, and output summary',
    category: 'Production',
    icon: <Factory className="h-5 w-5" />,
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    frequency: 'Daily',
    lastGenerated: '2024-01-15'
  },
  {
    id: 'machine-utilization',
    name: 'Machine Utilization Report',
    description: 'Equipment efficiency, downtime analysis, and maintenance schedules',
    category: 'Operations',
    icon: <BarChart3 className="h-5 w-5" />,
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
    frequency: 'Weekly',
    lastGenerated: '2024-01-12'
  },
  {
    id: 'quality-control',
    name: 'Quality Control Report',
    description: 'Defect rates, quality metrics, and compliance tracking',
    category: 'Quality',
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    frequency: 'Weekly',
    lastGenerated: '2024-01-14'
  },
  {
    id: 'inventory-status',
    name: 'Inventory Status Report',
    description: 'Stock levels, material consumption, and procurement needs',
    category: 'Inventory',
    icon: <Package className="h-5 w-5" />,
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    frequency: 'Weekly',
    lastGenerated: '2024-01-13'
  },
  {
    id: 'employee-performance',
    name: 'Employee Performance',
    description: 'Productivity metrics, task completion, and performance analysis',
    category: 'HR',
    icon: <Users className="h-5 w-5" />,
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    frequency: 'Monthly',
    lastGenerated: '2024-01-01'
  },
  {
    id: 'financial-summary',
    name: 'Financial Summary',
    description: 'Cost analysis, revenue tracking, and budget performance',
    category: 'Finance',
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    frequency: 'Monthly',
    lastGenerated: '2024-01-01'
  },
  {
    id: 'safety-incidents',
    name: 'Safety & Incidents',
    description: 'Safety metrics, incident reports, and compliance tracking',
    category: 'Safety',
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
    frequency: 'Monthly',
    lastGenerated: '2024-01-10'
  },
  {
    id: 'customer-orders',
    name: 'Customer Orders Report',
    description: 'Order status, delivery performance, and customer satisfaction',
    category: 'Sales',
    icon: <FileText className="h-5 w-5" />,
    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    frequency: 'Weekly',
    lastGenerated: '2024-01-14'
  }
];

const recentReports = [
  {
    id: '1',
    name: 'Weekly Production Summary',
    type: 'Production Summary',
    generatedAt: '2024-01-15T10:30:00Z',
    status: 'completed',
    size: '2.3 MB'
  },
  {
    id: '2',
    name: 'Quality Control - Week 2',
    type: 'Quality Control Report',
    generatedAt: '2024-01-14T14:15:00Z',
    status: 'completed',
    size: '1.8 MB'
  },
  {
    id: '3',
    name: 'Machine Utilization - January',
    type: 'Machine Utilization Report',
    generatedAt: '2024-01-12T09:00:00Z',
    status: 'completed',
    size: '3.1 MB'
  },
  {
    id: '4',
    name: 'Inventory Status Report',
    type: 'Inventory Status Report',
    generatedAt: '2024-01-13T16:45:00Z',
    status: 'completed',
    size: '1.2 MB'
  }
];

export function Reports() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [reportName, setReportName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const categories = [...new Set(reportTemplates.map(template => template.category))];
  
  const filteredTemplates = selectedCategory === 'all' 
    ? reportTemplates 
    : reportTemplates.filter(template => template.category === selectedCategory);

  const generateReport = async () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      toast({
        title: 'Report Generated Successfully',
        description: `${reportName || selectedTemplate.name} has been generated and is ready for download.`
      });
      setIsGenerating(false);
      setSelectedTemplate(null);
      setReportName('');
      setDateRange({ from: undefined, to: undefined });
    }, 3000);
  };

  const downloadReport = (reportId: string) => {
    toast({
      title: 'Download Started',
      description: 'Report download has started successfully.'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
          <p className="text-gray-400">Generate and manage business reports</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="metric-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Available Templates</p>
                <p className="text-2xl font-bold text-white">{reportTemplates.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Reports Generated</p>
                <p className="text-2xl font-bold text-white">247</p>
                <p className="text-xs text-green-400">+12 this week</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Scheduled Reports</p>
                <p className="text-2xl font-bold text-white">15</p>
                <p className="text-xs text-yellow-400">3 due today</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Storage Used</p>
                <p className="text-2xl font-bold text-white">45.2 GB</p>
                <p className="text-xs text-gray-400">of 100 GB</p>
              </div>
              <Package className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card className="betaflow-card">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className={selectedCategory === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-600 text-gray-300 hover:bg-gray-800'}
            >
              All Categories
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-600 text-gray-300 hover:bg-gray-800'}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => (
          <Card key={template.id} className="betaflow-card hover:bg-gray-800/40 transition-all duration-200 hover-scale animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${template.color} border`}>
                    {template.icon}
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                    <Badge variant="outline" className="mt-1 text-xs border-gray-600 text-gray-400">
                      {template.category}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardDescription className="text-gray-400">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">Frequency</p>
                  <p className="text-white font-medium">{template.frequency}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Last Generated</p>
                  <p className="text-white font-medium">
                    {template.lastGenerated ? new Date(template.lastGenerated).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setSelectedTemplate(template)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card className="betaflow-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileText className="h-5 w-5 text-green-400 mr-2" />
            Recent Reports
          </CardTitle>
          <CardDescription>Recently generated reports ready for download</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report, index) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{report.name}</h3>
                    <p className="text-sm text-gray-400">{report.type}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={`${getStatusColor(report.status)} border text-xs`}>
                        {report.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(report.generatedAt).toLocaleDateString()} • {report.size}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm" 
                    onClick={() => downloadReport(report.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Generation Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-gray-900 border-gray-700 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                {selectedTemplate.icon}
                <span className="ml-2">Generate {selectedTemplate.name}</span>
              </CardTitle>
              <CardDescription>
                Configure report parameters and generate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="report-name" className="text-gray-300">Report Name</Label>
                <Input
                  id="report-name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder={selectedTemplate.name}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label className="text-gray-300">To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Format</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV File</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <div className="flex justify-end space-x-2 p-6 pt-0">
              <Button
                variant="outline"
                onClick={() => setSelectedTemplate(null)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={generateReport}
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
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
