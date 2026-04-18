import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, usersApi } from '../../api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { Role } from '../../types';

import { useAuthStore } from '../../stores/auth.store';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser, updateUser } = useAuthStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    mobile: '', 
    role: currentUser?.role === Role.LAB ? Role.LAB_EMP : Role.EMPLOYEE 
  });

  const { data, isLoading } = useQuery({ 
    queryKey: ['users'], 
    queryFn: () => usersApi.getAll(),
    enabled: !!currentUser
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => usersApi.create(d),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['users'] }); 
      toast.success('User created'); 
      setShowCreate(false); 
      setForm({ 
        name: '', 
        email: '', 
        password: '', 
        mobile: '', 
        role: currentUser?.role === Role.LAB ? Role.LAB_EMP : Role.EMPLOYEE 
      }); 
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('User deactivated'); },
  });

  const getAvailableRoles = () => {
    if (currentUser?.role === Role.SUPER_ADMIN) return Object.values(Role);
    if (currentUser?.role === Role.ADMIN) {
      return [Role.EMPLOYEE, Role.LAB, Role.LAB_EMP, Role.CLIENT];
    }
    if (currentUser?.role === Role.LAB) return [Role.LAB_EMP];
    return [];
  };

  const availableRoles = getAvailableRoles();
  const isBranchPending = currentUser?.role === Role.LAB && !currentUser.branchId;

  const handleSyncStatus = async () => {
    setIsSyncing(true);
    try {
      const { data: profile } = await authApi.getMe();
      if (profile?.data) {
        updateUser(profile.data);
        if (profile.data.branchId) {
          toast.success('Approval status synced! You can now manage employees.');
        } else {
          toast.error('Branch still pending approval.');
        }
      }
    } catch {
      toast.error('Failed to sync status');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        {availableRoles.length > 0 && (
          <button 
            onClick={() => setShowCreate(!showCreate)} 
            className={`btn-primary flex items-center gap-2 ${isBranchPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isBranchPending}
            title={isBranchPending ? 'Wait for branch approval to add users' : ''}
          >
            <FiPlus /> Add User
          </button>
        )}
      </div>

      {isBranchPending && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-full text-lg">⚠️</div>
            <div>
              <p className="font-bold text-yellow-500/80">Branch Pending Approval</p>
              <p className="text-sm opacity-80 text-yellow-500/60">Your laboratory profile is being reviewed. You will be able to manage employees once it is approved.</p>
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
      {showCreate && (
        <div className="glass-card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Full name" /></div>
            <div><label className="label">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="Email" /></div>
            <div><label className="label">Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" placeholder="Min 6 chars" /></div>
            <div><label className="label">Mobile</label><input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="input-field" placeholder="Mobile" /></div>
            <div><label className="label">Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className="input-field">
                {availableRoles.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => createMutation.mutate(form)} className="btn-primary">Create</button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}
      <div className="table-container">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {isLoading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={6}><div className="skeleton h-4 w-full" /></td></tr>) :
            data?.data?.users?.map((user: any) => (
              <tr key={user._id}>
                <td className="text-white font-medium">{user.name}</td>
                <td>{user.email}</td>
                <td>{user.mobile}</td>
                <td><span className="badge badge-primary">{user.role}</span></td>
                <td><span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td><button onClick={() => deleteMutation.mutate(user._id)} className="text-red-400 hover:text-red-300"><FiTrash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
