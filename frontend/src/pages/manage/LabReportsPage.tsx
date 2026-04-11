import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labReportsApi } from '../../api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEye, FiEdit3, FiCheckCircle, FiDownload, FiMail } from 'react-icons/fi';
import { useAuthStore } from '../../stores/auth.store';
import { Role } from '../../types';

export default function LabReportsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [htmlContent, setHtmlContent] = useState('');
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  const { user } = useAuthStore();
  
  const canManage = [Role.ADMIN, Role.SUPER_ADMIN, Role.LAB, Role.LAB_EMP].includes(user?.role as Role);
  const canVerify = [Role.ADMIN, Role.SUPER_ADMIN, Role.LAB, Role.LAB_EMP].includes(user?.role as Role);

  const { data, isLoading } = useQuery({ queryKey: ['lab-reports'], queryFn: () => labReportsApi.getAll() });

  const updateMutation = useMutation({
    mutationFn: ({ id, results, htmlContent }: any) => labReportsApi.updateResults(id, results, htmlContent),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['lab-reports'] }); toast.success('Results saved'); setEditingId(null); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => labReportsApi.verify(id),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['lab-reports'] }); 
      toast.success('Report verified and emailed to patient'); 
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => labReportsApi.send(id),
    onSuccess: () => toast.success('Report dispatched to patient email'),
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to send email'),
  });

  const startEdit = (report: any) => {
    setEditingId(report._id);
    setResults(report.results || []);
    setHtmlContent(report.htmlContent || '');
    setShowHtmlEditor(!!report.htmlContent);
  };

  const updateResultValue = (index: number, value: string) => {
    setResults(prev => prev.map((r, i) => i === index ? { ...r, value } : r));
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Lab Reports Management</h1>

      {editingId && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Entry & Live Preview</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowHtmlEditor(!showHtmlEditor)} 
                className={`btn-sm ${showHtmlEditor ? 'btn-primary' : 'btn-secondary'}`}
              >
                {showHtmlEditor ? 'Disable HTML' : 'Enable HTML / Paste HTML'}
              </button>
            </div>
          </div>

          {/* Result Preview on Top */}
          <div className="bg-white rounded-lg p-6 text-black min-h-[100px] overflow-auto">
            <h4 className="text-center font-bold border-bottom-2 border-primary mb-4">PREVIEW</h4>
            {results.length > 0 && !showHtmlEditor && (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="p-2 border">Parameter</th>
                    <th className="p-2 border">Value</th>
                    <th className="p-2 border">Unit</th>
                    <th className="p-2 border">Range</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2 border">{r.name}</td>
                      <td className="p-2 border font-bold">{r.value || '—'}</td>
                      <td className="p-2 border">{r.unit}</td>
                      <td className="p-2 border text-xs">{r.normalRangeText || `${r.normalRangeMin ?? ''} - ${r.normalRangeMax ?? ''}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {showHtmlEditor && htmlContent && (
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {!showHtmlEditor && (
              <div className="space-y-4">
                <h4 className="text-surface-300 text-sm font-medium">Standard Parameters</h4>
                <div className="table-container">
                  <table className="w-full">
                    <thead><tr className="text-left text-xs text-surface-400"><th>Parameter</th><th>Value</th><th>Unit</th></tr></thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr key={i}>
                          <td className="py-2 text-sm text-white">{r.name}</td>
                          <td><input type="text" value={r.value || ''} onChange={(e) => updateResultValue(i, e.target.value)} className="input-field py-1" /></td>
                          <td className="text-xs">{r.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {showHtmlEditor && (
              <div className="space-y-4">
                <h4 className="text-surface-300 text-sm font-medium">Custom HTML / Rich Content</h4>
                <textarea 
                  value={htmlContent} 
                  onChange={(e) => setHtmlContent(e.target.value)} 
                  className="input-field h-64 font-mono text-sm"
                  placeholder="Paste your HTML code here..."
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-surface-700">
            <button onClick={() => updateMutation.mutate({ id: editingId, results: showHtmlEditor ? [] : results, htmlContent })} className="btn-primary">Save Results</button>
            <button onClick={() => setEditingId(null)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead><tr><th>Report #</th>{canManage && <th>Patient</th>}<th>Test</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
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
                  <span className={`badge ${
                    report.status === 'VERIFIED' ? 'badge-success' :
                    report.status === 'RESULTS_ENTERED' ? 'badge-warning' : 'badge-info'
                  }`}>{report.status}</span>
                </td>
                <td className="text-xs">{new Date(report.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="flex items-center gap-2">
                    {canManage && report.status === 'PENDING' && (
                      <button onClick={() => startEdit(report)} className="text-primary-400 hover:text-primary-300" title="Enter Results"><FiEdit3 size={16} /></button>
                    )}
                    {canManage && report.status === 'RESULTS_ENTERED' && (
                      <>
                        <button onClick={() => startEdit(report)} className="text-blue-400 hover:text-blue-300" title="Edit Results"><FiEdit3 size={16} /></button>
                        {canVerify && (
                          <button onClick={() => verifyMutation.mutate(report._id)} className="text-green-400 hover:text-green-300" title="Verify"><FiCheckCircle size={16} /></button>
                        )}
                      </>
                    )}
                    {report.status === 'VERIFIED' && (
                      <>
                        <button onClick={() => navigate(`/reports/${report._id}`)} className="text-primary-400 hover:text-primary-300" title="View"><FiEye size={16} /></button>
                        <button onClick={() => downloadPdf(report._id, report.reportNumber)} className="text-green-400 hover:text-green-300" title="Download PDF"><FiDownload size={16} /></button>
                        <button 
                          onClick={() => sendMutation.mutate(report._id)} 
                          className="text-primary-400 hover:text-primary-300" 
                          disabled={sendMutation.isPending}
                          title="Send to Patient Email"
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
