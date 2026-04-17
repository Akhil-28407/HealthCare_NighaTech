import { useQuery } from '@tanstack/react-query';
import { labReportsApi, invoicesApi } from '../../api';
import { useAuthStore } from '../../stores/auth.store';
import { FiActivity, FiDollarSign, FiDownload, FiUser, FiCalendar } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const { data: reportsData, isLoading: reportsLoading } = useQuery({ 
    queryKey: ['my-reports'], 
    queryFn: () => labReportsApi.getAll({ limit: 100 }) 
  });
  const { data: invoicesData } = useQuery({ 
    queryKey: ['my-invoices'], 
    queryFn: () => invoicesApi.getAll({ limit: 100 }) 
  });

  // Group reports by Client Name
  const groupedReports = reportsData?.data?.reports?.reduce((acc: any, report: any) => {
    const clientName = report.clientId?.name || 'Unknown';
    if (!acc[clientName]) acc[clientName] = [];
    acc[clientName].push(report);
    return acc;
  }, {}) || {};

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Health Portal</h1>
          <p className="text-surface-400 mt-1 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Connected via {user?.mobile}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="stat-card glass-card border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary-500/10 transition-colors" />
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shadow-lg">
              <FiActivity className="text-primary-400" size={24} />
            </div>
            <div>
              <p className="text-3xl font-black text-white">{reportsData?.data?.total ?? 0}</p>
              <p className="text-sm font-bold text-surface-400 uppercase tracking-wider">Reports Found</p>
            </div>
          </div>
        </div>

        <div className="stat-card glass-card border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-green-500/10 transition-colors" />
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-lg">
              <FiDollarSign className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-3xl font-black text-white">{invoicesData?.data?.total ?? 0}</p>
              <p className="text-sm font-bold text-surface-400 uppercase tracking-wider">Invoices</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FiUser className="text-primary-400" /> Medical Timeline
        </h3>

        {reportsLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2].map(i => <div key={i} className="h-32 rounded-3xl bg-white/5 animate-pulse" />)}
          </div>
        ) : Object.keys(groupedReports).length > 0 ? (
          Object.entries(groupedReports).map(([name, reports]: [string, any]) => (
            <div key={name} className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-xs font-black text-primary-400 uppercase tracking-[0.2em]">{name}</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {reports.map((report: any) => (
                  <div 
                    key={report._id} 
                    className="glass-card border border-white/5 p-5 hover:border-primary-500/30 transition-all group relative overflow-hidden active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between gap-4 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-surface-400 group-hover:bg-primary-500/10 group-hover:text-primary-400 transition-colors shadow-sm">
                          <FiCalendar size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">#{report.reportNumber}</p>
                          <p className="text-xs font-bold text-surface-400 mt-0.5">
                            {report.testId?.name} 
                            <span className="mx-2 opacity-50">•</span>
                            {new Date(report.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                          report.status === 'VERIFIED' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs'
                        }`}>
                          {report.status}
                        </span>
                        
                        {report.status === 'VERIFIED' && (
                          <Link 
                            to={`/reports/${report._id}`} 
                            className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 hover:bg-primary-500 hover:text-white transition-all shadow-lg shadow-primary-500/10"
                            title="Download PDF"
                          >
                            <FiDownload size={18} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card p-12 text-center border border-white/5">
            <div className="w-16 h-16 bg-white/5 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <FiActivity className="text-surface-500" size={32} />
            </div>
            <p className="text-surface-400 font-bold">No reports generated for your mobile profiles yet.</p>
            <p className="text-xs text-surface-500 mt-2">Reports will appear here once verified by the laboratory.</p>
          </div>
        )}
      </div>

      <div className="pt-8 border-t border-white/5 text-center">
        <p className="text-xs text-surface-600 font-bold uppercase tracking-widest">&copy; 2026 HealthCare Secure Portal</p>
      </div>
    </div>
  );
}
