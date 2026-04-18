import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchesApi, authApi } from '../../api';
import toast from 'react-hot-toast';
import { Role } from '../../types';
import { useAuthStore } from '../../stores/auth.store';
import { FiPlus, FiEdit2, FiCheck, FiX, FiClock, FiActivity, FiMapPin, FiPhone, FiMail, FiFileText, FiUser, FiGlobe, FiShield, FiImage } from 'react-icons/fi';

export enum BranchStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export default function BranchesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user: currentUser, startImpersonating } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<BranchStatus | 'ALL'>('ALL');
  
  const [form, setForm] = useState({ 
    name: '', 
    address: '', 
    city: '', 
    state: '', 
    pincode: '', 
    phone: '', 
    email: '', 
    labName: '', 
    labLicense: '',
    gstNumber: '',
    contactPersonNumber: '',
    websiteUrl: '',
    logoUrl: '',
    password: '' // For admin direct creation
  });

  const { data, isLoading } = useQuery({ 
    queryKey: ['branches'], 
    queryFn: () => branchesApi.getAll(),
    enabled: !!currentUser
  });

  const isLabRole = currentUser?.role === Role.LAB;
  const isAdminRole = [Role.SUPER_ADMIN, Role.ADMIN].includes(currentUser?.role as Role);
  const canApprove = isAdminRole;

  const getScopedPath = (section: 'tests' | 'orders' | 'reports', branchId: string) => {
    if (currentUser?.role === Role.SUPER_ADMIN) return `/superadmin/${section}?branchId=${branchId}`;
    return `/admin/${section}?branchId=${branchId}`;
  };

  const branches = data?.data?.branches || [];
  const hasLabProfile = isLabRole && branches.length > 0;
  const counts = {
    ALL: branches.length,
    PENDING: branches.filter((b: any) => b.status === BranchStatus.PENDING).length,
    APPROVED: branches.filter((b: any) => b.status === BranchStatus.APPROVED).length,
    REJECTED: branches.filter((b: any) => b.status === BranchStatus.REJECTED).length,
  };

  const filteredBranches = activeTab === 'ALL' 
    ? branches 
    : branches.filter((b: any) => b.status === activeTab);

  const createMutation = useMutation({
    mutationFn: (d: any) => {
      if (isAdminRole) return authApi.createLab(d);
      return branchesApi.create(d);
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['branches'] }); 
      const msg = [Role.ADMIN, Role.SUPER_ADMIN].includes(currentUser?.role as Role) 
        ? 'Lab account and profile created successfully' 
        : 'Lab request submitted for Admin approval';
      toast.success(msg); 
      setShowCreate(false); 
      resetForm();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create branch'),
  });

  const impersonateMutation = useMutation({
    mutationFn: (userId: string) => authApi.impersonate(userId),
    onSuccess: (res) => {
      const { user, accessToken, refreshToken } = res.data;
      if (!accessToken) throw new Error('No access token received');
      startImpersonating(user, accessToken, refreshToken);
      toast.success(`Now viewing as ${user.name}`);
      window.location.href = '/'; 
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || err.message || 'Impersonation failed';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => branchesApi.update(id, data),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['branches'] }); 
      toast.success('Branch profile updated'); 
      setEditingBranch(null); 
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update branch'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: BranchStatus }) => branchesApi.updateStatus(id, status),
    onSuccess: (_, variables) => { 
      queryClient.invalidateQueries({ queryKey: ['branches'] }); 
      toast.success(`Lab request ${variables.status.toLowerCase()}`); 
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update status'),
  });

  const resetForm = () => {
    setForm({ 
      name: '', address: '', city: '', state: '', pincode: '', 
      phone: '', email: '', labName: '', labLicense: '',
      gstNumber: '', contactPersonNumber: '', websiteUrl: '', logoUrl: '',
      password: ''
    });
  };

  const startEdit = (branch: any) => {
    setEditingBranch(branch);
    setForm({
      name: branch.name,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      pincode: branch.pincode,
      phone: branch.phone,
      email: branch.email,
      labName: branch.labName,
      labLicense: branch.labLicense,
      gstNumber: branch.gstNumber || '',
      contactPersonNumber: branch.contactPersonNumber || '',
      websiteUrl: branch.websiteUrl || '',
      logoUrl: branch.logoUrl || '',
      password: '', 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Branches & Labs</h1>
          <p className="text-surface-400 mt-1">Manage physical locations and lab registration requests.</p>
        </div>
        <button 
          onClick={() => { setShowCreate(!showCreate); setEditingBranch(null); resetForm(); }} 
          disabled={hasLabProfile}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <FiPlus /> {isLabRole ? (hasLabProfile ? 'Lab Already Registered' : 'Register My Lab') : 'Add New Branch'}
        </button>
      </div>

      {!isLabRole && <div className="flex border-b border-surface-800">
        {(['ALL', BranchStatus.APPROVED, BranchStatus.PENDING, BranchStatus.REJECTED] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium transition-all relative flex items-center gap-2 ${
              activeTab === tab ? 'text-primary-400 border-b-2 border-primary-400' : 'text-surface-400 hover:text-white'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === tab ? 'bg-primary-500/20 text-primary-400' : 'bg-surface-800 text-surface-500'
            }`}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>}

      {(showCreate || editingBranch) && (
        <div className="glass-card p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {editingBranch ? 'Edit Branch Profile' : (isLabRole ? 'Submit Lab Creation Request' : 'Register New Branch')}
            </h2>
            <div className="badge badge-primary uppercase tracking-tighter">Information Required</div>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-primary-400 uppercase tracking-widest flex items-center gap-2">
                <FiActivity size={16} /> Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="label">Branch/Lab Name</label>
                  <div className="relative">
                    <FiActivity className="absolute left-3 top-3 text-surface-500" />
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field pl-10" placeholder="e.g. Main Laboratory" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="label">Lab Registered Name</label>
                  <div className="relative">
                    <FiFileText className="absolute left-3 top-3 text-surface-500" />
                    <input value={form.labName} onChange={(e) => setForm({ ...form, labName: e.target.value })} className="input-field pl-10" placeholder="Legal Lab Name" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="label">Primary Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3 text-surface-500" />
                    <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-10" placeholder="lab@example.com" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="label">Primary Phone</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-3 text-surface-500" />
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field pl-10" placeholder="Contact number" />
                  </div>
                </div>
                {isAdminRole && !editingBranch && (
                  <div className="space-y-1">
                    <label className="label">Login Password</label>
                    <div className="relative">
                      <FiCheck className="absolute left-3 top-3 text-green-500" />
                      <input 
                        type="password" 
                        value={form.password} 
                        onChange={(e) => setForm({ ...form, password: e.target.value })} 
                        className="input-field pl-10 border-primary-500/30" 
                        placeholder="Set initial password" 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-primary-400 uppercase tracking-widest flex items-center gap-2">
                <FiShield size={16} /> Compliance & Billing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="label">GST Number</label>
                  <div className="relative">
                    <FiFileText className="absolute left-3 top-3 text-surface-500" />
                    <input value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} className="input-field pl-10" placeholder="29AAAAA0000A1Z5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="label">License Number</label>
                  <div className="relative">
                    <FiCheck className="absolute left-3 top-3 text-surface-500" />
                    <input value={form.labLicense} onChange={(e) => setForm({ ...form, labLicense: e.target.value })} className="input-field pl-10" placeholder="LIC-998877" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="label">Contact Person Mobile</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3 text-surface-500" />
                    <input value={form.contactPersonNumber} onChange={(e) => setForm({ ...form, contactPersonNumber: e.target.value })} className="input-field pl-10" placeholder="Owner mobile" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-primary-400 uppercase tracking-widest flex items-center gap-2">
                <FiMapPin size={16} /> Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2 space-y-1">
                  <label className="label">Full Address</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" placeholder="Physical location" />
                </div>
                <div className="space-y-1">
                  <label className="label">City</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" placeholder="City" />
                </div>
                <div className="space-y-1">
                  <label className="label">State</label>
                  <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-field" placeholder="State" />
                </div>
                <div className="space-y-1">
                  <label className="label">Pincode</label>
                  <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="input-field" placeholder="6-digit code" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-primary-400 uppercase tracking-widest flex items-center gap-2">
                <FiGlobe size={16} /> Branding & Digital
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="label">Website (Optional)</label>
                  <div className="relative">
                    <FiGlobe className="absolute left-3 top-3 text-surface-500" />
                    <input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} className="input-field pl-10" placeholder="https://..." />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="label">Logo URL</label>
                  <div className="relative">
                    <FiImage className="absolute left-3 top-3 text-surface-500" />
                    <input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} className="input-field pl-10" placeholder="Link to logo image" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-surface-800">
            <button 
              onClick={() => editingBranch ? updateMutation.mutate({ id: editingBranch._id, data: form }) : createMutation.mutate(form)} 
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn-primary px-8"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Processing...' : (editingBranch ? 'Update Profile' : (isLabRole ? 'Submit Request' : 'Create Branch'))}
            </button>
            <button onClick={() => { setShowCreate(false); setEditingBranch(null); }} className="btn-secondary px-8">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-6 h-48 skeleton" />
          ))
        ) : filteredBranches.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center">
            <FiActivity className="mx-auto text-surface-600 mb-4" size={48} />
            <p className="text-surface-400">No labs or branches found in this category.</p>
          </div>
        ) : (
          filteredBranches.map((b: any) => {
            const isOwnBranch = currentUser?.branchId === b._id;
            const canEdit = isAdminRole || (currentUser?.role === Role.LAB && isOwnBranch);

            return (
              <div key={b._id} className="glass-card p-6 flex flex-col justify-between group hover:border-primary-500/30 transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">{b.name}</h3>
                      <p className="text-sm text-surface-400">
                        {b.labName} {b.requestedBy && <span className="text-xs text-primary-500/70 ml-2">Req by: {b.requestedBy.name}</span>}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      b.status === BranchStatus.APPROVED ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      b.status === BranchStatus.PENDING ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-surface-300">
                    <div className="flex items-center gap-2">
                      <FiMapPin size={14} className="text-surface-500" />
                      <span>{b.city}, {b.state}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiPhone size={14} className="text-surface-500" />
                      <span>{b.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 italic text-surface-500">
                      <FiCheck size={14} className="text-surface-600" />
                      <span>{b.labLicense}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-8 pt-4 border-t border-surface-800">
                  <div className="flex gap-2">
                    {canApprove && b.status === BranchStatus.PENDING && (
                      <>
                        <button 
                          onClick={() => statusMutation.mutate({ id: b._id, status: BranchStatus.APPROVED })}
                          className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors"
                          title="Approve Request"
                        >
                          <FiCheck />
                        </button>
                        <button 
                          onClick={() => statusMutation.mutate({ id: b._id, status: BranchStatus.REJECTED })}
                          className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                          title="Reject Request"
                        >
                          <FiX />
                        </button>
                      </>
                    )}
                    {b.status === BranchStatus.PENDING && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                        <FiClock size={12} /> Awaiting Approval
                      </div>
                    )}
                  </div>

                  {isAdminRole && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => navigate(getScopedPath('tests', b._id))}
                        className="text-xs px-2 py-1 rounded-md bg-surface-800 text-primary-300 hover:bg-surface-700"
                      >
                        Test Catalog
                      </button>
                      <button
                        onClick={() => navigate(getScopedPath('orders', b._id))}
                        className="text-xs px-2 py-1 rounded-md bg-surface-800 text-primary-300 hover:bg-surface-700"
                      >
                        Test Orders
                      </button>
                      <button
                        onClick={() => navigate(getScopedPath('reports', b._id))}
                        className="text-xs px-2 py-1 rounded-md bg-surface-800 text-primary-300 hover:bg-surface-700"
                      >
                        Results
                      </button>
                      {isAdminRole && b.requestedBy && (
                        <button
                          onClick={() => impersonateMutation.mutate(b.requestedBy?._id || b.requestedBy)}
                          className={`text-xs px-2 py-1 rounded-md bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-1 ${impersonateMutation.isPending ? 'opacity-50 cursor-wait' : ''}`}
                          disabled={impersonateMutation.isPending}
                          title="Login as this Lab"
                        >
                          <FiUser className={impersonateMutation.isPending ? 'animate-pulse' : ''} size={12} />
                          Login as Lab
                        </button>
                      )}
                    </div>
                  )}
                  
                  {canEdit && b.status !== BranchStatus.REJECTED && (
                    <button onClick={() => startEdit(b)} className="text-primary-400 hover:text-primary-300 flex items-center gap-1 text-sm font-medium">
                      <FiEdit2 size={14} /> Edit Profile
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
