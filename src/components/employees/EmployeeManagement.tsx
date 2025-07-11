
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Plus,
  Search,
  UserCheck,
  UserX,
  Clock,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Shield,
  Activity
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department: string | null;
  shift: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

interface EmployeeTask {
  id: string;
  title: string;
  status: string;
  priority: string | null;
  assigned_to: string;
  due_date: string | null;
  created_at: string;
}

export function EmployeeManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Profile | null>(null);
  const { toast } = useToast();

  // New task form state
  const [newTask, setNewTask] = useState({
    assigned_to: '',
    title: '',
    priority: 'medium',
    due_date: ''
  });

  useEffect(() => {
    fetchProfiles();
    fetchTasks();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch employee profiles',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const createTask = async () => {
    try {
      const { error } = await supabase
        .from('employee_tasks')
        .insert({
          assigned_to: newTask.assigned_to,
          title: newTask.title,
          priority: newTask.priority,
          due_date: newTask.due_date || null,
          status: 'assigned'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Task assigned successfully'
      });

      setIsDialogOpen(false);
      setNewTask({
        assigned_to: '',
        title: '',
        priority: 'medium',
        due_date: ''
      });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign task',
        variant: 'destructive'
      });
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'production_manager': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'machine_operator': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'operations_admin': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'production_manager': return <Shield className="h-4 w-4" />;
      case 'machine_operator': return <UserCheck className="h-4 w-4" />;
      case 'operations_admin': return <Briefcase className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getTasksForEmployee = (employeeId: string) => {
    return tasks.filter(task => task.assigned_to === employeeId);
  };

  const getPendingTasksCount = (employeeId: string) => {
    return tasks.filter(task => 
      task.assigned_to === employeeId && 
      (task.status === 'assigned' || task.status === 'in_progress')
    ).length;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || profile.role === roleFilter;
    const matchesDepartment = departmentFilter === 'all' || profile.department === departmentFilter;
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const departments = [...new Set(profiles.map(p => p.department).filter(Boolean))];
  const activeEmployees = profiles.length;
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'assigned' || t.status === 'in_progress').length;

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
          <p className="text-gray-400">Manage team members and assign tasks</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 hover-scale">
              <Plus className="h-4 w-4 mr-2" />
              Assign Task
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Assign New Task</DialogTitle>
              <DialogDescription>
                Assign a task to an employee
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="assigned_to" className="text-gray-300">Assign To</Label>
                <Select value={newTask.assigned_to} onValueChange={(value) => setNewTask(prev => ({ ...prev, assigned_to: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {profiles.map(profile => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.full_name} ({profile.role.replace('_', ' ')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title" className="text-gray-300">Task Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority" className="text-gray-300">Priority</Label>
                  <Select value={newTask.priority} onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="due_date" className="text-gray-300">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createTask} className="bg-blue-600 hover:bg-blue-700">
                Assign Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Employees</p>
                <p className="text-2xl font-bold text-white">{activeEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold text-purple-400">{totalTasks}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending Tasks</p>
                <p className="text-2xl font-bold text-yellow-400">{pendingTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Departments</p>
                <p className="text-2xl font-bold text-green-400">{departments.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="betaflow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48 bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="production_manager">Production Manager</SelectItem>
                <SelectItem value="machine_operator">Machine Operator</SelectItem>
                <SelectItem value="operations_admin">Operations Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-48 bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employees List */}
      <div className="grid gap-4">
        {filteredProfiles.map((profile, index) => {
          const employeeTasks = getTasksForEmployee(profile.id);
          const pendingTasksCount = getPendingTasksCount(profile.id);
          
          return (
            <Card key={profile.id} className="betaflow-card hover:bg-gray-800/40 transition-all duration-200 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 bg-blue-600">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getInitials(profile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{profile.full_name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={`${getRoleColor(profile.role)} border flex items-center space-x-1`}>
                          {getRoleIcon(profile.role)}
                          <span>{profile.role.replace('_', ' ')}</span>
                        </Badge>
                        {profile.department && (
                          <Badge variant="outline" className="text-gray-400 border-gray-600">
                            {profile.department}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEmployee(profile)}
                    className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
                  >
                    View Details
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="text-sm text-white">{profile.email}</p>
                    </div>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="text-sm text-white">{profile.phone}</p>
                      </div>
                    </div>
                  )}
                  {profile.shift && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">Shift</p>
                        <p className="text-sm text-white">{profile.shift}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Pending Tasks</p>
                      <p className="text-sm text-yellow-400 font-medium">{pendingTasksCount}</p>
                    </div>
                  </div>
                </div>

                {employeeTasks.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-gray-400 text-xs mb-2">Recent Tasks</p>
                    <div className="space-y-1">
                      {employeeTasks.slice(0, 3).map(task => (
                        <div key={task.id} className="flex items-center justify-between">
                          <p className="text-sm text-white truncate">{task.title}</p>
                          <Badge 
                            variant={task.status === 'completed' ? 'default' : 'outline'}
                            className={`text-xs ${
                              task.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                              task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                              'bg-yellow-500/10 text-yellow-400'
                            }`}
                          >
                            {task.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredProfiles.length === 0 && (
          <Card className="betaflow-card">
            <CardContent className="text-center py-12">
              <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Employees Found</h3>
              <p className="text-gray-400">
                {searchTerm || roleFilter !== 'all' || departmentFilter !== 'all'
                  ? 'No employees match your current filters'
                  : 'No employee profiles available'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center">
                <Avatar className="h-8 w-8 bg-blue-600 mr-3">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {getInitials(selectedEmployee.full_name)}
                  </AvatarFallback>
                </Avatar>
                {selectedEmployee.full_name}
              </DialogTitle>
              <DialogDescription>
                Employee details and task history
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Role</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={`${getRoleColor(selectedEmployee.role)} border flex items-center space-x-1`}>
                      {getRoleIcon(selectedEmployee.role)}
                      <span>{selectedEmployee.role.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400">Department</Label>
                  <p className="text-white">{selectedEmployee.department || 'Not assigned'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Email</Label>
                  <p className="text-white">{selectedEmployee.email}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Phone</Label>
                  <p className="text-white">{selectedEmployee.phone || 'Not provided'}</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-400">Shift</Label>
                <p className="text-white">{selectedEmployee.shift || 'Not assigned'}</p>
              </div>
              <div>
                <Label className="text-gray-400">Member Since</Label>
                <p className="text-white">{new Date(selectedEmployee.created_at).toLocaleDateString()}</p>
              </div>
              
              {/* Employee Tasks */}
              <div>
                <Label className="text-gray-400">Assigned Tasks ({getTasksForEmployee(selectedEmployee.id).length})</Label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                  {getTasksForEmployee(selectedEmployee.id).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                      <div>
                        <p className="text-sm text-white">{task.title}</p>
                        <p className="text-xs text-gray-400">
                          {task.due_date ? `Due: ${new Date(task.due_date).toLocaleDateString()}` : 'No due date'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {task.priority && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              task.priority === 'high' ? 'border-red-500 text-red-400' :
                              task.priority === 'medium' ? 'border-yellow-500 text-yellow-400' :
                              'border-green-500 text-green-400'
                            }`}
                          >
                            {task.priority}
                          </Badge>
                        )}
                        <Badge 
                          variant={task.status === 'completed' ? 'default' : 'outline'}
                          className={`text-xs ${
                            task.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                            task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-yellow-500/10 text-yellow-400'
                          }`}
                        >
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {getTasksForEmployee(selectedEmployee.id).length === 0 && (
                    <p className="text-gray-400 text-sm">No tasks assigned</p>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
