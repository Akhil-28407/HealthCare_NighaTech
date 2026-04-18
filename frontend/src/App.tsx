import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/auth.store';
import { Role } from './types';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth Pages (Lazy)
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const OtpLoginPage = lazy(() => import('./pages/auth/OtpLoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const RegisterVendorPage = lazy(() => import('./pages/auth/RegisterVendorPage'));

// Dashboards (Lazy)
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const LabDashboard = lazy(() => import('./pages/dashboard/LabDashboard'));
const EmployeeDashboard = lazy(() => import('./pages/dashboard/EmployeeDashboard'));
const ClientDashboard = lazy(() => import('./pages/dashboard/ClientDashboard'));

// Management Pages (Lazy)
const UsersPage = lazy(() => import('./pages/manage/UsersPage'));
const BranchesPage = lazy(() => import('./pages/manage/BranchesPage'));
const ClientsPage = lazy(() => import('./pages/manage/ClientsPage'));
const TestCatalogPage = lazy(() => import('./pages/manage/TestCatalogPage'));
const TestOrdersPage = lazy(() => import('./pages/manage/TestOrdersPage'));
const LabReportsPage = lazy(() => import('./pages/manage/LabReportsPage'));
const InvoicesPage = lazy(() => import('./pages/manage/InvoicesPage'));
const QuotationsPage = lazy(() => import('./pages/manage/QuotationsPage'));
const TemplatesPage = lazy(() => import('./pages/manage/TemplatesPage'));
const AuditLogsPage = lazy(() => import('./pages/manage/AuditLogsPage'));
const BranchRequestsPage = lazy(() => import('./pages/manage/BranchRequestsPage'));

// Public Pages (Lazy)
const ReportViewPage = lazy(() => import('./pages/reports/ReportViewPage'));
const InvoiceViewPage = lazy(() => import('./pages/invoices/InvoiceViewPage'));
const QuotationViewPage = lazy(() => import('./pages/quotations/QuotationViewPage'));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function HomeRedirect() {
  const { user, isAuthenticated, accessToken } = useAuthStore();
  if (!isAuthenticated || !accessToken || !user) return <Navigate to="/login" />;
  const routes: Record<string, string> = {
    SUPER_ADMIN: '/superadmin/dashboard',
    ADMIN: '/admin/dashboard',
    EMPLOYEE: '/employee/dashboard',
    LAB: '/lab/dashboard',
    LAB_EMP: '/labemp/dashboard',
    CLIENT: '/client/dashboard',
  };
  return <Navigate to={routes[user?.role || ''] || '/login'} />;
}

function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="glass-card p-8 text-center">
        <h1 className="text-4xl font-bold text-red-400">403</h1>
        <p className="text-surface-300 mt-2">You don't have permission to access this page.</p>
        <a href="/" className="btn-primary inline-block mt-4">Go Home</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/otp-login" element={<OtpLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register-vendor" element={<RegisterVendorPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reports/:id" element={<ReportViewPage />} />
            <Route path="/invoices/:id" element={<InvoiceViewPage />} />
            <Route path="/quotations/:id" element={<QuotationViewPage />} />

            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Home Redirect */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Super Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={[Role.SUPER_ADMIN]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/superadmin/dashboard" element={<AdminDashboard />} />
                <Route path="/superadmin/users" element={<UsersPage />} />
                <Route path="/superadmin/branches" element={<BranchesPage />} />
                <Route path="/superadmin/branch-requests" element={<BranchRequestsPage />} />
                <Route path="/superadmin/clients" element={<ClientsPage />} />
                <Route path="/superadmin/tests" element={<TestCatalogPage />} />
                <Route path="/superadmin/orders" element={<TestOrdersPage />} />
                <Route path="/superadmin/reports" element={<LabReportsPage />} />
                <Route path="/superadmin/invoices" element={<InvoicesPage />} />
                <Route path="/superadmin/quotations" element={<QuotationsPage />} />
                <Route path="/superadmin/templates" element={<TemplatesPage />} />
                <Route path="/superadmin/audit-logs" element={<AuditLogsPage />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UsersPage />} />
                <Route path="/admin/branches" element={<BranchesPage />} />
                <Route path="/admin/clients" element={<ClientsPage />} />
                <Route path="/admin/tests" element={<TestCatalogPage />} />
                <Route path="/admin/orders" element={<TestOrdersPage />} />
                <Route path="/admin/reports" element={<LabReportsPage />} />
                <Route path="/admin/invoices" element={<InvoicesPage />} />
                <Route path="/admin/quotations" element={<QuotationsPage />} />
                <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
              </Route>
            </Route>

            {/* Employee Routes */}
            <Route element={<ProtectedRoute allowedRoles={[Role.EMPLOYEE]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                <Route path="/employee/clients" element={<ClientsPage />} />
                <Route path="/employee/orders" element={<TestOrdersPage />} />
                <Route path="/employee/invoices" element={<InvoicesPage />} />
                <Route path="/employee/quotations" element={<QuotationsPage />} />
              </Route>
            </Route>

            {/* Lab Routes */}
            <Route element={<ProtectedRoute allowedRoles={[Role.LAB]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/lab/dashboard" element={<LabDashboard />} />
                <Route path="/lab/users" element={<UsersPage />} />
                <Route path="/lab/branches" element={<BranchesPage />} />
                <Route path="/lab/clients" element={<ClientsPage />} />
                <Route path="/lab/orders" element={<TestOrdersPage />} />
                <Route path="/lab/reports" element={<LabReportsPage />} />
                <Route path="/lab/tests" element={<TestCatalogPage />} />
                <Route path="/lab/invoices" element={<InvoicesPage />} />
                <Route path="/lab/quotations" element={<QuotationsPage />} />
                <Route path="/lab/templates" element={<TemplatesPage />} />
              </Route>
            </Route>

            {/* Lab Employee Routes */}
            <Route element={<ProtectedRoute allowedRoles={[Role.LAB_EMP]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/labemp/dashboard" element={<LabDashboard />} />
                <Route path="/labemp/clients" element={<ClientsPage />} />
                <Route path="/labemp/orders" element={<TestOrdersPage />} />
                <Route path="/labemp/reports" element={<LabReportsPage />} />
                <Route path="/labemp/invoices" element={<InvoicesPage />} />
                <Route path="/labemp/quotations" element={<QuotationsPage />} />
              </Route>
            </Route>

            {/* Client Routes */}
            <Route element={<ProtectedRoute allowedRoles={[Role.CLIENT]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/client/dashboard" element={<ClientDashboard />} />
                <Route path="/client/reports" element={<LabReportsPage />} />
                <Route path="/client/invoices" element={<InvoicesPage />} />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid #334155',
          },
        }}
      />
    </QueryClientProvider>
  );
}
