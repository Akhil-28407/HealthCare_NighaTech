import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi, clientsApi } from '../../api';
import toast from 'react-hot-toast';
import { FiPlus, FiSend, FiCheck, FiDownload, FiEye, FiDollarSign } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import FilterBar from '../../components/common/FilterBar';
import { useAuthStore } from '../../stores/auth.store';


export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ clientId: '', items: [{ name: '', quantity: 1, unitPrice: 0, description: '' }], tax: 0, discount: 0, notes: '' });

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({ 
    queryKey: ['invoices', search, sortBy, statusFilter], 
    queryFn: () => invoicesApi.getAll({ search, sortBy, status: statusFilter }),
    enabled: !!currentUser
  });
  const { data: clientsData } = useQuery({ 
    queryKey: ['clients-list'], 
    queryFn: () => clientsApi.getAll({ limit: 100 }),
    enabled: !!currentUser
  });

  const createMutation = useMutation({ mutationFn: (d: any) => invoicesApi.create(d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice created'); setShowCreate(false); } });
  const sendMutation = useMutation({ mutationFn: (id: string) => invoicesApi.send(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice sent'); } });
  const paidMutation = useMutation({ mutationFn: (id: string) => invoicesApi.markPaid(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Marked paid'); } });
  const recordPaymentMutation = useMutation({ 
    mutationFn: ({ id, amount }: { id: string; amount: number }) => invoicesApi.recordPayment(id, amount), 
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Payment recorded'); setShowPaymentModal(null); } 
  });

  const [showPaymentModal, setShowPaymentModal] = useState<{ id: string, number: string, balance: number } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { name: '', quantity: 1, unitPrice: 0, description: '' }] }));
  const updateItem = (i: number, field: string, val: any) => {
    const items = [...form.items];
    (items[i] as any)[field] = val;
    setForm({ ...form, items });
  };

  const downloadPdf = async (id: string, num: string) => {
    try {
      const { data } = await invoicesApi.downloadPdf(id);
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a'); a.href = url; a.download = `invoice-${num}.pdf`; a.click();
    } catch { toast.error('Download failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Invoices</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2"><FiPlus /> New Invoice</button>
      </div>
      {showCreate && (
        <div className="glass-card p-6 space-y-4">
          <div><label className="label">Client</label>
            <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="input-field">
              <option value="">Select client</option>
              {clientsData?.data?.clients?.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="label">Items</label>
            {form.items.map((item, i) => (
              <div key={i} className="grid grid-cols-4 gap-2">
                <input value={item.name} onChange={(e) => updateItem(i, 'name', e.target.value)} className="input-field" placeholder="Item name" />
                <input type="number" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} className="input-field" placeholder="Qty" />
                <input type="number" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))} className="input-field" placeholder="Price" />
                <input value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} className="input-field" placeholder="Description" />
              </div>
            ))}
            <button type="button" onClick={addItem} className="text-sm text-primary-400 hover:text-primary-300">+ Add Item</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Tax (₹)</label><input type="number" value={form.tax} onChange={(e) => setForm({ ...form, tax: Number(e.target.value) })} className="input-field" /></div>
            <div><label className="label">Discount (₹)</label><input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} className="input-field" /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => createMutation.mutate(form)} className="btn-primary">Create Invoice</button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <FilterBar 
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by invoice number or client name..."
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOptions={[
          { label: 'Newest First', value: 'createdAt' },
          { label: 'Invoice #', value: 'invoiceNumber' },
          { label: 'Balance', value: 'balance' },
          { label: 'Status', value: 'status' },
        ]}
        filters={
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field text-sm"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PAID">Paid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        }
      />

      <div className="table-container"><table>
        <thead><tr><th>Invoice #</th><th>Client</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          {isLoading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={6}><div className="skeleton h-4 w-full" /></td></tr>) :
          data?.data?.invoices?.map((inv: any) => (
            <tr key={inv._id}>
              <td className="text-white font-medium">{inv.invoiceNumber}</td>
              <td>{inv.clientId?.name || '—'}</td>
              <td className="font-semibold text-primary-400">₹{inv.total}</td>
              <td className="text-green-400">₹{inv.paidAmount || 0}</td>
              <td className="text-orange-400">₹{inv.balance ?? inv.total}</td>
              <td><span className={`badge ${inv.status === 'PAID' ? 'badge-success' : inv.status === 'SENT' ? 'badge-info' : inv.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>{inv.status}</span></td>
              <td className="text-xs">{new Date(inv.createdAt).toLocaleDateString()}</td>
              <td>
                <div className="flex items-center gap-2">
                  {inv.status === 'DRAFT' && <button onClick={() => sendMutation.mutate(inv._id)} className="text-blue-400" title="Send Email"><FiSend size={15} /></button>}
                  {inv.status !== 'PAID' && (
                    <button 
                      onClick={() => { setShowPaymentModal({ id: inv._id, number: inv.invoiceNumber, balance: inv.balance ?? inv.total }); setPaymentAmount(inv.balance ?? inv.total); }} 
                      className="text-orange-400" 
                      title="Record Payment"
                    >
                      <FiDollarSign size={15} />
                    </button>
                  )}
                  {inv.status !== 'PAID' && <button onClick={() => paidMutation.mutate(inv._id)} className="text-green-400" title="Mark Full Paid"><FiCheck size={15} /></button>}
                  <button onClick={() => navigate(`/invoices/${inv._id}`)} className="text-primary-400" title="View"><FiEye size={15} /></button>
                  <button onClick={() => downloadPdf(inv._id, inv.invoiceNumber)} className="text-green-400" title="Download PDF"><FiDownload size={15} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold text-white">Record Payment</h2>
            <p className="text-surface-300 text-sm">Invoice: <span className="text-white font-medium">{showPaymentModal.number}</span></p>
            <p className="text-surface-300 text-sm">Remaining Balance: <span className="text-orange-400 font-bold">₹{showPaymentModal.balance}</span></p>
            
            <div>
              <label className="label">Amount Paid Today (₹)</label>
              <input 
                type="number" 
                value={paymentAmount} 
                onChange={(e) => setPaymentAmount(Number(e.target.value))} 
                className="input-field"
                max={showPaymentModal.balance}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => recordPaymentMutation.mutate({ id: showPaymentModal.id, amount: paymentAmount })} 
                className="btn-primary flex-1"
                disabled={paymentAmount <= 0 || paymentAmount > showPaymentModal.balance}
              >
                Save Payment
              </button>
              <button onClick={() => setShowPaymentModal(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
