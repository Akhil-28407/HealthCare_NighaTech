import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchesApi, testOrdersApi, clientsApi, testMasterApi, authApi } from '../../api';
import toast from 'react-hot-toast';
import { FiPlus, FiCornerDownRight, FiRefreshCw } from 'react-icons/fi';
import { useAuthStore } from '../../stores/auth.store';
import { Role } from '../../types';

export default function TestOrdersPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuthStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedBranchId = searchParams.get('branchId') || '';
  const isAdminScope = [Role.SUPER_ADMIN, Role.ADMIN].includes(currentUser?.role as Role);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ 
    clientId: '', 
    tests: [] as string[], 
    branchId: '', 
    notes: '', 
    discount: 0,
    autoCollect: true 
  });

  const getReportsPath = (orderId?: string) => {
    if (!currentUser) return '/';
    const routes: Record<string, string> = {
      SUPER_ADMIN: '/superadmin/reports',
      ADMIN: '/admin/reports',
      LAB: '/lab/reports',
      LAB_EMP: '/labemp/reports',
      CLIENT: '/client/reports',
    };
    const basePath = routes[currentUser.role] || '/';
    return orderId ? `${basePath}?testOrderId=${orderId}` : basePath;
  };

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['test-orders', selectedBranchId],
    queryFn: () => testOrdersApi.getAll({ ...(selectedBranchId ? { branchId: selectedBranchId } : {}) }),
  });
  const { data: clientsData } = useQuery({
    queryKey: ['clients-list', selectedBranchId],
    queryFn: () => clientsApi.getAll({ limit: 100, ...(selectedBranchId ? { branchId: selectedBranchId } : {}) }),
  });
  const { data: testsData } = useQuery({
    queryKey: ['tests-list', selectedBranchId],
    queryFn: () => testMasterApi.getAll({ limit: 100, ...(selectedBranchId ? { branchId: selectedBranchId } : {}) }),
  });
  const { data: branchesData } = useQuery({
    queryKey: ['branches-for-orders-filter'],
    queryFn: () => branchesApi.getAll({ limit: 200, status: 'APPROVED' }),
    enabled: isAdminScope,
  });

  const handleSyncStatus = async () => {
    setIsSyncing(true);
    try {
      const { data } = await authApi.getMe();
      updateUser(data); // Assuming updateUser exists in authStore
      toast.success('Profile synced with latest branch status');
      queryClient.invalidateQueries({ queryKey: ['test-orders'] });
    } catch {
      toast.error('Failed to sync status');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isAdminScope && selectedBranchId) {
      setForm((prev) => ({ ...prev, branchId: selectedBranchId }));
    }
  }, [isAdminScope, selectedBranchId]);

  const createMutation = useMutation({
    mutationFn: (data: any) => testOrdersApi.create(data),
    onSuccess: (response: any) => { 
      queryClient.invalidateQueries({ queryKey: ['test-orders'] }); 
      toast.success('Order created'); 
      setShowCreate(false); 
      if (form.autoCollect && response?.data?._id) {
        navigate(getReportsPath(response.data._id));
      }
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const collectMutation = useMutation({
    mutationFn: (id: string) => testOrdersApi.collectSample(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['test-orders'] }); toast.success('Sample collected'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const toggleTest = (testId: string) => {
    setForm(prev => ({
      ...prev,
      tests: prev.tests.includes(testId) ? prev.tests.filter(t => t !== testId) : [...prev.tests, testId],
    }));
  };

  const isBranchPending = currentUser?.role === Role.LAB && !currentUser.branchId;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Test Orders</h1>
        <button 
          onClick={() => setShowCreate(!showCreate)} 
          className={`btn-primary flex items-center gap-2 ${isBranchPending ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isBranchPending}
          title={isBranchPending ? 'Wait for branch approval to create orders' : ''}
        >
          <FiPlus /> New Order
        </button>
      </div>

      {isBranchPending && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-full text-lg">⚠️</div>
            <div>
              <p className="font-bold text-yellow-500/80">Branch Pending Approval</p>
              <p className="text-sm opacity-80 text-yellow-500/60">Your laboratory profile is being reviewed. You will be able to manage test orders once it is approved.</p>
            </div>
          </div>
          <button 
            onClick={handleSyncStatus} 
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded-xl text-sm font-semibold transition-all border border-yellow-500/30"
          >
            <FiRefreshCw className={isSyncing ? 'animate-spin' : ''} />
            Check Approval Status
          </button>
        </div>
      )}

      {(ordersData as any)?.data?.error === 'Branch not approved' && !isBranchPending && (
         <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
           <p className="font-bold">Error</p>
           <p className="text-sm">You do not have permission to view orders for this branch.</p>
         </div>
      )}

      {isAdminScope && (
        <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-sm text-surface-300">Filter by Lab Branch</label>
          <select
            value={selectedBranchId}
            onChange={(e) => {
              const next = e.target.value;
              setSearchParams(next ? { branchId: next } : {});
            }}
            className="input-field sm:max-w-sm"
          >
            <option value="">All branches</option>
            {branchesData?.data?.branches?.map((b: any) => (
              <option key={b._id} value={b._id}>{b.labName || b.name}</option>
            ))}
          </select>
        </div>
      )}

      {showCreate && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Create Test Order</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isAdminScope && (
              <div>
                <label className="label">Lab Branch</label>
                <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })} className="input-field">
                  <option value="">Select branch</option>
                  {branchesData?.data?.branches?.map((b: any) => (
                    <option key={b._id} value={b._id}>{b.labName || b.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="label">Patient</label>
              <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="input-field">
                <option value="">Select patient</option>
                {clientsData?.data?.clients?.map((c: any) => <option key={c._id} value={c._id}>{c.name} — {c.mobile}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Discount (₹)</label>
              <input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="label">Select Tests</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {testsData?.data?.tests?.map((test: any) => (
                <label key={test._id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${form.tests.includes(test._id) ? 'bg-primary-500/15 border border-primary-500/30' : 'bg-surface-800/30 border border-transparent hover:border-surface-700'}`}>
                  <input type="checkbox" checked={form.tests.includes(test._id)} onChange={() => toggleTest(test._id)} className="accent-primary-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{test.name}</p>
                    <p className="text-xs text-surface-300">₹{test.price}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-primary-500/10 rounded-xl border border-primary-500/20">
            <input 
              type="checkbox" 
              id="autoCollect"
              checked={form.autoCollect} 
              onChange={(e) => setForm({ ...form, autoCollect: e.target.checked })} 
              className="w-4 h-4 accent-primary-500"
            />
            <label htmlFor="autoCollect" className="text-sm font-medium text-primary-200 cursor-pointer">
              Auto-collect sample & proceed to Result Entry immediately
            </label>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" rows={2} />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.clientId || form.tests.length === 0 || (isAdminScope && !form.branchId) || isBranchPending}
              className={`btn-primary ${isBranchPending ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isBranchPending ? 'Wait for branch approval to create orders' : ''}
            >
              Create Order
            </button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead><tr><th>Order #</th><th>Patient</th><th>Tests</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {ordersLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7}><div className="skeleton h-4 w-full" /></td></tr>
              ))
            ) : ordersData?.data?.orders?.map((order: any) => (
              <tr key={order._id}>
                <td className="font-medium text-white">{order.orderNumber}</td>
                <td>{order.clientId?.name || '—'}</td>
                <td className="max-w-[200px] truncate">{order.tests?.map((t: any) => t.name || t).join(', ')}</td>
                <td>₹{order.netAmount}</td>
                <td>
                  <span className={`badge ${
                    order.status === 'COMPLETED' ? 'badge-success' :
                    order.status === 'COLLECTED' ? 'badge-info' :
                    order.status === 'PROCESSING' ? 'badge-warning' :
                    order.status === 'CANCELLED' ? 'badge-danger' : 'badge-primary'
                  }`}>{order.status || 'PENDING'}</span>
                </td>
                <td className="text-xs">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</td>
                <td>
                  <div className="flex items-center gap-3">
                    {order.status === 'ORDERED' && (
                      <button onClick={() => collectMutation.mutate(order._id)} className="text-xs text-primary-400 hover:text-primary-300 font-medium whitespace-nowrap">
                        Collect Sample
                      </button>
                    )}
                    {order.status === 'COLLECTED' && (
                      <button onClick={() => navigate(getReportsPath(order._id))} className="text-xs text-green-400 hover:text-green-300 font-medium whitespace-nowrap flex items-center gap-1">
                        <FiCornerDownRight /> Enter Results
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
