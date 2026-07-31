import React, { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });

        if (error) throw error;

        await supabase.from("students").insert({
          email,
          full_name: fullName,
        });

        setMessage({ text: "Account created successfully! Redirecting to exam portal...", type: "success" });
        setTimeout(() => {
          window.location.href = "https://test.vigyanprep.com";
        }, 1200);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage({ text: "Login successful! Launching exam engine...", type: "success" });
        setTimeout(() => {
          window.location.href = "https://test.vigyanprep.com";
        }, 1000);
      }
    } catch (err: any) {
      setMessage({ text: err.message || "An error occurred during authentication", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#120e08] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Blueprint Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] bg-[radial-gradient(#fcd34d_1px,transparent_1px)] [background-size:28px_28px] z-0" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-12">
        {/* Left Side: Handcrafted Sketch Visuals */}
        <div className="flex-1 space-y-6 text-left max-w-md hidden md:block">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-widest">
            ✨ Student Portal Authentication
          </div>

          <h1 className="font-serif italic text-4xl font-bold text-amber-100 tracking-wider">
            VIGYAN<span className="font-sans text-xs tracking-normal uppercase text-amber-400 font-semibold ml-1">.prep</span>
          </h1>

          <p className="text-xs text-neutral-300 font-light leading-relaxed">
            India&apos;s uncompromised research-grade test platform for IISER IAT, NISER NEST, IISc, CMI, and ISI aspirants.
          </p>

          {/* Handcrafted Blueprint Sketch Box */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-dashed border-amber-500/30 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-4">
              <svg className="w-12 h-12 text-amber-400 shrink-0" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                <ellipse cx="50" cy="50" rx="35" ry="12" transform="rotate(30 50 50)" />
                <ellipse cx="50" cy="50" rx="35" ry="12" transform="rotate(-30 50 50)" />
                <circle cx="50" cy="50" r="6" fill="#e8720a" />
              </svg>
              <div>
                <h4 className="font-serif text-sm font-semibold text-amber-200">Supreme Empirical Knowledge</h4>
                <p className="text-[11px] text-neutral-400 font-light mt-0.5">Vi (Supreme) + Gyan (Knowledge)</p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-300/80 font-mono">
              <span>✓ Official PYQs</span>
              <span>✓ Live Proctored Portal</span>
              <span>✓ AIR Analytics</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="w-full max-w-md bg-neutral-900/90 border border-amber-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <button
              onClick={() => setIsSignUp(false)}
              className={`text-sm font-semibold pb-1 transition-colors ${
                !isSignUp ? "text-amber-400 border-b-2 border-amber-400" : "text-neutral-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`text-sm font-semibold pb-1 transition-colors ${
                isSignUp ? "text-amber-400 border-b-2 border-amber-400" : "text-neutral-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {message && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium mb-5 ${
                message.type === "success"
                  ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/40"
                  : "bg-red-950/90 text-red-300 border border-red-500/40"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? "Connecting..." : isSignUp ? "Create Account &rarr;" : "Sign In &rarr;"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
