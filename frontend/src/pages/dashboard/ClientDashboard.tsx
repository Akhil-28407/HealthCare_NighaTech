import { useQuery } from '@tanstack/react-query';
import { labReportsApi, invoicesApi } from '../../api';
import { useAuthStore } from '../../stores/auth.store';
import { FiActivity, FiDollarSign, FiDownload } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const { data: reportsData } = useQuery({ queryKey: ['my-reports'], queryFn: () => labReportsApi.getAll({ clientId: user?._id, limit: 10 }) });
  const { data: invoicesData } = useQuery({ queryKey: ['my-invoices'], queryFn: () => invoicesApi.getAll({ clientId: user?._id, limit: 10 }) });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
        <p className="text-surface-300 mt-1">Welcome, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="stat-card glass-card">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center"><FiActivity className="text-white" size={22} /></div>
          <p className="text-3xl font-bold text-white mt-3">{reportsData?.data?.total ?? 0}</p>
          <p className="text-sm text-surface-300">My Reports</p>
        </div>
        <div className="stat-card glass-card">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center"><FiDollarSign className="text-white" size={22} /></div>
          <p className="text-3xl font-bold text-white mt-3">{invoicesData?.data?.total ?? 0}</p>
          <p className="text-sm text-surface-300">My Invoices</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">My Lab Reports</h3>
        <div className="space-y-3">
          {reportsData?.data?.reports?.map((report: any) => (
            <div key={report._id} className="flex items-center justify-between p-3 bg-surface-800/30 rounded-xl">
              <div>
                <p className="text-sm font-medium text-white">{report.reportNumber}</p>
                <p className="text-xs text-surface-300">{report.testId?.name} — {new Date(report.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${report.status === 'VERIFIED' ? 'badge-success' : 'badge-warning'}`}>{report.status}</span>
                {report.status === 'VERIFIED' && (
                  <Link to={`/reports/${report._id}`} className="text-primary-400 hover:text-primary-300"><FiDownload size={16} /></Link>
                )}
              </div>
            </div>
          )) || <p className="text-sm text-surface-300">No reports yet</p>}
        </div>
      </div>
    </div>
  );
}
