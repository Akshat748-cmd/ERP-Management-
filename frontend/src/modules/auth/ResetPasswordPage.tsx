import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTenant } from '@/context/TenantContext';
import { getTenantGradient } from '@/config/theme';
import { apiClient } from '@/services/api/client';
import { notificationService } from '@/services/notifications/notificationService';
import { Eye, EyeOff, KeyRound, ArrowRight } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { tenant } = useTenant();
  const theme = getTenantGradient(tenant?.id || 'default');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Password reset token is missing or invalid.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await apiClient.post('/auth/reset-password', {
        token,
        new_password: newPassword,
      });

      notificationService.success(res.data.message || 'Password reset successfully! Please sign in.');
      navigate('/login', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Password reset failed.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full text-white flex items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-900"
      style={{
        background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientVia} 60%, ${theme.gradientTo})`,
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden"
        style={{
          background: theme.glassBg,
          backdropFilter: 'blur(16px)',
          border: `1px solid ${theme.glassBorder}`,
        }}
      >
        {/* Glow orb */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-white">Reset Account Password</h2>
          <p className="text-xs text-slate-300">
            Enter your new secure password below to complete password recovery.
          </p>
        </div>

        {!token ? (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 text-center space-y-2">
            <p className="font-bold">Missing Reset Token</p>
            <p>Please request a new reset link from the login page.</p>
            <Link to="/login" className="inline-block mt-2 font-bold text-amber-400 underline">
              Return to Sign In →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password..."
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono text-sm"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-[#0F1D33] font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Updating Password...' : 'Save New Password'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-white/5">
          <Link to="/login" className="text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors">
            ← Back to Portal Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
