import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { labReportsApi } from '../../api';
import toast from 'react-hot-toast';
import { FiDownload, FiPrinter } from 'react-icons/fi';

export default function ReportViewPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['report', id],
    queryFn: () => labReportsApi.getById(id!),
    enabled: !!id,
  });

  const report = data?.data;

  const downloadPdf = async () => {
    try {
      const { data } = await labReportsApi.downloadPdf(id!);
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${report?.reportNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  if (error || !report) return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="glass-card p-8 text-center">
        <p className="text-red-400 text-lg">Report not found</p>
      </div>
    </div>
  );

  const patient = report.clientId as any;
  const test = report.testId as any;
  const branch = report.branchId as any;
  const order = report.testOrderId as any;

  return (
    <div className="min-h-screen bg-surface-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mb-6">
          <button onClick={downloadPdf} className="btn-primary flex items-center gap-2"><FiDownload /> Download PDF</button>
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2"><FiPrinter /> Print</button>
        </div>

        {/* Report Card */}
        <div className="glass-card p-8 print:shadow-none print:border-none" id="report-content">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-primary-500 pb-6 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary-400">{branch?.labName || 'HealthCare Lab'}</h1>
              <p className="text-sm text-surface-300 mt-1">{branch?.address}</p>
              <p className="text-sm text-surface-300">Phone: {branch?.phone} | Email: {branch?.email}</p>
              {branch?.labLicense && <p className="text-xs text-surface-300 mt-1">License: {branch?.labLicense}</p>}
            </div>
            {report.qrCode && (
              <div className="text-center">
                <img src={report.qrCode} alt="QR Code" className="w-20 h-20" />
                <p className="text-[10px] text-surface-300 mt-1">Scan to verify</p>
              </div>
            )}
          </div>

          {/* Patient Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-surface-800/30 p-4 rounded-xl mb-6">
            <div><span className="text-xs text-primary-400 font-medium">Patient</span><p className="text-sm text-white font-semibold">{patient?.name}</p></div>
            <div><span className="text-xs text-primary-400 font-medium">Report #</span><p className="text-sm text-white">{report.reportNumber}</p></div>
            <div><span className="text-xs text-primary-400 font-medium">Age / Gender</span><p className="text-sm text-white">{patient?.age || '—'} / {patient?.gender || '—'}</p></div>
            <div><span className="text-xs text-primary-400 font-medium">Mobile</span><p className="text-sm text-white">{patient?.mobile}</p></div>
            <div><span className="text-xs text-primary-400 font-medium">Order #</span><p className="text-sm text-white">{order?.orderNumber || '—'}</p></div>
            <div><span className="text-xs text-primary-400 font-medium">Date</span><p className="text-sm text-white">{new Date(report.createdAt).toLocaleDateString()}</p></div>
          </div>

          {/* Test Title */}
          <h2 className="text-center text-lg font-bold text-primary-400 uppercase tracking-wider mb-6">
            {test?.name || 'Lab Test'} — Test Report
          </h2>

          {/* Results Table */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full">
              <thead>
                <tr className="bg-primary-700 text-white">
                  <th className="px-4 py-3 text-left text-xs font-semibold">Parameter</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Result</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Reference Range</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Flag</th>
                </tr>
              </thead>
              <tbody>
                {report.results?.map((r: any, i: number) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-surface-800/20' : ''}>
                    <td className="px-4 py-3 text-sm text-white">{r.name}</td>
                    <td className="px-4 py-3 text-sm font-bold text-white">{r.value || '—'}</td>
                    <td className="px-4 py-3 text-sm text-surface-300">{r.unit}</td>
                    <td className="px-4 py-3 text-sm text-surface-300">
                      {r.normalRangeText || `${r.normalRangeMin ?? ''} - ${r.normalRangeMax ?? ''}`}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold">
                      {r.flag === 'H' && <span className="text-red-400">↑ High</span>}
                      {r.flag === 'L' && <span className="text-blue-400">↓ Low</span>}
                      {r.flag === 'N' && <span className="text-green-400">Normal</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="border-t border-surface-700 pt-6 flex justify-between">
            <div className="text-center">
              <div className="w-36 border-t border-surface-300 mx-auto mb-2 mt-8" />
              <p className="text-sm font-semibold text-white">Lab Technician</p>
              <p className="text-xs text-surface-300">{report.enteredBy?.name || ''}</p>
            </div>
            <div className="text-center">
              <div className="w-36 border-t border-surface-300 mx-auto mb-2 mt-8" />
              <p className="text-sm font-semibold text-white">Pathologist</p>
              <p className="text-xs text-surface-300">{report.verifiedBy?.name || ''}</p>
            </div>
          </div>

          <p className="text-center text-[10px] text-surface-300 mt-6">
            Generated on {new Date().toLocaleString()} • This is a computer-generated report
          </p>
        </div>
      </div>
    </div>
  );
}
