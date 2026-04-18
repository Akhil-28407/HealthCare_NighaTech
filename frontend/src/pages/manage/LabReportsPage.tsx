import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchesApi, labReportsApi } from '../../api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FiEye, FiEdit3, FiCheckCircle, FiDownload, FiMail, 
  FiClock, FiActivity, FiSearch, FiFileText 
} from 'react-icons/fi';
import { useAuthStore } from '../../stores/auth.store';
import { Role } from '../../types';
import FilterBar from '../../components/common/FilterBar';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function LabReportsPage() {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedBranchId = searchParams.get('branchId') || '';
  const testOrderId = searchParams.get('testOrderId') || '';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [htmlContent, setHtmlContent] = useState('');
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  const handledRef = useRef<string | null>(null);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [statusFilter, setStatusFilter] = useState('');
  const [showVerifyConfirm, setShowVerifyConfirm] = useState<string | null>(null);
  
  const canManage = [Role.ADMIN, Role.SUPER_ADMIN, Role.LAB, Role.LAB_EMP].includes(currentUser?.role as Role);
  const canVerify = [Role.ADMIN, Role.SUPER_ADMIN, Role.LAB, Role.LAB_EMP].includes(currentUser?.role as Role);
  const isAdminScope = [Role.SUPER_ADMIN, Role.ADMIN].includes(currentUser?.role as Role);

  const { data, isLoading } = useQuery({
    queryKey: ['lab-reports', selectedBranchId, testOrderId, search, sortBy, statusFilter],
    queryFn: () => labReportsApi.getAll({ 
      ...(selectedBranchId ? { branchId: selectedBranchId } : {}),
      ...(testOrderId ? { testOrderId } : {}),
      search,
      sortBy,
      status: statusFilter,
      limit: 100,
      user: currentUser 
    }),
    enabled: !!currentUser
  });

  const { data: branchesData } = useQuery({
    queryKey: ['branches-for-reports-filter'],
    queryFn: () => branchesApi.getAll({ limit: 200, status: 'APPROVED' }),
    enabled: isAdminScope,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, results, htmlContent }: any) => {
      // Cleanup results before sending to prevent 400 validation errors
      const validResults = results.filter((r: any) => r.name && r.name.trim() !== '');
      return labReportsApi.updateResults(id, validResults, htmlContent);
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['lab-reports'] }); 
      toast.success('Report saved successfully'); 
      setEditingId(null);
      clearOrderIdParam();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to save report'),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => labReportsApi.verify(id),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['lab-reports'] }); 
      toast.success('Report verified and emailed to contact person'); 
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => labReportsApi.send(id),
    onSuccess: () => toast.success('Report dispatched to contact person email'),
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to send email'),
  });

  const startEdit = (report: any) => {
    setEditingId(report._id);
    setResults(report.results || []);
    setHtmlContent(report.htmlContent || '');
    setShowHtmlEditor(!!report.htmlContent);
  };

  // Auto-edit logic for deep links
  useEffect(() => {
    const reports = data?.data?.reports || [];
    
    if (testOrderId && testOrderId !== handledRef.current && reports.length > 0 && !editingId && !isLoading) {
      const pendingReport = reports.find((r: any) => {
        const orderIdOnReport = String(r.testOrderId?._id || r.testOrderId).toLowerCase().trim();
        const urlId = testOrderId.toLowerCase().trim();
        const matchesOrder = orderIdOnReport === urlId;
        const isPending = r.status === 'PENDING' || r.status === 'RESULTS_ENTERED';
        return matchesOrder && isPending;
      });

      if (pendingReport) {
        handledRef.current = testOrderId;
        startEdit(pendingReport);
      }
    }
  }, [testOrderId, data, editingId, isLoading]);

  const forceOpenFirstPending = () => {
    const reports = data?.data?.reports || [];
    const first = reports.find((r: any) => r.status === 'PENDING' || r.status === 'RESULTS_ENTERED');
    if (first) {
      handledRef.current = testOrderId || first.testOrderId;
      startEdit(first);
    } else {
      toast.error('No pending reports found in the current list');
    }
  };

  const addResultRow = () => {
    setResults(prev => [...prev, { name: '', unit: '', value: '', flag: 'N', normalRangeText: '' }]);
  };

  const removeResultRow = (index: number) => {
    setResults(prev => prev.filter((_, i) => i !== index));
  };

  const clearOrderIdParam = () => {
    if (testOrderId) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('testOrderId');
      setSearchParams(newParams, { replace: true });
    }
    handledRef.current = null;
  };

  const updateResultValue = (index: number, value: string) => {
    setResults(prev => prev.map((r, i) => {
      if (i !== index) return r;
      
      let flag = 'N';
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        if (r.normalRangeMin != null && numValue < r.normalRangeMin) flag = 'L';
        else if (r.normalRangeMax != null && numValue > r.normalRangeMax) flag = 'H';
      }
      
      return { ...r, value, flag };
    }));
  };

  const downloadPdf = async (id: string, reportNumber: string) => {
    try {
      const { data } = await labReportsApi.downloadPdf(id);
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  const reports = data?.data?.reports || [];
  const stats = {
    pending: reports.filter((r: any) => r.status === 'PENDING').length,
    entered: reports.filter((r: any) => r.status === 'RESULTS_ENTERED').length,
    verified: reports.filter((r: any) => r.status === 'VERIFIED').length,
    total: data?.data?.total || 0
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Lab Reports Management</h1>
          <p className="text-surface-400 text-sm">Monitor and manage clinical test results</p>
        </div>
      </div>

      {/* Optimization: Dashboard Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 border-l-4 border-orange-500 bg-orange-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500"><FiClock /></div>
            <div>
              <p className="text-xs text-surface-400 font-medium uppercase tracking-wider">Pending</p>
              <p className="text-xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4 border-l-4 border-blue-500 bg-blue-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500"><FiActivity /></div>
            <div>
              <p className="text-xs text-surface-400 font-medium uppercase tracking-wider">Awaiting Verification</p>
              <p className="text-xl font-bold text-white">{stats.entered}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4 border-l-4 border-green-500 bg-green-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg text-green-500"><FiCheckCircle /></div>
            <div>
              <p className="text-xs text-surface-400 font-medium uppercase tracking-wider">Verified</p>
              <p className="text-xl font-bold text-white">{stats.verified}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4 border-l-4 border-primary bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg text-primary"><FiFileText /></div>
            <div>
              <p className="text-xs text-surface-400 font-medium uppercase tracking-wider">Total Reports</p>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {testOrderId && (
        <div className="glass-card p-4 border border-primary/30 bg-primary/10 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary animate-pulse">
              <FiSearch size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-primary-400 uppercase tracking-widest">Focused Entry Mode</p>
              <p className="text-sm text-white">
                Viewing results for order: <span className="font-mono text-primary-300 ml-1">{testOrderId}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!editingId && (
              <button 
                onClick={forceOpenFirstPending}
                className="btn-sm btn-primary flex items-center gap-2"
              >
                <FiActivity size={14} /> Open Form
              </button>
            )}
            <button 
              onClick={clearOrderIdParam}
              className="btn-sm btn-secondary"
            >
              Exit Focus
            </button>
          </div>
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

      {editingId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-950/80 backdrop-blur-sm p-4 md:p-8">
          <div className="max-w-4xl mx-auto glass-card shadow-2xl transition-all duration-300">
            {/* Direct Entry Header */}
            <div className="p-6 border-b border-surface-700 bg-surface-900/50 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-white">Direct Entry Dashboard</h2>
                <p className="text-xs text-surface-400 mt-1 uppercase tracking-widest font-bold">Report Number: {reports.find((r: any) => r._id === editingId)?.reportNumber}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => updateMutation.mutate({ id: editingId, results, htmlContent })} className="btn-primary px-6">Save & Sync</button>
                <button onClick={() => { setEditingId(null); clearOrderIdParam(); }} className="btn-secondary">Cancel</button>
              </div>
            </div>

            <div className="p-8 space-y-8 bg-white min-h-[600px] text-gray-900">
              {/* Internal Report View */}
              <div className="flex justify-between items-center border-b-2 border-primary-600 pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-primary-700">{(currentUser?.branchId as any)?.labName || 'NighaTech Healthcare Lab'}</h3>
                  <p className="text-xs text-gray-500">{(currentUser?.branchId as any)?.address}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold uppercase text-gray-400">Date Generated</div>
                  <div className="text-sm font-semibold">{new Date().toLocaleDateString()}</div>
                </div>
              </div>

              {/* Patient Banner */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-primary-50 p-4 rounded-lg text-sm border border-primary-100">
                <div><span className="text-primary-700 font-bold block text-[10px] uppercase">Contact Person</span> {reports.find((r: any) => r._id === editingId)?.clientId?.name || '—'}</div>
                <div><span className="text-primary-700 font-bold block text-[10px] uppercase">Age/Gender</span> {reports.find((r: any) => r._id === editingId)?.clientId?.age || '—'} / {reports.find((r: any) => r._id === editingId)?.clientId?.gender || '—'}</div>
                <div><span className="text-primary-700 font-bold block text-[10px] uppercase">Order ID</span> {reports.find((r: any) => r._id === editingId)?.testOrderId?.orderNumber || '—'}</div>
                <div><span className="text-primary-700 font-bold block text-[10px] uppercase">Test Name</span> {reports.find((r: any) => r._id === editingId)?.testId?.name || '—'}</div>
              </div>

              {/* Results Table - Direct Entry */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Test Parameters & Results</h4>
                  <button onClick={addResultRow} className="text-xs font-bold text-primary-600 hover:text-primary-700">+ Add Custom Parameter</button>
                </div>
                
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="py-2 px-3 text-left">Parameter</th>
                      <th className="py-2 px-3 text-left">Result / Value</th>
                      <th className="py-2 px-3 text-left">Unit</th>
                      <th className="py-2 px-3 text-left">Reference Range</th>
                      <th className="py-2 px-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i} className="border-b border-gray-100 group">
                        <td className="py-3 px-3">
                          <input 
                            type="text" 
                            value={r.name} 
                            placeholder="Parameter" 
                            onChange={(e) => setResults(prev => prev.map((item, idx) => idx === i ? { ...item, name: e.target.value } : item))} 
                            className="w-full border-none focus:ring-0 font-medium p-0 text-gray-700"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              value={r.value} 
                              placeholder="0.0" 
                              onChange={(e) => updateResultValue(i, e.target.value)} 
                              className={`w-24 border border-gray-200 rounded px-2 py-1 text-center font-bold outline-none focus:border-primary-500 transition-colors ${r.flag === 'H' ? 'text-red-600 bg-red-50' : r.flag === 'L' ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50'}`} 
                            />
                            {r.flag === 'H' && <span className="text-red-600 font-bold text-xs">↑ High</span>}
                            {r.flag === 'L' && <span className="text-blue-600 font-bold text-xs">↓ Low</span>}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <input 
                            type="text" 
                            value={r.unit} 
                            placeholder="Unit" 
                            onChange={(e) => setResults(prev => prev.map((item, idx) => idx === i ? { ...item, unit: e.target.value } : item))} 
                            className="bg-transparent border-none focus:ring-0 p-0 text-gray-500 text-xs italic"
                          />
                        </td>
                        <td className="py-3 px-3 text-xs text-gray-400 font-mono">
                          {r.normalRangeText || `${r.normalRangeMin || '—'} - ${r.normalRangeMax || '—'}`}
                        </td>
                        <td className="py-3 px-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => removeResultRow(i)} className="text-red-300 hover:text-red-500">×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Advanced / HTML Section */}
              <div className="pt-8 border-t border-gray-100 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase">Interpretation / Notes (Optional)</span>
                  <button 
                    onClick={() => setShowHtmlEditor(!showHtmlEditor)} 
                    className="text-[10px] text-primary-500 font-bold uppercase tracking-widest"
                  >
                    {showHtmlEditor ? 'Hide Advanced Editor' : 'Enable Advanced Entry / HTML'}
                  </button>
                </div>
                {showHtmlEditor && (
                  <div className="animate-in fade-in duration-500">
                    <p className="text-[10px] text-gray-400 mb-2">Use this section for complex report descriptions or pasting formatted interpretations.</p>
                    <textarea 
                      value={htmlContent} 
                      onChange={(e) => setHtmlContent(e.target.value)}
                      placeholder="Enter results interpretations or paste HTML content..."
                      className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm font-mono text-gray-700"
                    />
                  </div>
                )}
              </div>

              <div className="pt-12 flex justify-between items-center text-[10px] text-gray-400 italic" style={{ userSelect: 'none' }}>
                <span>Technician Signature: _________________</span>
                <span>Generated by NighaTech Health Intelligence</span>
                <span>Pathologist Signature: _________________</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <FilterBar 
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by report number or patient name..."
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOptions={[
          { label: 'Newest First', value: 'createdAt' },
          { label: 'Report #', value: 'reportNumber' },
          { label: 'Status', value: 'status' },
        ]}
        filters={
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field text-sm"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="RESULTS_ENTERED">Results Entered</option>
            <option value="VERIFIED">Verified</option>
          </select>
        }
      />

      <ConfirmModal 
        isOpen={!!showVerifyConfirm}
        onClose={() => setShowVerifyConfirm(null)}
        onConfirm={() => showVerifyConfirm && verifyMutation.mutate(showVerifyConfirm)}
        title="Verify Report"
        message="Are you sure you want to verify this report? Once verified, it cannot be edited, and the patient will be notified."
        confirmText="Verify & Finalize"
      />
      <div className="table-container">
        <table>
          <thead><tr><th>Report #</th>{canManage && <th>Contact Person</th>}<th>Test</th><th>Payment Status</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={canManage ? 6 : 5}><div className="skeleton h-4 w-full" /></td></tr>
              ))
            ) : data?.data?.reports?.map((report: any) => (
              <tr key={report._id}>
                <td className="font-medium text-white">{report.reportNumber}</td>
                {canManage && <td>{report.clientId?.name || '—'}</td>}
                <td>{report.testId?.name || '—'}</td>
                <td>
                  <div className="flex flex-col gap-1">
                    <span className={`text-[10px] font-bold uppercase ${report.payment?.balance === 0 ? 'text-green-500' : report.payment?.paidAmount > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                      {report.payment?.balance === 0 ? 'Fully Paid' : report.payment?.paidAmount > 0 ? 'Partial Paid' : 'Unpaid'}
                    </span>
                    <div className="w-20 h-1 bg-surface-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${report.payment?.balance === 0 ? 'bg-green-500' : 'bg-orange-500'}`} 
                        style={{ width: `${Math.min(100, (report.payment?.paidAmount / (report.payment?.paidAmount + report.payment?.balance)) * 100 || 0)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${
                    report.status === 'VERIFIED' ? 'badge-success' :
                    report.status === 'RESULTS_ENTERED' ? 'badge-warning' : 'badge-info'
                  }`}>{report.status}</span>
                </td>
                <td className="text-xs">{new Date(report.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="flex items-center gap-2">
                    {canManage && report.status === 'PENDING' && (
                      <button 
                        onClick={() => report.payment?.paidAmount > 0 ? startEdit(report) : toast.error('Payment required to enter results')} 
                        className={`${report.payment?.paidAmount > 0 ? 'text-primary-400 hover:text-primary-300' : 'text-surface-600 cursor-not-allowed'}`} 
                        title={report.payment?.paidAmount > 0 ? "Enter Results" : "At least partial payment required"}
                      >
                        <FiEdit3 size={16} />
                      </button>
                    )}
                    {canManage && report.status === 'RESULTS_ENTERED' && (
                      <>
                        <button 
                          onClick={() => startEdit(report)} 
                          className="text-blue-400 hover:text-blue-300" 
                          title="Edit Results"
                        >
                          <FiEdit3 size={16} />
                        </button>
                        {canVerify && (
                          <button 
                            onClick={() => report.payment?.balance === 0 ? setShowVerifyConfirm(report._id) : toast.error('Full payment required to verify report')} 
                            className={`transition-all ${report.payment?.balance === 0 ? 'text-green-400 hover:text-green-300' : 'text-surface-600 cursor-not-allowed'} ${verifyMutation.isPending ? 'opacity-50 cursor-wait animate-pulse' : ''}`} 
                            disabled={verifyMutation.isPending}
                            title={report.payment?.balance === 0 ? (verifyMutation.isPending ? 'Verifying...' : 'Verify') : "Full payment required to verify"}
                          >
                            <FiCheckCircle size={16} />
                          </button>
                        )}
                      </>
                    )}
                    {report.status === 'VERIFIED' && (
                      <>
                        <button 
                          onClick={() => report.payment?.balance === 0 ? navigate(`/reports/${report._id}`) : toast.error('Full payment required')} 
                          className={`${report.payment?.balance === 0 ? 'text-primary-400 hover:text-primary-300' : 'text-surface-600 cursor-not-allowed'}`}
                          title={report.payment?.balance === 0 ? "View" : "Full payment required"}
                        >
                          <FiEye size={16} />
                        </button>
                        <button 
                          onClick={() => report.payment?.balance === 0 ? downloadPdf(report._id, report.reportNumber) : toast.error('Full payment required')} 
                          className={`${report.payment?.balance === 0 ? 'text-green-400 hover:text-green-300' : 'text-surface-600 cursor-not-allowed'}`}
                          title={report.payment?.balance === 0 ? "Download PDF" : "Full payment required"}
                        >
                          <FiDownload size={16} />
                        </button>
                        <button 
                          onClick={() => report.payment?.balance === 0 ? sendMutation.mutate(report._id) : toast.error('Full payment required')} 
                          className={`${report.payment?.balance === 0 ? 'text-primary-400 hover:text-primary-300' : 'text-surface-600 cursor-not-allowed'}`} 
                          disabled={sendMutation.isPending}
                          title={report.payment?.balance === 0 ? "Send to Contact Person Email" : "Full payment required"}
                        >
                          <FiMail size={16} className={sendMutation.isPending ? 'animate-pulse' : ''} />
                        </button>
                      </>
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
