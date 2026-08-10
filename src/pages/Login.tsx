import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Eye, EyeOff, Lock, Mail, User, CheckCircle2, AlertCircle } from "lucide-react";

import { setCookie } from "../lib/cookies";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  React.useEffect(() => {
    const token = getCookie("student_token") || localStorage.getItem("student_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          window.location.href = "https://test.vigyanprep.com/dashboard";
        }
      } catch (err) {
        // Clean up invalid token
        localStorage.removeItem("student_token");
        localStorage.removeItem("student_name");
        localStorage.removeItem("student_email");
      }
    }
  }, []);

  const handleResetPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      setMessage({ text: 'Password reset link sent to your email!', type: 'success' });
      setShowForgotPassword(false);
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to send reset link', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        try {
          await supabase.from("students").upsert({ email, full_name: fullName }, { onConflict: "email" });
        } catch (_) {}
        try {
          await supabase.from("users").upsert({ email, full_name: fullName, role: "student" }, { onConflict: "email" });
        } catch (_) {}

        if (data?.session) {
          const token = data.session.access_token;
          setCookie("student_token", token);
          setCookie("student_name", fullName);
          setCookie("student_email", email);
          localStorage.setItem("student_token", token);
          localStorage.setItem("student_name", fullName);
          localStorage.setItem("student_email", email);
        }

        setMessage({ text: "Account created successfully! Check your email to confirm.", type: "success" });
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        if (data?.session) {
          const token = data.session.access_token;
          const name = data.session.user?.user_metadata?.full_name || data.session.user?.email?.split("@")[0] || "Student";
          setCookie("student_token", token);
          setCookie("student_name", name);
          setCookie("student_email", email);
          localStorage.setItem("student_token", token);
          localStorage.setItem("student_name", name);
          localStorage.setItem("student_email", email);
        }

        setMessage({ text: "Login successful! Loading your student portal...", type: "success" });
        setTimeout(() => {
          window.location.href = "https://test.vigyanprep.com/dashboard";
        }, 800);
      }
    } catch (err: any) {
      setMessage({ text: err.message || "An error occurred during authentication.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#120e08] text-white flex items-center justify-center px-4 py-12 selection:bg-amber-500 selection:text-black">
      {/* Background blueprint watermark */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#fcd34d_1px,transparent_1px)] [background-size:28px_28px] z-0" />

      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-stretch gap-0 rounded-3xl overflow-hidden border border-amber-500/30 bg-[#16120b] shadow-2xl shadow-black/90">

        {/* LEFT: Realistic Vintage Hand-Drawn Sketch Artwork */}
        <div className="hidden md:block md:w-1/2 relative bg-[#120e08]">
          <img
            src="/sketch-login-gateway.jpg"
            alt="Hand-drawn realistic sketch of student entering the University of Knowledge gateway"
            className="w-full h-full object-cover object-center min-h-[540px]"
          />
          {/* Edge gradient blending */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#16120b]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#16120b] via-transparent to-transparent opacity-80" />

          {/* Overlay Text */}
          <div className="absolute bottom-8 left-8 right-8 z-10">
            <h2 className="font-serif italic text-3xl font-bold text-amber-100 drop-shadow-2xl">
              VIGYAN<span className="font-sans text-xs tracking-normal uppercase text-amber-400 font-semibold ml-1">.prep</span>
            </h2>
            <p className="text-xs text-neutral-300 mt-1.5 font-light leading-relaxed max-w-xs drop-shadow">
              Explore &middot; Learn &middot; Discover &middot; Knowledge
            </p>
            <div className="flex items-center gap-4 mt-3 text-[10px] text-amber-300/90 font-mono">
              <span>✓ Official PYQs</span>
              <span>✓ Live Proctored</span>
              <span>✓ AIR Analytics</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Login & Sign Up Form */}
        <div className="w-full md:w-1/2 bg-[#16120b] p-8 sm:p-12 flex flex-col justify-center">
          
          {/* Mobile Header */}
          <div className="text-center mb-6 md:hidden">
            <h1 className="font-serif italic text-3xl font-bold text-amber-100 tracking-wider">
              VIGYAN<span className="font-sans text-xs tracking-normal uppercase text-amber-400 font-semibold ml-1">.prep</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">Student Portal Authentication</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:block mb-6">
            <h2 className="font-serif text-3xl font-bold text-amber-100">Welcome Back</h2>
            <p className="text-xs text-neutral-400 mt-1">Access your premium test series &amp; PYQ archives</p>
          </div>

          {/* Tab Toggle */}
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-3">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setMessage(null); }}
              className={`text-sm font-semibold pb-1.5 transition-all ${
                !isSignUp ? "text-amber-400 border-b-2 border-amber-400" : "text-neutral-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setMessage(null); }}
              className={`text-sm font-semibold pb-1.5 transition-all ${
                isSignUp ? "text-amber-400 border-b-2 border-amber-400" : "text-neutral-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Notification Messages */}
          {message && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium mb-4 flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
                  : "bg-red-950/80 text-red-300 border border-red-500/30"
              }`}
            >
              {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Form */}
          {showForgotPassword ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">
                  Reset Password Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                Send Reset Link →
              </button>
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-amber-400 hover:text-amber-300 text-sm"
                >
                  Back to Login
                </button>
              </div>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-400 hover:text-white">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-white/20 bg-neutral-950 text-amber-400 focus:ring-0 accent-amber-400"
                />
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? "Connecting..." : isSignUp ? "Create Account →" : "Sign In →"}
            </button>
            {!isSignUp && (
              <div className="text-center mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowForgotPassword(true)} 
                  className="text-amber-400 hover:text-amber-300 text-sm"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </form>
          )}

        </div>
      </div>
    </div>
  );
}
