import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testOrdersApi, clientsApi, testMasterApi } from '../../api';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';

export default function TestOrdersPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ clientId: '', tests: [] as string[], branchId: '', notes: '', discount: 0 });

  const { data, isLoading } = useQuery({ queryKey: ['test-orders'], queryFn: () => testOrdersApi.getAll() });
  const { data: clientsData } = useQuery({ queryKey: ['clients-list'], queryFn: () => clientsApi.getAll({ limit: 100 }) });
  const { data: testsData } = useQuery({ queryKey: ['tests-list'], queryFn: () => testMasterApi.getAll({ limit: 100 }) });

  const createMutation = useMutation({
    mutationFn: (data: any) => testOrdersApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['test-orders'] }); toast.success('Order created'); setShowCreate(false); },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Test Orders</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2"><FiPlus /> New Order</button>
      </div>

      {showCreate && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Create Test Order</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <label className="label">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" rows={2} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => createMutation.mutate(form)} disabled={!form.clientId || form.tests.length === 0} className="btn-primary">Create Order</button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead><tr><th>Order #</th><th>Patient</th><th>Tests</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7}><div className="skeleton h-4 w-full" /></td></tr>
              ))
            ) : data?.data?.orders?.map((order: any) => (
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
                  }`}>{order.status}</span>
                </td>
                <td className="text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  {order.status === 'ORDERED' && (
                    <button onClick={() => collectMutation.mutate(order._id)} className="text-xs text-primary-400 hover:text-primary-300 font-medium">
                      Collect Sample
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
