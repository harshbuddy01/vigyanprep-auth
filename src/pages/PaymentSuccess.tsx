import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function PaymentSuccess() {
  const rollNumber = Math.floor(100000 + Math.random() * 900000);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-neutral-900/90 backdrop-blur border border-white/10 rounded-xl p-8 max-w-md w-full text-center">
        <CheckCircle2 className="w-20 h-20 text-amber-500 mx-auto mb-6" />
        <h1 className="text-3xl font-serif mb-2">Payment Successful!</h1>
        <p className="text-neutral-400 mb-8">Your test series has been activated.</p>
        
        <div className="bg-neutral-800 rounded-lg p-4 mb-8 border border-white/5">
          <div className="text-sm text-neutral-400 mb-1">Your Roll Number</div>
          <div className="text-3xl font-mono text-amber-400 tracking-wider">VP{rollNumber}</div>
        </div>

        <a 
          href="https://test.vigyanprep.com"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:opacity-90 transition"
        >
          Start Your Exam <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}
