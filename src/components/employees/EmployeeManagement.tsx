
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BulkUploadButton } from '@/components/upload/BulkUploadButton';
import {
  Users,
  Plus,
  Search,
  UserCheck,
  UserX,
  Clock,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department: string | null;
  shift: string | null;
  phone: string | null;
  created_at: string;
}

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch employees',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'production_manager': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'machine_operator': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'operations_admin': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-white mb-2">Employee Management</h1>
          <p className="text-gray-400">Manage employee profiles and assignments</p>
        </div>
        <div className="flex space-x-2">
          <BulkUploadButton />
          <Button className="bg-blue-600 hover:bg-blue-700 hover-scale">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Employees</p>
                <p className="text-2xl font-bold text-white">{employees.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Production Managers</p>
                <p className="text-2xl font-bold text-blue-400">
                  {employees.filter(e => e.role === 'production_manager').length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Machine Operators</p>
                <p className="text-2xl font-bold text-green-400">
                  {employees.filter(e => e.role === 'machine_operator').length}
                </p>
              </div>
              <UserX className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Operations Admin</p>
                <p className="text-2xl font-bold text-purple-400">
                  {employees.filter(e => e.role === 'operations_admin').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-400" />
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
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <div className="grid gap-4">
        {filteredEmployees.map((employee, index) => (
          <Card key={employee.id} className="betaflow-card hover:bg-gray-800/40 transition-all duration-200 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {employee.full_name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">{employee.full_name}</h3>
                    <p className="text-gray-400">{employee.email}</p>
                  </div>
                </div>
                <Badge className={`${getRoleColor(employee.role)} border`}>
                  {employee.role.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Department</p>
                    <p className="text-sm text-white">{employee.department || 'Not assigned'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Shift</p>
                    <p className="text-sm text-white">{employee.shift || 'Not assigned'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm text-white">{employee.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Joined</p>
                    <p className="text-sm text-white">
                      {new Date(employee.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredEmployees.length === 0 && (
          <Card className="betaflow-card">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Employees Found</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm 
                  ? 'No employees match your search terms' 
                  : 'Start by adding your first employee'
                }
              </p>
              {!searchTerm && (
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Employee
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
