import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../../api';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', mobile: '', age: '', gender: 'Male', address: '', referredBy: '' });

  const { data, isLoading } = useQuery({ queryKey: ['clients'], queryFn: () => clientsApi.getAll() });

  const createMutation = useMutation({
    mutationFn: (d: any) => clientsApi.create({ ...d, age: Number(d.age) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); toast.success('Client added'); setShowCreate(false); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Clients / Patients</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2"><FiPlus /> Add Client</button>
      </div>
      {showCreate && (
        <div className="glass-card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="label">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
            <div><label className="label">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" /></div>
            <div><label className="label">Mobile</label><input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="input-field" /></div>
            <div><label className="label">Age</label><input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="input-field" /></div>
            <div><label className="label">Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-field">
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div><label className="label">Referred By</label><input value={form.referredBy} onChange={(e) => setForm({ ...form, referredBy: e.target.value })} className="input-field" /></div>
          </div>
          <div><label className="label">Address</label><textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" rows={2} /></div>
          <div className="flex gap-3">
            <button onClick={() => createMutation.mutate(form)} className="btn-primary">Create</button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}
      <div className="table-container"><table>
        <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Age</th><th>Gender</th><th>Referred By</th></tr></thead>
        <tbody>
          {isLoading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={6}><div className="skeleton h-4 w-full" /></td></tr>) :
          data?.data?.clients?.map((c: any) => (
            <tr key={c._id}><td className="text-white font-medium">{c.name}</td><td>{c.email}</td><td>{c.mobile}</td><td>{c.age}</td><td>{c.gender}</td><td>{c.referredBy || '—'}</td></tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
