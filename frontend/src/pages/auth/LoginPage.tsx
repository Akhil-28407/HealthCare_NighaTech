import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { authApi } from '../../api';
import toast from 'react-hot-toast';
import { 
  FiActivity, FiMail, FiLock, FiEye, FiEyeOff, 
  FiUser, FiShield, FiPhone, FiArrowRight,
  FiBriefcase
} from 'react-icons/fi';

type LoginType = 'STAFF' | 'VENDOR' | 'PATIENT';

export default function LoginPage() {
  const [loginType, setLoginType] = useState<LoginType>('STAFF');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP States for Patient
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login(email, password, navigator.userAgent);
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('Login successful!');
      navigateByRole(data.user.role);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.sendOtp(mobile);
      if (data.otp) setDevOtp(data.otp);
      toast.success('OTP sent to your mobile!');
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
      toast.success('Welcome to Patient Portal!');
      navigate('/client/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const navigateByRole = (role: string) => {
    const routes: Record<string, string> = {
      SUPER_ADMIN: '/superadmin/dashboard',
      ADMIN: '/admin/dashboard',
      EMPLOYEE: '/employee/dashboard',
      LAB: '/lab/dashboard',
      LAB_EMP: '/labemp/dashboard',
      CLIENT: '/client/dashboard',
    };
    navigate(routes[role] || '/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-lg shadow-primary-500/25 ring-2 ring-primary-500/20">
            <FiActivity className="text-white" size={28} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">HealthCare Hub</h1>
          <p className="text-surface-400 mt-2 font-medium">Smart Medical Laboratory Ecosystem</p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex bg-surface-900/50 p-1.5 rounded-2xl mb-6 backdrop-blur-xl border border-white/5 shadow-inner">
          <button
            onClick={() => setLoginType('STAFF')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              loginType === 'STAFF' ? 'bg-primary-500 text-white shadow-lg' : 'text-surface-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiShield size={16} /> Staff
          </button>
          <button
            onClick={() => setLoginType('VENDOR')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              loginType === 'VENDOR' ? 'bg-primary-500 text-white shadow-lg' : 'text-surface-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiBriefcase size={16} /> Vendor
          </button>
          <button
            onClick={() => setLoginType('PATIENT')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              loginType === 'PATIENT' ? 'bg-primary-500 text-white shadow-lg' : 'text-surface-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiUser size={16} /> Patient
          </button>
        </div>

        <div className="glass-card p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary-500/20 transition-all duration-700" />
          
          <h2 className="text-2xl font-bold text-white mb-1">
            {loginType === 'STAFF' && 'Staff Login'}
            {loginType === 'VENDOR' && 'Lab Vendor Portal'}
            {loginType === 'PATIENT' && 'Patient Access'}
          </h2>
          <p className="text-surface-400 text-sm mb-8 font-medium">
            {loginType === 'STAFF' && 'Access administrative and employee tools.'}
            {loginType === 'VENDOR' && 'Manage your lab operations and settings.'}
            {loginType === 'PATIENT' && 'View your medical reports and history.'}
          </p>

          {(loginType === 'STAFF' || loginType === 'VENDOR') ? (
            <form onSubmit={handlePasswordLogin} className="space-y-6">
              <div>
                <label className="label text-xs uppercase tracking-wider font-bold text-surface-400" htmlFor="email">Email Address</label>
                <div className="relative group">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-400 transition-colors" size={18} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input-field pl-12 bg-white/5 border-white/5 hover:border-white/10 focus:border-primary-500/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs uppercase tracking-wider font-bold text-surface-400" htmlFor="password">Password</label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-400 transition-colors" size={18} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-12 pr-12 bg-white/5 border-white/5 hover:border-white/10 focus:border-primary-500/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center py-2">
                <Link to="/forgot-password" className="text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-base font-bold shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  loginType === 'STAFF' ? 'Secure Login' : 'Vendor Sign In'
                )}
              </button>

              {loginType === 'VENDOR' && (
                <div className="mt-8 text-center bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-sm text-surface-400 font-medium">
                    New lab owner? 
                    <Link to="/register-vendor" className="ml-1 text-primary-400 hover:text-primary-300 font-bold underline underline-offset-4 decoration-primary-500/30">
                      Register your Lab
                    </Link>
                  </p>
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-6">
              {step === 'mobile' ? (
                <form onSubmit={sendOtp} className="space-y-6">
                  <div>
                    <label className="label text-xs uppercase tracking-wider font-bold text-surface-400" htmlFor="mobile">Mobile Number</label>
                    <div className="relative group">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-400 transition-colors" size={18} />
                      <input
                        id="mobile"
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="Enter mobile number"
                        className="input-field pl-12 bg-white/5 border-white/5 focus:border-primary-500/50"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-4 font-bold flex items-center justify-center gap-2">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Request OTP <FiArrowRight /></>}
                  </button>
                </form>
              ) : (
                <form onSubmit={verifyOtp} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-surface-400 font-medium italic">Sent to <span className="text-primary-400 font-bold">{mobile}</span></p>
                    <button type="button" onClick={() => setStep('mobile')} className="text-xs font-bold text-primary-400 hover:text-white uppercase tracking-wider">Change</button>
                  </div>
                  
                  {devOtp && (
                    <div className="bg-primary-500/10 border border-primary-500/30 rounded-2xl p-4 animate-in zoom-in duration-300">
                      <p className="text-xs text-primary-400 uppercase tracking-widest font-black mb-1">Dev Debug OTP</p>
                      <span className="font-mono text-3xl font-black text-primary-300">{devOtp}</span>
                    </div>
                  )}

                  <div>
                    <label className="label text-xs uppercase tracking-wider font-bold text-surface-400" htmlFor="otp">Verification Code</label>
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="0 0 0 0 0 0"
                      className="input-field text-center text-3xl tracking-[12px] font-black bg-white/5 border-white/5 focus:border-primary-500/50"
                      maxLength={6}
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-4 font-bold">
                    {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Enter Portal'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Brand/Support Footnote */}
        <div className="mt-8 text-center">
          <p className="text-surface-500 text-xs font-bold uppercase tracking-[2px]">
            &copy; 2026 NighaTech Global Ecosystem
          </p>
        </div>
      </div>
    </div>
  );
}
