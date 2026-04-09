import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { authApi } from '../../api';
import toast from 'react-hot-toast';
import { FiActivity, FiPhone, FiArrowRight } from 'react-icons/fi';

export default function OtpLoginPage() {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.sendOtp(mobile);
      if (data.otp) setDevOtp(data.otp);
      toast.success('OTP sent!');
      setStep('otp');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp(mobile, otp, navigator.userAgent);
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('Login successful!');
      const routes: Record<string, string> = {
        SUPER_ADMIN: '/superadmin/dashboard', ADMIN: '/admin/dashboard',
        EMPLOYEE: '/employee/dashboard', LAB: '/lab/dashboard',
        LAB_EMP: '/labemp/dashboard', CLIENT: '/client/dashboard',
      };
      navigate(routes[data.user.role] || '/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-lg shadow-primary-500/25">
            <FiActivity className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white">OTP Login</h1>
          <p className="text-surface-300 mt-2">Login with your mobile number</p>
        </div>

        <div className="glass-card p-8">
          {step === 'mobile' ? (
            <form onSubmit={sendOtp} className="space-y-5">
              <div>
                <label className="label" htmlFor="mobile">Mobile Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-300" size={18} />
                  <input
                    id="mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="9876543210"
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send OTP <FiArrowRight /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-5">
              <p className="text-sm text-surface-300">OTP sent to <span className="text-primary-400">{mobile}</span></p>
              {devOtp && (
                <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-3">
                  <p className="text-xs text-primary-400">Dev Mode OTP: <span className="font-bold text-lg text-primary-300">{devOtp}</span></p>
                </div>
              )}
              <div>
                <label className="label" htmlFor="otp">Enter OTP</label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="input-field text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Verify OTP'}
              </button>
              <button type="button" onClick={() => setStep('mobile')} className="text-sm text-surface-300 hover:text-primary-400 w-full text-center">
                Change number
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-surface-300 hover:text-primary-400 transition-colors">
              ← Back to email login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
