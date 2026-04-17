import { useQuery } from '@tanstack/react-query';
import { testOrdersApi, labReportsApi } from '../../api';
import { useAuthStore } from '../../stores/auth.store';
import { FiFileText, FiActivity, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function LabDashboard() {
  const { user } = useAuthStore();
  const isLabEmp = user?.role === 'LAB_EMP';

  // If no branchId, user hasn't requested a branch yet
  if (!user?.branchId) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{isLabEmp ? 'Lab Employee' : 'Lab'} Dashboard</h1>
          <p className="text-surface-300 mt-1">Welcome, {user?.name}</p>
        </div>

        <div className="glass-card p-8 border border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-start gap-4">
            <FiAlertCircle className="text-yellow-400 flex-shrink-0 mt-1" size={24} />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-2">Lab Registration Pending</h2>
              <p className="text-surface-300 mb-4">
                Your lab registration is awaiting approval. To get started, please request your lab branch for admin verification.
              </p>
              <Link 
                to="/lab/branches" 
                className="btn-primary inline-flex items-center gap-2"
              >
                <FiFileText size={16} />
                Request Lab Branch
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { data: ordersData } = useQuery({ queryKey: ['orders'], queryFn: () => testOrdersApi.getAll({ limit: 10 }) });
  const { data: reportsData } = useQuery({ queryKey: ['reports'], queryFn: () => labReportsApi.getAll({ limit: 10 }) });

  const pendingReports = reportsData?.data?.reports?.filter((r: any) => r.status === 'PENDING') || [];
  const enteredReports = reportsData?.data?.reports?.filter((r: any) => r.status === 'RESULTS_ENTERED') || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">{isLabEmp ? 'Lab Employee' : 'Lab'} Dashboard</h1>
        <p className="text-surface-300 mt-1">Welcome, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="stat-card glass-card">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <FiFileText className="text-white" size={22} />
          </div>
          <p className="text-3xl font-bold text-white mt-3">{ordersData?.data?.total ?? 0}</p>
          <p className="text-sm text-surface-300">Total Orders</p>
        </div>
        <div className="stat-card glass-card">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
            <FiClock className="text-white" size={22} />
          </div>
          <p className="text-3xl font-bold text-white mt-3">{pendingReports.length}</p>
          <p className="text-sm text-surface-300">Pending Results</p>
        </div>
        <div className="stat-card glass-card">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <FiActivity className="text-white" size={22} />
          </div>
          <p className="text-3xl font-bold text-white mt-3">{enteredReports.length}</p>
          <p className="text-sm text-surface-300">Awaiting Verification</p>
        </div>
        <div className="stat-card glass-card">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <FiCheckCircle className="text-white" size={22} />
          </div>
          <p className="text-3xl font-bold text-white mt-3">{reportsData?.data?.total ?? 0}</p>
          <p className="text-sm text-surface-300">Total Reports</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Pending Reports</h3>
        <div className="space-y-3">
          {pendingReports.length === 0 ? (
            <p className="text-surface-300 text-sm">No pending reports 🎉</p>
          ) : pendingReports.map((r: any) => (
            <div key={r._id} className="flex items-center justify-between p-3 bg-surface-800/30 rounded-xl">
              <div>
                <p className="text-sm font-medium text-white">{r.reportNumber}</p>
                <p className="text-xs text-surface-300">{r.clientId?.name} — {r.testId?.name}</p>
              </div>
              <span className="badge badge-warning">{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
