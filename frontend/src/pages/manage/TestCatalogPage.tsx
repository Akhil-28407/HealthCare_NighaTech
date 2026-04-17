import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchesApi, testMasterApi } from '../../api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { useAuthStore } from '../../stores/auth.store';
import { Role } from '../../types';

export default function TestCatalogPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedBranchId = searchParams.get('branchId') || '';
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    branchId: '',
    name: '',
    code: '',
    category: '',
    description: '',
    sampleType: '',
    price: 0,
    turnaroundTime: '',
    parameters: [] as any[],
  });

  const canManage = [Role.SUPER_ADMIN, Role.ADMIN, Role.LAB, Role.LAB_EMP].includes(currentUser?.role as Role);
  const isAdminScope = [Role.SUPER_ADMIN, Role.ADMIN].includes(currentUser?.role as Role);

  const { data, isLoading } = useQuery({ 
    queryKey: ['test-master', selectedBranchId], 
    queryFn: () => testMasterApi.getAll({ limit: 100, ...(selectedBranchId ? { branchId: selectedBranchId } : {}) }),
  });

  const { data: branchesData } = useQuery({
    queryKey: ['branches-for-test-catalog-filter'],
    queryFn: () => branchesApi.getAll({ limit: 200, status: 'APPROVED' }),
    enabled: isAdminScope,
  });

  useEffect(() => {
    if (isAdminScope && selectedBranchId) {
      setForm((prev) => ({ ...prev, branchId: selectedBranchId }));
    }
  }, [selectedBranchId, isAdminScope]);

  const createMutation = useMutation({
    mutationFn: (d: any) => testMasterApi.create(d),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['test-master'] }); 
      toast.success('Test added to catalog'); 
      setShowForm(false); 
      resetForm();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => testMasterApi.update(id, data),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['test-master'] }); 
      toast.success('Test updated'); 
      setEditingId(null); 
      resetForm();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => testMasterApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['test-master'] }); toast.success('Test removed'); },
  });

  const resetForm = () => {
    setForm({
      branchId: isAdminScope ? selectedBranchId : '',
      name: '',
      code: '',
      category: '',
      description: '',
      sampleType: '',
      price: 0,
      turnaroundTime: '',
      parameters: [],
    });
  };

  const addParameter = () => {
    setForm({ ...form, parameters: [...form.parameters, { name: '', unit: '', normalRangeMin: 0, normalRangeMax: 0, normalRangeText: '' }] });
  };

  const updateParameter = (index: number, field: string, value: any) => {
    const newParams = [...form.parameters];
    newParams[index] = { ...newParams[index], [field]: value };
    setForm({ ...form, parameters: newParams });
  };

  const startEdit = (test: any) => {
    setEditingId(test._id);
    setForm({
      branchId: test.branchId?._id || test.branchId || '',
      name: test.name,
      code: test.code,
      category: test.category || '',
      description: test.description || '',
      sampleType: test.sampleType || '',
      price: test.price || 0,
      turnaroundTime: test.turnaroundTime || '',
      parameters: test.parameters || [],
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Test Catalog</h1>
        {canManage && (
          <button onClick={() => { setShowForm(!showForm); if (!showForm) resetForm(); setEditingId(null); }} className="btn-primary flex items-center gap-2">
            <FiPlus /> Add New Test
          </button>
        )}
      </div>

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

      {showForm && (
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">{editingId ? 'Edit Test' : 'New Test Registration'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div><label className="label">Test Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="e.g. CBC" /></div>
            <div><label className="label">Code</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input-field" placeholder="e.g. T-001" /></div>
            <div><label className="label">Category</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" placeholder="Hematology" /></div>
            <div><label className="label">Price (₹)</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="input-field" /></div>
            <div><label className="label">Sample Type</label><input value={form.sampleType} onChange={(e) => setForm({ ...form, sampleType: e.target.value })} className="input-field" placeholder="Blood" /></div>
            <div><label className="label">TAT</label><input value={form.turnaroundTime} onChange={(e) => setForm({ ...form, turnaroundTime: e.target.value })} className="input-field" placeholder="24 hours" /></div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-surface-300">Test Parameters</h3>
              <button onClick={addParameter} className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"><FiPlus /> Add Param</button>
            </div>
            <div className="space-y-2">
              {form.parameters.map((p, i) => (
                <div key={i} className="flex flex-wrap gap-2 items-end bg-surface-800/50 p-3 rounded-lg border border-surface-700">
                  <div className="flex-1 min-w-[150px]"><label className="text-[10px] text-surface-400 uppercase">Name</label><input value={p.name} onChange={(e) => updateParameter(i, 'name', e.target.value)} className="input-field py-1" /></div>
                  <div className="w-20"><label className="text-[10px] text-surface-400 uppercase">Unit</label><input value={p.unit} onChange={(e) => updateParameter(i, 'unit', e.target.value)} className="input-field py-1" /></div>
                  <div className="w-20"><label className="text-[10px] text-surface-400 uppercase">Min</label><input type="number" value={p.normalRangeMin} onChange={(e) => updateParameter(i, 'normalRangeMin', Number(e.target.value))} className="input-field py-1" /></div>
                  <div className="w-20"><label className="text-[10px] text-surface-400 uppercase">Max</label><input type="number" value={p.normalRangeMax} onChange={(e) => updateParameter(i, 'normalRangeMax', Number(e.target.value))} className="input-field py-1" /></div>
                  <button onClick={() => setForm({ ...form, parameters: form.parameters.filter((_, idx) => idx !== i) })} className="text-red-400 p-2"><FiX /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => editingId ? updateMutation.mutate({ id: editingId, data: form }) : createMutation.mutate(form)}
              disabled={isAdminScope && !form.branchId}
              className="btn-primary"
            >
              {editingId ? 'Update Test' : 'Add to Catalog'}
            </button>
            <button onClick={() => { setShowForm(false); resetForm(); setEditingId(null); }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />) :
        data?.data?.tests?.map((test: any) => (
          <div key={test._id} className="glass-card-hover p-5 space-y-3 relative group">
            {canManage && (
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(test)} className="p-1.5 bg-surface-800 rounded-lg text-primary-400 hover:bg-surface-700"><FiEdit2 size={14} /></button>
                <button onClick={() => { if(confirm('Delete test?')) deleteMutation.mutate(test._id); }} className="p-1.5 bg-surface-800 rounded-lg text-red-400 hover:bg-surface-700"><FiTrash2 size={14} /></button>
              </div>
            )}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-semibold">{test.name}</h3>
                <span className="badge badge-primary mt-1">{test.code}</span>
              </div>
              <span className="text-xl font-bold text-primary-400">₹{test.price}</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-surface-300">Category: {test.category}</p>
              <p className="text-xs text-surface-300">Sample: {test.sampleType}</p>
              <p className="text-xs text-surface-300">TAT: {test.turnaroundTime}</p>
              <p className="text-xs text-surface-300">{test.parameters?.length || 0} parameters</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
