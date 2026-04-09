import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labReportsApi } from '../../api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEye, FiEdit3, FiCheckCircle, FiDownload } from 'react-icons/fi';
import { useAuthStore } from '../../stores/auth.store';
import { Role } from '../../types';

export default function LabReportsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const { user } = useAuthStore();
  const isAdmin = user?.role === Role.ADMIN || user?.role === Role.SUPER_ADMIN || user?.role === Role.LAB;

  const { data, isLoading } = useQuery({ queryKey: ['lab-reports'], queryFn: () => labReportsApi.getAll() });

  const updateMutation = useMutation({
    mutationFn: ({ id, results }: any) => labReportsApi.updateResults(id, results),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['lab-reports'] }); toast.success('Results saved'); setEditingId(null); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => labReportsApi.verify(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['lab-reports'] }); toast.success('Report verified'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const startEdit = (report: any) => {
    setEditingId(report._id);
    setResults(report.results || []);
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
      <h1 className="text-2xl font-bold text-white">Lab Reports</h1>

      {editingId && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Enter Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="text-left">
                <th className="px-3 py-2 text-xs text-surface-300">Parameter</th>
                <th className="px-3 py-2 text-xs text-surface-300">Value</th>
                <th className="px-3 py-2 text-xs text-surface-300">Unit</th>
                <th className="px-3 py-2 text-xs text-surface-300">Reference Range</th>
              </tr></thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-sm text-white">{r.name}</td>
                    <td className="px-3 py-2">
                      <input type="text" value={r.value || ''} onChange={(e) => updateResultValue(i, e.target.value)} className="input-field py-2 w-32" placeholder="Enter value" />
                    </td>
                    <td className="px-3 py-2 text-sm text-surface-300">{r.unit}</td>
                    <td className="px-3 py-2 text-sm text-surface-300">
                      {r.normalRangeText || `${r.normalRangeMin ?? ''} - ${r.normalRangeMax ?? ''}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3">
            <button onClick={() => updateMutation.mutate({ id: editingId, results })} className="btn-primary">Save Results</button>
            <button onClick={() => setEditingId(null)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead><tr><th>Report #</th>{isAdmin && <th>Patient</th>}<th>Test</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6}><div className="skeleton h-4 w-full" /></td></tr>
              ))
            ) : data?.data?.reports?.map((report: any) => (
              <tr key={report._id}>
                <td className="font-medium text-white">{report.reportNumber}</td>
                {isAdmin && <td>{report.clientId?.name || '—'}</td>}
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
                    {isAdmin && report.status === 'PENDING' && (
                      <button onClick={() => startEdit(report)} className="text-primary-400 hover:text-primary-300" title="Enter Results"><FiEdit3 size={16} /></button>
                    )}
                    {isAdmin && report.status === 'RESULTS_ENTERED' && (
                      <>
                        <button onClick={() => startEdit(report)} className="text-blue-400 hover:text-blue-300" title="Edit Results"><FiEdit3 size={16} /></button>
                        <button onClick={() => verifyMutation.mutate(report._id)} className="text-green-400 hover:text-green-300" title="Verify"><FiCheckCircle size={16} /></button>
                      </>
                    )}
                    {report.status === 'VERIFIED' && (
                      <>
                        <button onClick={() => navigate(`/reports/${report._id}`)} className="text-primary-400 hover:text-primary-300" title="View"><FiEye size={16} /></button>
                        <button onClick={() => downloadPdf(report._id, report.reportNumber)} className="text-green-400 hover:text-green-300" title="Download PDF"><FiDownload size={16} /></button>
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
