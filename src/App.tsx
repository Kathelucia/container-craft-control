import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/auth/LoginForm";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductionManagerDashboard } from "@/components/dashboard/ProductionManagerDashboard";
import { MachineOperatorDashboard } from "@/components/dashboard/MachineOperatorDashboard";
import { AdminExecutiveDashboard } from "@/components/dashboard/AdminExecutiveDashboard";
import { ProductionWorkflow } from "@/components/production/ProductionWorkflow";
import { MachineStatus } from "@/components/machines/MachineStatus";
import { SalesOrders } from "@/components/sales/SalesOrders";
import { InventoryManagement } from "@/components/inventory/InventoryManagement";
import { EmployeeManagement } from "@/components/employees/EmployeeManagement";
import { Analytics } from "@/components/analytics/Analytics";
import { Reports } from "@/components/reports/Reports";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function DashboardRouter() {
  const { user } = useAuth();
  
  if (!user) return null;

  switch (user.role) {
    case 'production_manager':
      return <ProductionManagerDashboard />;
    case 'machine_operator':
      return <MachineOperatorDashboard />;
    case 'admin_executive':
      return <AdminExecutiveDashboard />;
    default:
      return <ProductionManagerDashboard />;
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <LoginForm />;
  }
  
  return <AppLayout>{children}</AppLayout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/production"
              element={
                <ProtectedRoute>
                  <ProductionWorkflow />
                </ProtectedRoute>
              }
            />
            <Route
              path="/machines"
              element={
                <ProtectedRoute>
                  <MachineStatus />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/batches"
              element={
                <ProtectedRoute>
                  <ProductionWorkflow />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quality"
              element={
                <ProtectedRoute>
                  <div className="text-white">Quality Control - Coming Soon</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <SalesOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <InventoryManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <EmployeeManagement />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
