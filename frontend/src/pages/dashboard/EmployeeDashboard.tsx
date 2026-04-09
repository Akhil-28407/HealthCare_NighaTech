import { useQuery } from '@tanstack/react-query';
import { testOrdersApi, invoicesApi } from '../../api';
import { useAuthStore } from '../../stores/auth.store';
import { FiFileText, FiDollarSign, FiUserCheck } from 'react-icons/fi';

export default function EmployeeDashboard() {
  const { user } = useAuthStore();
  const { data: ordersData } = useQuery({ queryKey: ['orders'], queryFn: () => testOrdersApi.getAll({ limit: 5 }) });
  const { data: invoicesData } = useQuery({ queryKey: ['invoices'], queryFn: () => invoicesApi.getAll({ limit: 5 }) });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Employee Dashboard</h1>
        <p className="text-surface-300 mt-1">Welcome, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="stat-card glass-card">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"><FiUserCheck className="text-white" size={22} /></div>
          <p className="text-3xl font-bold text-white mt-3">{ordersData?.data?.total ?? 0}</p>
          <p className="text-sm text-surface-300">Test Orders</p>
        </div>
        <div className="stat-card glass-card">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center"><FiDollarSign className="text-white" size={22} /></div>
          <p className="text-3xl font-bold text-white mt-3">{invoicesData?.data?.total ?? 0}</p>
          <p className="text-sm text-surface-300">Invoices</p>
        </div>
        <div className="stat-card glass-card">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center"><FiFileText className="text-white" size={22} /></div>
          <p className="text-3xl font-bold text-white mt-3">
            {ordersData?.data?.orders?.filter((o: any) => o.status === 'ORDERED').length ?? 0}
          </p>
          <p className="text-sm text-surface-300">Pending Collection</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Orders</h3>
        <div className="space-y-3">
          {ordersData?.data?.orders?.map((order: any) => (
            <div key={order._id} className="flex items-center justify-between p-3 bg-surface-800/30 rounded-xl">
              <div>
                <p className="text-sm font-medium text-white">{order.orderNumber}</p>
                <p className="text-xs text-surface-300">{order.clientId?.name}</p>
              </div>
              <span className={`badge ${order.status === 'COMPLETED' ? 'badge-success' : order.status === 'ORDERED' ? 'badge-primary' : 'badge-warning'}`}>{order.status}</span>
            </div>
          )) || <p className="text-sm text-surface-300">No orders yet</p>}
        </div>
      </div>
    </div>
  );
}
