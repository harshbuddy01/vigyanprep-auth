import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { setCookie } from '../lib/cookies';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

type Status = 'loading' | 'success' | 'error';

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    let handled = false;

    const handleConfirmation = async (session: any) => {
      if (handled) return;
      handled = true;

      try {
        const user = session.user;
        const email = user.email ?? '';
        const fullName = user.user_metadata?.full_name ?? email.split('@')[0];

        // Now that email is confirmed, safely insert into DB
        await supabase.from('students').upsert(
          { email, full_name: fullName },
          { onConflict: 'email' }
        );
        await supabase.from('users').upsert(
          { email, full_name: fullName, role: 'student' },
          { onConflict: 'email' }
        );

        // Store session
        const token = session.access_token;
        setCookie('student_token', token);
        setCookie('student_name', fullName);
        setCookie('student_email', email);
        localStorage.setItem('student_token', token);
        localStorage.setItem('student_name', fullName);
        localStorage.setItem('student_email', email);

        setStatus('success');
        setMessage('Your email has been confirmed! Redirecting you to the dashboard...');

        setTimeout(() => {
          window.location.href = 'https://test.vigyanprep.com/dashboard';
        }, 2500);
      } catch (err: any) {
        setStatus('error');
        setMessage('There was a problem setting up your account. Please try again or contact support.');
      }
    };

    // Listen for the SIGNED_IN event triggered after email confirmation
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        handleConfirmation(session);
      }
    });

    // Also check if session already exists (e.g. user refreshed the page)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleConfirmation(session);
      else {
        // No session after 5s = likely expired/invalid link
        setTimeout(() => {
          if (!handled) {
            setStatus('error');
            setMessage('The confirmation link is invalid or has expired. Please sign up again or request a new link.');
          }
        }, 5000);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-10 shadow-2xl flex flex-col items-center text-center gap-6">
          {/* Icon */}
          {status === 'loading' && (
            <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <XCircle className="w-9 h-9 text-red-400" />
            </div>
          )}

          {/* Title */}
          <div>
            <h1 className="font-serif text-2xl font-bold text-amber-100 mb-2">
              {status === 'loading' && 'Confirming Email...'}
              {status === 'success' && 'Email Confirmed!'}
              {status === 'error' && 'Confirmation Failed'}
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed">{message}</p>
          </div>

          {/* Progress bar for success */}
          {status === 'success' && (
            <div className="w-full bg-white/5 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 animate-[progress_2.5s_ease-in-out_forwards]" style={{ width: '100%', animation: 'none', transition: 'width 2.5s ease' }} />
            </div>
          )}

          {/* Actions */}
          {status === 'error' && (
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 rounded-xl text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 text-black transition-all"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-neutral-600 mt-6">
          VIGYANprep · Explore · Learn · Discover · Knowledge
        </p>
      </div>
    </div>
  );
}
