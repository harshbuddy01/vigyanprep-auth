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
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        await supabase.from("students").upsert({ email, full_name: fullName }, { onConflict: "email" });
        setMessage({ text: "Account created! Check your email to confirm.", type: "success" });
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        const token = data.session?.access_token || "";
        setMessage({ text: "Login successful! Loading your tests...", type: "success" });
        setTimeout(() => { window.location.href = `/tests?token=${encodeURIComponent(token)}`; }, 800);
      }
    } catch (err: any) {
      setMessage({ text: err.message || "An error occurred", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#16120b] text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-stretch gap-0 rounded-3xl overflow-hidden border border-amber-500/20 shadow-2xl shadow-black/80">

        {/* LEFT: Hand-Drawn Sketch Illustration */}
        <div className="hidden md:block md:w-1/2 relative">
          <img
            src="/sketch-login-gateway.jpg"
            alt="Hand-drawn sketch of student entering university gateway"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#16120b]/90" />
          <div className="absolute bottom-8 left-8 right-8">
            <h2 className="font-serif italic text-3xl font-bold text-amber-100 drop-shadow-2xl">
              VIGYAN<span className="font-sans text-xs tracking-normal uppercase text-amber-400 font-semibold ml-1">.prep</span>
            </h2>
            <p className="text-xs text-neutral-300 mt-2 font-light leading-relaxed max-w-xs">
              Explore &middot; Learn &middot; Discover &middot; Knowledge
            </p>
            <div className="flex items-center gap-4 mt-3 text-[10px] text-amber-300/80 font-mono">
              <span>✓ Official PYQs</span>
              <span>✓ Live Proctored</span>
              <span>✓ AIR Analytics</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Login Form */}
        <div className="w-full md:w-1/2 bg-[#16120b] p-8 sm:p-10 flex flex-col justify-center">
          {/* Mobile Brand */}
          <div className="text-center mb-6 md:hidden">
            <h1 className="font-serif italic text-3xl font-bold text-amber-100 tracking-wider">
              VIGYAN<span className="font-sans text-xs tracking-normal uppercase text-amber-400 font-semibold ml-1">.prep</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">Student Portal Authentication</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:block mb-6">
            <h2 className="font-serif text-2xl font-bold text-amber-100">Welcome Back</h2>
            <p className="text-xs text-neutral-400 mt-1">Access your premium test series & PYQ archives</p>
          </div>

          {/* Tab Toggle */}
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <button
              onClick={() => setIsSignUp(false)}
              className={`text-sm font-semibold pb-1 transition-colors ${!isSignUp ? "text-amber-400 border-b-2 border-amber-400" : "text-neutral-400 hover:text-white"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`text-sm font-semibold pb-1 transition-colors ${isSignUp ? "text-amber-400 border-b-2 border-amber-400" : "text-neutral-400 hover:text-white"}`}
            >
              Create Account
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-xs font-medium mb-4 ${message.type === "success" ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30" : "bg-red-950/80 text-red-300 border border-red-500/30"}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">Full Name</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors" />
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors" />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50">
              {loading ? "Connecting..." : isSignUp ? "Create Account →" : "Sign In →"}
            </button>
          </form>

          {/* Sketch Decoration on Mobile */}
          <div className="mt-6 md:hidden rounded-xl overflow-hidden border border-amber-500/15">
            <img src="/sketch-student-studying.jpg" alt="Hand-drawn sketch of student studying" className="w-full h-32 object-cover opacity-60" />
          </div>
        </div>
      </div>
    </div>
  );
}
