import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase puts the access_token in the URL hash when coming from email link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Also check if we already have a session (token was processed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully! Redirecting to login...' });
      setTimeout(() => navigate('/'), 2500);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mb-4">
              <KeyRound className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-amber-100 text-center">Set New Password</h1>
            <p className="text-xs text-neutral-400 mt-1 text-center">Choose a strong password for your account</p>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-3.5 rounded-xl text-xs font-medium mb-5 flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                : 'bg-red-950/80 text-red-300 border border-red-500/30'
            }`}>
              {message.type === 'success'
                ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                : <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password strength indicator */}
            {password && (
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      password.length >= i * 3
                        ? password.length >= 10
                          ? 'bg-emerald-400'
                          : password.length >= 6
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !sessionReady}
              className="w-full py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? 'Updating...' : 'Update Password →'}
            </button>

            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-amber-400 hover:text-amber-300 text-sm"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>

        {/* Branding */}
        <p className="text-center text-xs text-neutral-600 mt-6">
          VIGYANprep · Explore · Learn · Discover · Knowledge
        </p>
      </div>
    </div>
  );
}
