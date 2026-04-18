import { useQuery } from '@tanstack/react-query';
import { auditLogsApi } from '../../api';
import { useAuthStore } from '../../stores/auth.store';

export default function AuditLogsPage() {
  const { user: currentUser } = useAuthStore();
  const { data, isLoading } = useQuery({ 
    queryKey: ['audit-logs'], 
    queryFn: () => auditLogsApi.getAll({ limit: 50 }),
    enabled: !!currentUser
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
      <div className="table-container"><table>
        <thead><tr><th>User</th><th>Action</th><th>Entity</th><th>IP</th><th>Time</th></tr></thead>
        <tbody>
          {isLoading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={5}><div className="skeleton h-4 w-full" /></td></tr>) :
          data?.data?.logs?.map((log: any) => (
            <tr key={log._id}>
              <td className="text-white">{log.userId?.name || 'System'}</td>
              <td><span className={`badge ${log.action === 'CREATE' ? 'badge-success' : log.action === 'DELETE' ? 'badge-danger' : 'badge-warning'}`}>{log.action}</span></td>
              <td>{log.entity}</td>
              <td className="text-xs text-surface-300">{log.ipAddress}</td>
              <td className="text-xs text-surface-300">{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
