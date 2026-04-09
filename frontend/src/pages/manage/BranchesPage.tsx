import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchesApi } from '../../api';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';

export default function BranchesPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', city: '', state: '', pincode: '', phone: '', email: '', labName: '', labLicense: '' });

  const { data, isLoading } = useQuery({ queryKey: ['branches'], queryFn: () => branchesApi.getAll() });

  const createMutation = useMutation({
    mutationFn: (d: any) => branchesApi.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['branches'] }); toast.success('Branch created'); setShowCreate(false); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Branches</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2"><FiPlus /> Add Branch</button>
      </div>
      {showCreate && (
        <div className="glass-card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(form).map(([key, val]) => (
              <div key={key}><label className="label capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                <input value={val} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="input-field" placeholder={key} /></div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => createMutation.mutate(form)} className="btn-primary">Create</button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}
      <div className="table-container"><table>
        <thead><tr><th>Name</th><th>Lab Name</th><th>City</th><th>Phone</th><th>Email</th></tr></thead>
        <tbody>
          {isLoading ? Array.from({ length: 3 }).map((_, i) => <tr key={i}><td colSpan={5}><div className="skeleton h-4 w-full" /></td></tr>) :
          data?.data?.branches?.map((b: any) => (
            <tr key={b._id}><td className="text-white font-medium">{b.name}</td><td>{b.labName}</td><td>{b.city}</td><td>{b.phone}</td><td>{b.email}</td></tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
