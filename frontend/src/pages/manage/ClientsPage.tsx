import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../../api';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiUser, FiNavigation, FiCheck, FiPhone, FiTrash2 } from 'react-icons/fi';
import { useAuthStore } from '../../stores/auth.store';

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', mobile: '', age: '', gender: 'Male', address: '', referredBy: '' });
  
  // Search state
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { user: currentUser } = useAuthStore();
  const { data, isLoading } = useQuery({ 
    queryKey: ['clients'], 
    queryFn: () => clientsApi.getAll(),
    enabled: !!currentUser
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => clientsApi.create({ ...d, age: Number(d.age) }),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['clients'] }); 
      toast.success('Contact Person added to your branch'); 
      setShowCreate(false); 
      resetForm();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Contact Person record removed');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to remove contact person'),
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from your branch records? All history will be unlinked (but reports remain accessible to them).`)) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setForm({ name: '', email: '', mobile: '', age: '', gender: 'Male', address: '', referredBy: '' });
    setSearchResults([]);
  };

  const handleMobileSearch = async (mobile: string) => {
    setForm(f => ({ ...f, mobile }));
    if (mobile.length >= 10) {
      setIsSearching(true);
      try {
        const { data } = await clientsApi.searchByMobile(mobile);
        setSearchResults(data.clients || []);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const selectExistingClient = (client: any) => {
    setForm({
      ...form,
      name: client.name,
      email: client.email || '',
      mobile: client.mobile,
      age: client.age || '',
      gender: client.gender || 'Male',
      address: client.address || '',
    });
    setSearchResults([]);
  };

  const isAlreadyInBranch = (mobile: string, name: string) => {
    return data?.data?.clients?.some((c: any) => 
      c.mobile === mobile && c.name.toLowerCase() === name.toLowerCase()
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Contact Persons</h1>
          <p className="text-sm text-surface-400 font-medium">Manage your lab's contact person records</p>
        </div>
        <button 
          onClick={() => {
            if (showCreate) resetForm();
            setShowCreate(!showCreate);
          }} 
          className={`btn-primary flex items-center gap-2 px-6 py-3 shadow-lg transition-all ${showCreate ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'shadow-primary-500/20'}`}
        >
          {showCreate ? 'Close Form' : <><FiPlus /> Add New Contact Person</>}
        </button>
      </div>

      {showCreate && (
        <div className="glass-card border border-white/5 p-8 space-y-8 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400">
              <FiSearch size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Smart Registration</h3>
              <p className="text-xs text-surface-400 font-medium">Enter mobile number to find existing profiles across HealthCare Hub.</p>
            </div>
          </div>

          <div className="relative">
            <label className="label text-primary-400 font-black tracking-widest uppercase text-[10px]">Step 1: Contact Discovery</label>
            <div className="relative group">
              <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-400 transition-colors" size={18} />
              <input 
                type="tel"
                value={form.mobile} 
                onChange={(e) => handleMobileSearch(e.target.value)} 
                className="input-field pl-12 bg-white/5 border-white/10 text-lg font-bold tracking-widest focus:border-primary-500/50" 
                placeholder="Enter 10-digit mobile number"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-surface-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-primary-500/10 px-4 py-2 border-b border-white/5">
                  <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Existing Profiles Found</p>
                </div>
                {searchResults.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => selectExistingClient(c)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-10 h-10 rounded-full bg-surface-800 flex items-center justify-center text-surface-300 group-hover:text-primary-400 transition-colors font-bold">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{c.name}</p>
                        <p className="text-xs text-surface-400 font-medium">{c.age}Y • {c.gender} • {c.email || 'No email'}</p>
                      </div>
                    </div>
                    {isAlreadyInBranch(c.mobile, c.name) ? (
                      <div className="bg-surface-800 text-surface-500 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5">
                        <FiCheck className="text-green-500" /> ALREADY IN BRANCH
                      </div>
                    ) : (
                      <div className="text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-xs font-bold font-mono">
                        USE PROFILE <FiNavigation />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <label className="label text-primary-400 font-black tracking-widest uppercase text-[10px]">Step 2: Profile Details</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div><label className="label">Contact Person Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field bg-white/5" required /></div>
              <div><label className="label">Email Address</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field bg-white/5" /></div>
              <div><label className="label">Age</label><input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="input-field bg-white/5" /></div>
              <div><label className="label">Gender</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-field bg-white/5">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div><label className="label">Referred By</label><input value={form.referredBy} onChange={(e) => setForm({ ...form, referredBy: e.target.value })} className="input-field bg-white/5" /></div>
            </div>
            <div><label className="label">Address</label><textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field bg-white/5" rows={2} /></div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/5">
            <button 
              onClick={() => createMutation.mutate(form)} 
              disabled={createMutation.isPending}
              className="btn-primary flex-1 py-4 font-bold flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiCheck /> Save Contact Profile</>}
            </button>
            <button onClick={() => { setShowCreate(false); resetForm(); }} className="btn-secondary flex-1 py-4">Discard</button>
          </div>
        </div>
      )}

      <div className="table-container shadow-2xl border border-white/5">
        <table>
          <thead>
            <tr>
              <th><FiUser className="inline mr-2" /> Contact Profile</th>
              <th>Contact Info</th>
              <th>Details</th>
              <th>Referred By</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}><td colSpan={4}><div className="h-12 w-full bg-white/5 animate-pulse rounded-lg" /></td></tr>
            )) : data?.data?.clients?.length > 0 ? (
              data?.data?.clients?.map((c: any) => (
                <tr key={c._id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 font-bold border border-primary-500/10 group-hover:bg-primary-500 group-hover:text-white transition-all">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-black text-sm">{c.name}</p>
                        <p className="text-[10px] text-surface-500 font-bold uppercase tracking-wider">{c._id.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="text-white text-sm font-medium">{c.mobile}</p>
                    <p className="text-xs text-surface-400">{c.email || 'No email'}</p>
                  </td>
                  <td>
                    <span className="text-xs font-bold text-surface-300 bg-white/5 px-2 py-1 rounded-md">{c.age}Y</span>
                    <span className="ml-2 text-xs font-bold text-surface-300 bg-white/5 px-2 py-1 rounded-md">{c.gender}</span>
                  </td>
                  <td>
                    <p className="text-xs font-bold text-primary-400/80 italic">{c.referredBy || 'Direct Walk-in'}</p>
                  </td>
                  <td className="text-right">
                    <button 
                      onClick={() => handleDelete(c._id, c.name)}
                      disabled={deleteMutation.isPending}
                      className="p-2 text-surface-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Remove Contact Person"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <p className="text-surface-400 font-bold">No contact persons found in your records.</p>
                  <p className="text-xs text-surface-500 mt-2">Click \"Add New Contact Person\" to register.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
