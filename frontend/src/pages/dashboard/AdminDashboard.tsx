import { useQuery } from '@tanstack/react-query';
import { usersApi, branchesApi, clientsApi, testOrdersApi, labReportsApi, invoicesApi } from '../../api';
import { useAuthStore } from '../../stores/auth.store';
import { FiUsers, FiMapPin, FiUserCheck, FiFileText, FiActivity, FiDollarSign, FiTrendingUp, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function StatCard({ icon: Icon, label, value, color, link }: any) {
  return (
    <Link to={link || '#'} className="stat-card glass-card-hover group">
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
        <FiTrendingUp className="text-surface-300 group-hover:text-primary-400 transition-colors" size={16} />
      </div>
      <div className="mt-3">
        <p className="text-3xl font-bold text-white">{value ?? '—'}</p>
        <p className="text-sm text-surface-300 mt-1">{label}</p>
      </div>
    </Link>
  );
}

export default function SuperAdminDashboard() {
  const { user } = useAuthStore();
  const basePath = user?.role === 'ADMIN' ? '/admin' : '/superadmin';

  const { data: usersData } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll({ limit: 1 }) });
  const { data: branchesData } = useQuery({ queryKey: ['branches'], queryFn: () => branchesApi.getAll({ limit: 1 }) });
  const { data: clientsData } = useQuery({ queryKey: ['clients'], queryFn: () => clientsApi.getAll({ limit: 1 }) });
  const { data: ordersData } = useQuery({ queryKey: ['orders'], queryFn: () => testOrdersApi.getAll({ limit: 5 }) });
  const { data: reportsData } = useQuery({ queryKey: ['reports'], queryFn: () => labReportsApi.getAll({ limit: 5 }) });
  const { data: invoicesData } = useQuery({ queryKey: ['invoices'], queryFn: () => invoicesApi.getAll({ limit: 5 }) });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-surface-300 mt-1">Welcome back, {user?.name}! Here's your system overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <StatCard icon={FiUsers} label="Total Users" value={usersData?.data?.total} color="bg-gradient-to-br from-blue-500 to-blue-600" link={`${basePath}/users`} />
        <StatCard icon={FiMapPin} label="Branches" value={branchesData?.data?.total} color="bg-gradient-to-br from-purple-500 to-purple-600" link={`${basePath}/branches`} />
        <StatCard icon={FiUserCheck} label="Clients" value={clientsData?.data?.total} color="bg-gradient-to-br from-green-500 to-green-600" link={`${basePath}/clients`} />
        <StatCard icon={FiFileText} label="Test Orders" value={ordersData?.data?.total} color="bg-gradient-to-br from-orange-500 to-orange-600" link={`${basePath}/orders`} />
        <StatCard icon={FiActivity} label="Lab Reports" value={reportsData?.data?.total} color="bg-gradient-to-br from-red-500 to-red-600" link={`${basePath}/reports`} />
        <StatCard icon={FiDollarSign} label="Invoices" value={invoicesData?.data?.total} color="bg-gradient-to-br from-primary-500 to-primary-600" link={`${basePath}/invoices`} />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiClock className="text-primary-400" /> Recent Test Orders
          </h3>
          <div className="space-y-3">
            {ordersData?.data?.orders?.slice(0, 5).map((order: any) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-surface-800/30 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-white">{order.orderNumber}</p>
                  <p className="text-xs text-surface-300">{order.clientId?.name || 'Unknown'}</p>
                </div>
                <span className={`badge ${
                  order.status === 'COMPLETED' ? 'badge-success' :
                  order.status === 'COLLECTED' ? 'badge-info' :
                  order.status === 'PROCESSING' ? 'badge-warning' : 'badge-primary'
                }`}>{order.status}</span>
              </div>
            )) || <p className="text-sm text-surface-300">No recent orders</p>}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiActivity className="text-primary-400" /> Recent Lab Reports
          </h3>
          <div className="space-y-3">
            {reportsData?.data?.reports?.slice(0, 5).map((report: any) => (
              <div key={report._id} className="flex items-center justify-between p-3 bg-surface-800/30 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-white">{report.reportNumber}</p>
                  <p className="text-xs text-surface-300">{report.testId?.name || 'Unknown'}</p>
                </div>
                <span className={`badge ${
                  report.status === 'VERIFIED' ? 'badge-success' :
                  report.status === 'RESULTS_ENTERED' ? 'badge-warning' : 'badge-info'
                }`}>{report.status}</span>
              </div>
            )) || <p className="text-sm text-surface-300">No recent reports</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
