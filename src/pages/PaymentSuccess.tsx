import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Copy, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function PaymentSuccess() {
  const { state } = useLocation();
  const [rollNumber, setRollNumber] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(true);
  const [testToken, setTestToken] = useState('');

  useEffect(() => {
    const init = async () => {
      // 1. Use roll number from payment verification state if provided by backend
      let roll: string | null = state?.rollNumber || null;

      // 2. If not in state, fetch from Supabase students table
      if (!roll) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('students')
            .select('roll_number')
            .eq('id', user.id)
            .single();
          roll = data?.roll_number || null;
        }
      }

      // 3. If still no roll number (edge case), generate and persist it
      if (!roll) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Generate sequential-style roll number and save to DB
          const seq = Math.floor(100001 + Math.random() * 899999);
          roll = `VP${seq}`;
          await supabase
            .from('students')
            .update({ roll_number: roll })
            .eq('id', user.id);
        }
      }

      setRollNumber(roll);

      // 4. Get SSO token for the "Start Exam" button
      const { data: { session } } = await supabase.auth.getSession();
      setTestToken(session?.access_token || '');
      setSaving(false);
    };

    init();
  }, [state]);

  const handleCopy = () => {
    if (rollNumber) {
      navigator.clipboard.writeText(rollNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const testUrl = `https://test.vigyanprep.com${state?.testId ? `/instructions?testId=${state.testId}&token=${encodeURIComponent(testToken)}` : ''}`;

  if (saving) {
    return (
      <div className="min-h-screen bg-[#16120b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-amber-400/60 text-sm">Confirming your enrollment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#16120b] flex items-center justify-center p-4">
      <div className="bg-neutral-900/90 backdrop-blur border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">

        {/* Success Icon with animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-10 h-10 text-amber-400" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-serif text-amber-100 mb-2">Payment Successful!</h1>
        <p className="text-neutral-400 text-sm mb-8">
          Your test series has been activated. Save your roll number — you'll need it for the exam.
        </p>

        {/* Roll Number Card */}
        <div className="bg-neutral-800/80 rounded-xl p-5 mb-6 border border-amber-500/20">
          <div className="text-xs text-neutral-400 mb-2 uppercase tracking-widest font-mono">Your Roll Number</div>
          <div className="text-4xl font-mono text-amber-400 tracking-widest mb-3">
            {rollNumber || '—'}
          </div>
          <button
            onClick={handleCopy}
            className="text-xs text-neutral-400 hover:text-amber-300 flex items-center gap-1 mx-auto transition"
          >
            <Copy className="w-3 h-3" />
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </button>
        </div>

        {/* Exam instructions */}
        <div className="bg-neutral-800/40 rounded-lg p-4 mb-8 text-left text-xs text-neutral-400 leading-relaxed">
          <p className="font-semibold text-amber-400/80 mb-2">📋 Before you start:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Use Chrome or Firefox on a laptop/desktop</li>
            <li>Ensure stable internet connection</li>
            <li>Close all other browser tabs</li>
            <li>Keep your roll number handy</li>
          </ul>
        </div>

        {/* CTA */}
        <a
          href={testUrl}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:opacity-90 transition text-sm"
        >
          Enter Exam Portal <ArrowRight className="w-4 h-4" />
        </a>

        <p className="mt-4 text-xs text-neutral-500">
          You can also access your tests anytime via{' '}
          <a href="/tests" className="text-amber-400/70 hover:text-amber-400 underline">My Tests</a>
        </p>
      </div>
    </div>
  );
}
