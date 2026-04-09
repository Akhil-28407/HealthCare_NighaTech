import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { authApi } from '../../api';
import toast from 'react-hot-toast';
import { FiActivity, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
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
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-lg shadow-primary-500/25">
            <FiActivity className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white">HealthCare Lab</h1>
          <p className="text-surface-300 mt-2">Medical Laboratory Management System</p>
        </div>

        {/* Login Form */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="email">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-300" size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@healthcare.com"
                  className="input-field pl-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-300" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-300 hover:text-white"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Link to="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
              id="login-button"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-surface-700" />
            <span className="text-xs text-surface-300">OR</span>
            <div className="flex-1 h-px bg-surface-700" />
          </div>

          <div className="mt-6 space-y-3">
            <Link
              to="/otp-login"
              className="btn-secondary w-full flex items-center justify-center gap-2"
              id="otp-login-link"
            >
              Login with OTP
            </Link>
            <Link
              to="/register"
              className="text-center block text-sm text-surface-300 hover:text-primary-400 transition-colors"
            >
              Don't have an account? <span className="text-primary-400 font-medium">Register</span>
            </Link>
          </div>
        </div>

        {/* Dev info */}
        <div className="mt-6 glass-card p-4">
          <p className="text-xs text-surface-300 font-medium mb-2">🔑 Demo Credentials:</p>
          <p className="text-xs text-surface-300">admin@healthcare.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
