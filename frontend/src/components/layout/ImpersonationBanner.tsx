import React from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { FiArrowLeftCircle, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const ImpersonationBanner: React.FC = () => {
  const { isImpersonating, user, stopImpersonating } = useAuthStore();
  const navigate = useNavigate();

  if (!isImpersonating) return null;

  const handleReturnAction = () => {
    stopImpersonating();
    toast.success('Returned to Administrator Session');
    navigate('/admin/branches'); // Redirect back to admin dashboard
  };

  return (
    <div className="bg-primary-600 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-[60] shadow-lg animate-in fade-in slide-in-from-top duration-300">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-1.5 rounded-full">
          <FiUser className="text-white" size={16} />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-100">Impersonating Mode</span>
          <p className="text-sm font-semibold tracking-tight">
            Viewing as: <span className="underline decoration-primary-300 underline-offset-4">{user?.name}</span> ({user?.role})
          </p>
        </div>
      </div>

      <button 
        onClick={handleReturnAction}
        className="flex items-center gap-2 bg-white text-primary-600 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-primary-50 transition-colors shadow-sm"
      >
        <FiArrowLeftCircle size={14} />
        Return to Admin
      </button>
    </div>
  );
};
