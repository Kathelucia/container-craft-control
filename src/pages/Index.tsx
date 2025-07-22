import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Factory, Package, Wrench, Users, BarChart3, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Factory className="h-8 w-8 text-primary animate-pulse" />
            <h2 className="text-xl font-semibold">BetaFlow</h2>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Factory className="h-12 w-12 text-primary" />
              <h1 className="text-5xl font-bold gradient-text">BetaFlow</h1>
            </div>
            <h2 className="text-3xl font-bold mb-4">Manufacturing Management System</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              End production delays, lost inventory, maintenance neglect, and zero accountability. 
              Transform your manufacturing operations with real-time tracking and smart automation.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="hover-scale" onClick={() => window.location.href = '/auth'}>
                Get Started
              </Button>
              <Button variant="outline" size="lg" className="hover-scale">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Core Modules Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold mb-4">Core System Modules</h3>
          <p className="text-muted-foreground">Real-world optimization for manufacturing operations</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="betaflow-card hover-scale">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Factory className="h-6 w-6 text-primary" />
                <CardTitle>Production Workflow</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Live production tracking, batch management, and real-time status monitoring
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="betaflow-card hover-scale">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Package className="h-6 w-6 text-primary" />
                <CardTitle>Inventory Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Smart stock tracking, automatic reorder alerts, and supplier management
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="betaflow-card hover-scale">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Wrench className="h-6 w-6 text-primary" />
                <CardTitle>Machine Maintenance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Preventive maintenance scheduling, downtime tracking, and repair logs
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="betaflow-card hover-scale">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <ClipboardList className="h-6 w-6 text-primary" />
                <CardTitle>Sales & Orders</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Order tracking, customer management, and delivery scheduling
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="betaflow-card hover-scale">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-primary" />
                <CardTitle>Employee Tasks</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Task assignments, shift management, and performance tracking
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="betaflow-card hover-scale">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <CardTitle>Analytics & Reports</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Comprehensive reporting, KPI dashboards, and data insights
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Role-Based Dashboards */}
      <div className="bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">Role-Based Dashboards</h3>
            <p className="text-muted-foreground">Tailored interfaces for every role in your manufacturing operation</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="betaflow-card">
              <CardHeader>
                <CardTitle className="text-center">🔧 Production Manager</CardTitle>
                <CardDescription className="text-center">
                  "Why aren't we meeting quota?"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Live Production Status</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Machine Utilization Charts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Downtime Logs & Alerts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Production Scheduling</span>
                </div>
              </CardContent>
            </Card>

            <Card className="betaflow-card">
              <CardHeader>
                <CardTitle className="text-center">🧑‍🏭 Machine Operator</CardTitle>
                <CardDescription className="text-center">
                  Simple interface for the floor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Today's Assigned Tasks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Time per Batch Tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Quick Issue Reporting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Task Completion Logging</span>
                </div>
              </CardContent>
            </Card>

            <Card className="betaflow-card">
              <CardHeader>
                <CardTitle className="text-center">📊 Operations Admin</CardTitle>
                <CardDescription className="text-center">
                  Logistics & reporting oversight
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Stock Level Monitoring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Sales Order Tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Dispatch Management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Revenue Reports & Analytics</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Manufacturing?</h3>
          <p className="text-muted-foreground mb-8">
            End the chaos of WhatsApp coordination and manual tracking. Get real-time visibility and accountability.
          </p>
          <Button size="lg" className="hover-scale" onClick={() => window.location.href = '/auth'}>
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
