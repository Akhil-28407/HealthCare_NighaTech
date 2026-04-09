import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotationsApi, clientsApi } from '../../api';
import toast from 'react-hot-toast';
import { FiPlus, FiSend, FiRefreshCw } from 'react-icons/fi';

export default function QuotationsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ clientId: '', items: [{ name: '', quantity: 1, unitPrice: 0, description: '' }], tax: 0, discount: 0, notes: '' });

  const { data } = useQuery({ queryKey: ['quotations'], queryFn: () => quotationsApi.getAll() });
  const { data: clientsData } = useQuery({ queryKey: ['clients-list'], queryFn: () => clientsApi.getAll({ limit: 100 }) });

  const createMutation = useMutation({ mutationFn: (d: any) => quotationsApi.create(d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['quotations'] }); toast.success('Quotation created'); setShowCreate(false); } });
  const sendMutation = useMutation({ mutationFn: (id: string) => quotationsApi.send(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['quotations'] }); toast.success('Sent'); } });
  const convertMutation = useMutation({ mutationFn: (id: string) => quotationsApi.convert(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['quotations'] }); queryClient.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Converted to invoice'); } });

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { name: '', quantity: 1, unitPrice: 0, description: '' }] }));
  const updateItem = (i: number, field: string, val: any) => { const items = [...form.items]; (items[i] as any)[field] = val; setForm({ ...form, items }); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Quotations</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2"><FiPlus /> New Quotation</button>
      </div>
      {showCreate && (
        <div className="glass-card p-6 space-y-4">
          <div><label className="label">Client</label>
            <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="input-field">
              <option value="">Select</option>
              {clientsData?.data?.clients?.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            {form.items.map((item, i) => (
              <div key={i} className="grid grid-cols-4 gap-2">
                <input value={item.name} onChange={(e) => updateItem(i, 'name', e.target.value)} className="input-field" placeholder="Item" />
                <input type="number" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} className="input-field" />
                <input type="number" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))} className="input-field" placeholder="Price" />
                <input value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} className="input-field" placeholder="Desc" />
              </div>
            ))}
            <button type="button" onClick={addItem} className="text-sm text-primary-400">+ Add Item</button>
          </div>
          <div className="flex gap-3">
            <button onClick={() => createMutation.mutate(form)} className="btn-primary">Create</button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}
      <div className="table-container"><table>
        <thead><tr><th>Quotation #</th><th>Client</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {data?.data?.quotations?.map((q: any) => (
            <tr key={q._id}>
              <td className="text-white font-medium">{q.quotationNumber}</td>
              <td>{q.clientId?.name}</td>
              <td className="text-primary-400 font-semibold">₹{q.total}</td>
              <td><span className={`badge ${q.status === 'CONVERTED' ? 'badge-success' : q.status === 'SENT' ? 'badge-info' : 'badge-warning'}`}>{q.status}</span></td>
              <td><div className="flex items-center gap-2">
                {q.status === 'DRAFT' && <button onClick={() => sendMutation.mutate(q._id)} className="text-blue-400" title="Send"><FiSend size={15} /></button>}
                {q.status !== 'CONVERTED' && <button onClick={() => convertMutation.mutate(q._id)} className="text-green-400" title="Convert"><FiRefreshCw size={15} /></button>}
              </div></td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
