import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchesApi } from '../../api';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiClock, FiInfo, FiActivity } from 'react-icons/fi';
import { useAuthStore } from '../../stores/auth.store';
// Use native Date formatting

export default function BranchRequestsPage() {
  const queryClient = useQueryClient();
  
  const { user: currentUser } = useAuthStore();
  const { data, isLoading } = useQuery({ 
    queryKey: ['branch-update-requests'], 
    queryFn: () => branchesApi.getUpdateRequests(),
    enabled: !!currentUser
  });

  const processMutation = useMutation({
    mutationFn: ({ id, status, rejectionReason }: { id: string, status: string, rejectionReason?: string }) => 
      branchesApi.processUpdateRequest(id, status, rejectionReason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['branch-update-requests'] });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success(`Request ${variables.status.toLowerCase()} successfully`);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to process request'),
  });

  const requests = data?.data?.requests || [];

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><FiActivity className="animate-spin text-primary-500" size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Profile Update Requests</h2>
        <div className="badge badge-info">{requests.length} Pending</div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requests.length === 0 ? (
          <div className="glass-card p-12 text-center text-surface-400">
            <FiCheck className="mx-auto mb-4 text-green-500" size={48} />
            <p className="text-lg font-medium text-white">All caught up!</p>
            <p>No pending profile change requests found.</p>
          </div>
        ) : requests.map((req: any) => (
          <div key={req._id} className="glass-card overflow-hidden border border-surface-700 hover:border-surface-600 transition-colors">
            <div className="p-4 bg-surface-800/50 flex items-center justify-between border-b border-surface-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-900/30 rounded-lg">
                  <FiClock className="text-primary-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{req.branchId?.labName || req.branchId?.name}</h3>
                  <p className="text-[10px] text-surface-400 uppercase tracking-tighter">Requested by: {req.requestedBy?.name} • {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(req.createdAt))}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => processMutation.mutate({ id: req._id, status: 'APPROVED' })}
                  className="btn-sm bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white transition-all flex items-center gap-1"
                >
                  <FiCheck size={14} /> Approve
                </button>
                <button 
                  onClick={() => {
                    const reason = window.prompt('Reason for rejection:');
                    if (reason !== null) processMutation.mutate({ id: req._id, status: 'REJECTED', rejectionReason: reason });
                  }}
                  className="btn-sm bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition-all flex items-center gap-1"
                >
                  <FiX size={14} /> Reject
                </button>
              </div>
            </div>

            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-surface-400 border-b border-surface-700 text-left">
                    <th className="pb-3 px-2 font-medium">Field</th>
                    <th className="pb-3 px-2 font-medium">Original Value</th>
                    <th className="pb-3 px-2 font-medium">Proposed Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800">
                  {Object.keys(req.newData).map((key) => {
                    const oldVal = req.oldData[key];
                    const newVal = req.newData[key];
                    if (JSON.stringify(oldVal) === JSON.stringify(newVal)) return null;

                    return (
                      <tr key={key} className="group hover:bg-surface-800/30">
                        <td className="py-3 px-2 font-mono text-xs text-primary-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                        <td className="py-3 px-2 text-surface-400">{oldVal?.toString() || <span className="text-[10px] italic opacity-30">empty</span>}</td>
                        <td className="py-3 px-2 font-bold text-white">
                          <span className="bg-primary-500/10 text-primary-300 px-2 py-1 rounded">
                            {newVal?.toString() || <span className="text-[10px] italic opacity-30">remove</span>}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-surface-500 bg-surface-900/50 p-2 rounded">
                <FiInfo className="flex-shrink-0" />
                <span>Approval will immediately update the official lab profile and laboratory documentation templates.</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
