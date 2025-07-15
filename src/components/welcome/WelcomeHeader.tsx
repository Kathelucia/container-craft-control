
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Factory, Clock, Users } from 'lucide-react';

export function WelcomeHeader() {
  const { profile } = useAuth();
  
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'production_manager':
        return { label: 'Production Manager', color: 'bg-blue-500' };
      case 'machine_operator':
        return { label: 'Machine Operator', color: 'bg-green-500' };
      case 'operations_admin':
        return { label: 'Operations Admin', color: 'bg-purple-500' };
      default:
        return { label: 'User', color: 'bg-gray-500' };
    }
  };

  const roleInfo = getRoleDisplay(profile?.role || '');
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <Card className="betaflow-card mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Factory className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl font-bold text-white">Welcome back, {profile?.full_name}</h1>
                <Badge className={`${roleInfo.color} text-white text-xs`}>
                  {roleInfo.label}
                </Badge>
              </div>
              <p className="text-gray-400">BetaFlow Manufacturing Management System</p>
            </div>
          </div>
          
          <div className="text-right space-y-1">
            <div className="flex items-center text-gray-300">
              <Clock className="h-4 w-4 mr-2" />
              <span className="font-mono text-lg">{currentTime}</span>
            </div>
            <p className="text-sm text-gray-400">{currentDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
