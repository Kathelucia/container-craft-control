import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WelcomeHeader } from '@/components/welcome/WelcomeHeader';
import {
  Play,
  Square,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Target,
  Wrench
} from 'lucide-react';

const activeBatches = [
  { 
    id: 'B2024-0158', 
    product: '500ml Premium Water Bottle', 
    quantity: 2400, 
    completed: 1875, 
    status: 'running',
    machine: 'Injection Molding Line #4',
    startTime: '06:45 AM',
    estimatedCompletion: '02:30 PM'
  },
  { 
    id: 'B2024-0159', 
    product: '1L Food Storage Container', 
    quantity: 1200, 
    completed: 385, 
    status: 'running',
    machine: 'Blow Molding Unit #2',
    startTime: '08:15 AM',
    estimatedCompletion: '04:45 PM'
  },
];

const myTasks = [
  { id: 1, task: 'Quality inspection for Batch B2024-0158', priority: 'high', dueTime: '01:30 PM' },
  { id: 2, task: 'Machine calibration - Production Line #5', priority: 'medium', dueTime: '03:45 PM' },
  { id: 3, task: 'Material refill - Raw Material Bay C', priority: 'low', dueTime: '05:15 PM' },
];

export function MachineOperatorDashboard() {
  return (
    <div className="space-y-6">
      <WelcomeHeader />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="metric-card bg-gradient-to-br from-blue-600/20 to-blue-700/20 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Batches</CardTitle>
            <Package className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">2</div>
            <div className="text-sm text-gray-400">Currently running</div>
          </CardContent>
        </Card>

        <Card className="metric-card bg-gradient-to-br from-green-600/20 to-green-700/20 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Today's Target</CardTitle>
            <Target className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white animate-fade-in">3,600</div>
            <div className="text-sm text-green-400">2,260 completed (63%)</div>
          </CardContent>
        </Card>

        <Card className="metric-card bg-gradient-to-br from-emerald-600/20 to-emerald-700/20 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Quality Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white animate-fade-in">99.2%</div>
            <div className="text-sm text-gray-400">Last 24 hours</div>
          </CardContent>
        </Card>

        <Card className="metric-card bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">3</div>
            <div className="text-sm text-yellow-400">1 high priority</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Batches */}
      <Card className="betaflow-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Package className="h-5 w-5 text-blue-400 mr-2" />
            Active Batches
          </CardTitle>
          <CardDescription>Monitor and control your assigned production batches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeBatches.map((batch) => (
              <div key={batch.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{batch.id}</h3>
                    <p className="text-sm text-gray-400">{batch.product}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="status-running">
                      {batch.status}
                    </Badge>
                    <Button size="sm" variant="outline" className="text-yellow-400 border-yellow-400 hover:bg-yellow-400/10">
                      <Square className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Machine</p>
                    <p className="text-sm font-medium text-white">{batch.machine}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Started</p>
                    <p className="text-sm font-medium text-white">{batch.startTime}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Est. Completion</p>
                    <p className="text-sm font-medium text-white">{batch.estimatedCompletion}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{batch.completed}/{batch.quantity} units</span>
                  </div>
                  <Progress value={(batch.completed / batch.quantity) * 100} className="h-2" />
                  <div className="text-right text-xs text-gray-400">
                    {Math.round((batch.completed / batch.quantity) * 100)}% complete
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="betaflow-card">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription>Common tasks and controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Start New Batch
            </Button>
            <Button variant="outline" className="w-full justify-start border-yellow-500 text-yellow-400 hover:bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report Quality Issue
            </Button>
            <Button variant="outline" className="w-full justify-start border-blue-500 text-blue-400 hover:bg-blue-500/10">
              <Wrench className="h-4 w-4 mr-2" />
              Request Maintenance
            </Button>
          </CardContent>
        </Card>

        {/* My Tasks */}
        <Card className="betaflow-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="h-5 w-5 text-yellow-400 mr-2" />
              My Tasks
            </CardTitle>
            <CardDescription>Assigned tasks and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{task.task}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge 
                        variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-gray-400">Due: {task.dueTime}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-green-400 hover:bg-green-400/10">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
