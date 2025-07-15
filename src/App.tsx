
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AuthPage } from "@/components/auth/AuthPage";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (replaces cacheTime)
    },
  },
});

function DashboardRouter() {
  const { profile } = useAuth();
  
  if (!profile) return null;

  switch (profile.role) {
    case 'production_manager':
      return <ProductionManagerDashboard />;
    case 'machine_operator':
      return <MachineOperatorDashboard />;
    case 'operations_admin':
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
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">BetaFlow</h2>
            <p className="text-gray-400">Manufacturing Management System</p>
            <p className="text-sm text-gray-500">Loading your workspace...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <AuthPage />;
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
            <Route path="/auth" element={<AuthPage />} />
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
                  <div className="p-6">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-white mb-2">Quality Control</h1>
                      <p className="text-gray-400">Advanced quality management features coming soon</p>
                    </div>
                  </div>
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
