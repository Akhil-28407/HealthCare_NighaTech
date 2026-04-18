import { FiAlertTriangle, FiX } from 'react-icons/fi';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="glass-card p-6 w-full max-w-md space-y-4 relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-surface-400 hover:text-white transition-colors"
        >
          <FiX size={20} />
        </button>

        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isDanger ? 'bg-red-500/20 text-red-500' : 'bg-primary-500/20 text-primary-500'}`}>
            <FiAlertTriangle size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>

        <p className="text-surface-300">{message}</p>

        <div className="flex gap-3 pt-2">
           <button 
            onClick={onClose} 
            className="btn-secondary flex-1"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className={`${isDanger ? 'bg-red-500 hover:bg-red-600' : 'btn-primary'} text-white font-semibold py-2 px-4 rounded-xl flex-1 transition-all shadow-lg active:scale-95`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
