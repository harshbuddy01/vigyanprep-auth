import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Eye, EyeOff, Lock, Mail, User, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { setCookie, getCookie } from "../lib/cookies";

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
    const cookieToken = getCookie("student_token");
    const localToken = localStorage.getItem("student_token");

    if (!cookieToken && localToken) {
      localStorage.removeItem("student_token");
      localStorage.removeItem("student_name");
      localStorage.removeItem("student_email");
      return;
    }

    if (!cookieToken) {
      supabase.auth.signOut().catch(() => {});
      return;
    }

    if (cookieToken) {
      try {
        const payload = JSON.parse(atob(cookieToken.split('.')[1]));
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          window.location.href = "https://test.vigyanprep.com/dashboard";
        } else {
          localStorage.removeItem("student_token");
          localStorage.removeItem("student_name");
          localStorage.removeItem("student_email");
        }
      } catch (err) {
        localStorage.removeItem("student_token");
        localStorage.removeItem("student_name");
        localStorage.removeItem("student_email");
      }
    }
  }, []);

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setMessage({ text: "Please enter your email address to reset password.", type: "error" });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      setMessage({ text: "Password reset link sent to your email!", type: "success" });
      setShowForgotPassword(false);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to send reset link", type: "error" });
    } finally {
      setLoading(false);
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
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/confirm-email`,
          },
        });
        if (error) throw error;

        if (data.user && data.user.identities && data.user.identities.length === 0) {
          throw new Error("This email is already registered. Please sign in instead.");
        }

        setMessage({
          text: "✉️ A confirmation email has been sent to " + email + ". Please click the link in it to activate your account.",
          type: "success",
        });
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          if (signInError.message.toLowerCase().includes("email not confirmed")) {
            throw new Error("Your email is not confirmed yet. Please check your inbox and click the confirmation link first.");
          }
          throw signInError;
        }

        if (data?.session) {
          const token = data.session.access_token;
          const name = data.session.user?.user_metadata?.full_name || data.session.user?.email?.split("@")[0] || "Student";
          
          if (rememberMe) {
            setCookie("student_token", token);
            setCookie("student_name", name);
            setCookie("student_email", email);
          } else {
            document.cookie = `student_token=${token}; domain=.vigyanprep.com; path=/;`;
            document.cookie = `student_name=${encodeURIComponent(name)}; domain=.vigyanprep.com; path=/;`;
            document.cookie = `student_email=${encodeURIComponent(email)}; domain=.vigyanprep.com; path=/;`;
          }

          localStorage.setItem("student_token", token);
          localStorage.setItem("student_name", name);
          localStorage.setItem("student_email", email);
        }

        setMessage({ text: "Login successful! Loading your student portal...", type: "success" });
        setTimeout(() => {
          window.location.href = "https://test.vigyanprep.com/dashboard";
        }, 600);
      }
    } catch (err: any) {
      setMessage({ text: err.message || "An error occurred during authentication.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'azure' | 'apple') => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `https://test.vigyanprep.com/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setMessage({ text: err.message || `Failed to sign in with ${provider}`, type: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f3e9] text-[#1c1815] font-sans relative overflow-x-hidden flex items-center justify-center p-4 sm:p-8 selection:bg-amber-400 selection:text-black">
      
      {/* ═══════════════════════════════════════════════════════════════════════
          ORGANIC GRAPH / GRID PAPER BACKGROUND PATTERN WITH MATH DOODLES
         ═══════════════════════════════════════════════════════════════════════ */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40 z-0" 
        style={{
          backgroundImage: `
            linear-gradient(to right, #e2dac9 1px, transparent 1px),
            linear-gradient(to bottom, #e2dac9 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Hand-drawn Math & Physics Diagrams (Absolute Sketches on Background) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none opacity-60">
        {/* Tetrahedron & E=mc^2 Sketch (Top-left quadrant) */}
        <svg className="absolute top-16 left-[22%] w-44 h-44 text-[#6e5d4f]/40" viewBox="0 0 200 200" fill="none">
          <polygon points="100,30 30,140 170,140" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="100" y1="30" x2="100" y2="170" stroke="currentColor" strokeWidth="1.5" />
          <line x1="30" y1="140" x2="100" y2="170" stroke="currentColor" strokeWidth="1.5" />
          <line x1="170" y1="140" x2="100" y2="170" stroke="currentColor" strokeWidth="1.5" />
          <text x="110" y="125" fill="currentColor" fontFamily="serif" fontSize="16" fontStyle="italic">E = mc²</text>
        </svg>

        {/* Atom Orbit Model (Top center) */}
        <svg className="absolute top-20 left-[42%] w-28 h-28 text-[#6e5d4f]/35" viewBox="0 0 100 100" fill="none">
          <ellipse cx="50" cy="50" rx="40" ry="14" stroke="currentColor" strokeWidth="1.2" transform="rotate(-30 50 50)" />
          <ellipse cx="50" cy="50" rx="40" ry="14" stroke="currentColor" strokeWidth="1.2" transform="rotate(30 50 50)" />
          <circle cx="50" cy="50" r="4" fill="currentColor" />
          <path d="M70 20 Q 80 30 75 45" stroke="currentColor" strokeWidth="1.2" markerEnd="url(#arrow)" />
        </svg>

        {/* Sin(x)/x Curve (Bottom left) */}
        <svg className="absolute bottom-20 left-[18%] w-52 h-28 text-[#6e5d4f]/40" viewBox="0 0 200 100" fill="none">
          <line x1="10" y1="80" x2="190" y2="80" stroke="currentColor" strokeWidth="1.2" />
          <line x1="30" y1="10" x2="30" y2="90" stroke="currentColor" strokeWidth="1.2" />
          <path d="M 30 20 Q 50 90 70 80 T 110 80 T 150 80 T 190 80" stroke="currentColor" strokeWidth="1.8" fill="none" />
          <text x="120" y="45" fill="currentColor" fontFamily="serif" fontSize="14" fontStyle="italic">sin x / x</text>
        </svg>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN TWO-COLUMN CARD CONTAINER
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-stretch rounded-3xl overflow-hidden shadow-2xl border border-[#d9cea8]/60 bg-[#fbf8f1] min-h-[640px]">
        
        {/* ---------------------------------------------------------------------
            LEFT SHOWCASE COLUMN: Warm Academic Paper & Collage Aesthetic
           --------------------------------------------------------------------- */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 relative flex flex-col justify-between bg-[#f4ebd9]/60 border-b lg:border-b-0 lg:border-r border-[#e5dab9] overflow-hidden">
          
          {/* Top Logo */}
          <div className="relative z-10">
            <a href="https://vigyanprep.com/" title="Go to VigyanPrep Homepage" className="inline-block group">
              <img
                src="/vigyan-logo.png"
                alt="VigyanPrep Official Logo"
                className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </a>
          </div>

          {/* Collage Cards Container */}
          <div className="relative z-10 my-8 space-y-6 max-w-md">
            
            {/* Card 1: Focus Plan Notebook Page */}
            <div className="bg-[#fbf9f4] p-5 rounded-xl border border-[#e0d6bc] shadow-md transform -rotate-1 hover:rotate-0 transition-transform duration-300 relative">
              {/* Tape visual effect */}
              <div className="absolute -top-3 left-8 w-14 h-5 bg-[#e8dec0]/80 backdrop-blur-xs transform -rotate-6 border-x border-[#c9bfa0]/40 shadow-xs" />
              
              <h4 className="font-serif font-bold text-sm text-[#4a3b2c] border-b border-[#e2d8c0] pb-2 mb-3">
                Focus Plan
              </h4>
              <ul className="space-y-2 text-xs font-serif text-[#3b2e24]">
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-md border-2 border-emerald-700/60 flex items-center justify-center text-emerald-800 text-[10px] font-bold">✓</span>
                  <span>Understand</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-md border-2 border-emerald-700/60 flex items-center justify-center text-emerald-800 text-[10px] font-bold">✓</span>
                  <span>Practice</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-md border-2 border-emerald-700/60 flex items-center justify-center text-emerald-800 text-[10px] font-bold">✓</span>
                  <span>Analyze</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-md border-2 border-[#8c7b6b] flex items-center justify-center text-transparent text-[10px]">○</span>
                  <span>Improve</span>
                </li>
              </ul>
            </div>

            {/* Card 2: Golden Sticky Note & Quote Card Side-by-Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Golden Sticky Note */}
              <div className="bg-[#f5cf6d] p-5 rounded-lg shadow-md transform rotate-2 hover:rotate-0 transition-transform duration-300 border border-[#dfb342] flex flex-col justify-between min-h-[140px]">
                <div className="font-serif font-bold text-sm text-[#3b2706] leading-snug">
                  Learn.<br />
                  Practice.<br />
                  Improve.<br />
                  <span className="bg-[#3b2706] text-[#f5cf6d] px-1.5 py-0.5 rounded-sm inline-block mt-1 font-sans font-extrabold tracking-wider text-xs">
                    Succeed.
                  </span>
                </div>
              </div>

              {/* Quote Torn Paper Card */}
              <div className="bg-[#fcfaf5] p-5 rounded-xl border border-[#ded4b8] shadow-md transform -rotate-1 hover:rotate-0 transition-transform duration-300 relative">
                <span className="text-3xl font-serif text-[#7c6652] leading-none block -mb-2">“</span>
                <p className="font-serif italic text-xs text-[#4a3b2b] leading-relaxed">
                  The beautiful thing about learning is that no one can take it away from you.
                </p>
                <p className="text-[10px] font-sans font-bold text-[#8c7662] mt-3 text-right">
                  — B.B. King
                </p>
              </div>

            </div>

            {/* Round Emblem Badge Sticker */}
            <div className="absolute -right-4 -bottom-6 w-14 h-14 rounded-full bg-[#f4b931] border-2 border-[#d99f18] shadow-lg flex items-center justify-center text-[#2b1b04] font-serif font-extrabold text-sm transform rotate-12 z-20">
              <img src="/favicon.png" alt="Emblem" className="w-10 h-10 object-contain" />
            </div>

          </div>

          {/* Bottom Footer Credits & Pen Artwork */}
          <div className="relative z-10 pt-4 border-t border-[#e5dab9]/80 flex items-center justify-between text-[11px] font-medium text-[#7c6a58]">
            <span>© 2025 Vigyan Prep. All rights reserved.</span>
            <span className="font-mono text-[10px]">IISER · NEST · CMI</span>
          </div>

        </div>

        {/* ---------------------------------------------------------------------
            RIGHT COLUMN: Authentication Form & Social Logins
           --------------------------------------------------------------------- */}
        <div className="w-full lg:w-1/2 p-8 sm:p-14 bg-[#fbf8f1] flex flex-col justify-center">
          
          {/* Top Pill Badge */}
          <div className="self-start mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f2e9d2] border border-[#d9ceb0] text-[#4a3a2a] text-xs font-semibold shadow-xs">
              <ShieldCheck size={14} className="text-[#a67c1e]" />
              <span>Trusted by 10,000+ Serious Learners</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1c1815]">
              {isSignUp ? "Create Account" : "Welcome Back!"}
            </h2>
            <p className="text-xs text-[#6e5f50] mt-1.5 font-medium">
              {isSignUp
                ? "Join 10,000+ serious science research aspirants today."
                : "Sign in to continue your learning journey."}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-[#e2d8c0] mb-6">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setMessage(null); }}
              className={`pb-3 text-sm font-bold transition-all relative px-2 ${
                !isSignUp ? "text-[#1c1815]" : "text-[#8c7b6c] hover:text-[#1c1815]"
              }`}
            >
              Sign In
              {!isSignUp && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f4b931] rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setMessage(null); }}
              className={`pb-3 text-sm font-bold transition-all relative px-6 ${
                isSignUp ? "text-[#1c1815]" : "text-[#8c7b6c] hover:text-[#1c1815]"
              }`}
            >
              Create Account
              {isSignUp && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f4b931] rounded-full" />
              )}
            </button>
          </div>

          {/* Feedback Messages */}
          {message && (
            <div
              className={`p-4 rounded-xl text-xs font-medium mb-6 flex items-start gap-2.5 shadow-xs ${
                message.type === "success"
                  ? "bg-emerald-500/10 text-emerald-900 border border-emerald-600/30"
                  : "bg-red-500/10 text-red-900 border border-red-600/30"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-700 mt-0.5" />
              )}
              <span className="leading-relaxed">{message.text}</span>
            </div>
          )}

          {/* Form Content */}
          {showForgotPassword ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5c4c3c] mb-1.5">
                  Reset Password Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7b6c]" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-[#f4efe3] border border-[#d9cea8] rounded-xl pl-10 pr-4 py-3 text-xs text-[#1c1815] font-medium placeholder-[#8c7b6c] focus:outline-none focus:border-[#a67c1e] transition shadow-inner"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full py-3.5 bg-[#1c1815] hover:bg-[#332b24] text-white font-bold rounded-xl text-xs tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-center text-xs text-[#7c6a58] hover:text-[#1c1815] font-semibold mt-2"
              >
                ← Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name field (For Sign Up) */}
              {isSignUp && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5c4c3c] mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7b6c]" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full bg-[#f4efe3] border border-[#d9cea8] rounded-xl pl-10 pr-4 py-3 text-xs text-[#1c1815] font-medium placeholder-[#8c7b6c] focus:outline-none focus:border-[#a67c1e] transition shadow-inner"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5c4c3c] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7b6c]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-[#f4efe3] border border-[#d9cea8] rounded-xl pl-10 pr-4 py-3 text-xs text-[#1c1815] font-medium placeholder-[#8c7b6c] focus:outline-none focus:border-[#a67c1e] transition shadow-inner"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5c4c3c] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7b6c]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-[#f4efe3] border border-[#d9cea8] rounded-xl pl-10 pr-10 py-3 text-xs text-[#1c1815] font-medium placeholder-[#8c7b6c] focus:outline-none focus:border-[#a67c1e] transition shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8c7b6c] hover:text-[#1c1815] transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Options row (Remember me / Forgot password) */}
              {!isSignUp && (
                <div className="flex items-center justify-between pt-1 pb-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-[#4a3b2c] font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#d9cea8] text-[#f4b931] focus:ring-0 cursor-pointer accent-[#1c1815]"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(true); setResetEmail(email); }}
                    className="text-[#a67c1e] hover:text-[#1c1815] font-semibold transition"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-[#1c1815] hover:bg-[#332b24] disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition shadow-lg flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <span>{loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}</span>
                <ArrowRight size={16} className="text-[#f4b931]" />
              </button>

            </form>
          )}

          {/* Social Logins Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e2d8c0]" />
            </div>
            <span className="relative px-3 bg-[#fbf8f1] text-[11px] font-semibold text-[#8c7b6c]">
              or continue with
            </span>
          </div>

          {/* Social Logins Grid */}
          <div className="grid grid-cols-3 gap-3">
            
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialAuth('google')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#f4efe3] hover:bg-[#eae3d2] border border-[#d9cea8] rounded-xl text-xs font-bold text-[#3b2e24] transition shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>

            {/* Microsoft */}
            <button
              type="button"
              onClick={() => handleSocialAuth('azure')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#f4efe3] hover:bg-[#eae3d2] border border-[#d9cea8] rounded-xl text-xs font-bold text-[#3b2e24] transition shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              <span>Microsoft</span>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleSocialAuth('apple')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#f4efe3] hover:bg-[#eae3d2] border border-[#d9cea8] rounded-xl text-xs font-bold text-[#3b2e24] transition shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0 fill-current text-[#1c1815]" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-5.01.12-9.87-1.94-14.58-6.19-3.37-2.83-7.23-7.58-11.58-14.25-8.5-12.96-14.93-27.5-19.3-43.62-4.36-16.12-6.54-31.54-6.54-46.26 0-17.75 4.31-32.55 12.93-44.4 8.62-11.85 19.39-17.89 32.31-18.13 4.9.12 10.3 1.25 16.2 3.39 5.9 2.14 9.87 3.21 11.91 3.21 1.74 0 5.88-1.12 12.43-3.36 6.55-2.24 11.88-3.26 15.99-3.07 14.38.74 25.8 6.13 34.27 16.18-12.95 7.82-19.26 18.66-18.93 32.53.33 11.1 4.5 20.35 12.51 27.75 8.01 7.4 17.58 11.52 28.71 12.36-2.51 7.62-5.75 15.04-9.72 22.28zM119.22 31.84c0-7.73 2.76-14.99 8.28-21.78 5.52-6.79 12.45-10.84 20.78-12.15.54 8.05-2.14 15.48-8.04 22.29-5.9 6.81-12.97 10.63-21.21 11.45-.11-.53-.17-1.14-.17-1.81z"/>
              </svg>
              <span>Apple</span>
            </button>

          </div>

          {/* Legal Disclaimer */}
          <div className="mt-8 text-center text-[10px] text-[#8c7b6c] font-medium leading-relaxed">
            By continuing, you agree to our{" "}
            <a href="https://vigyanprep.com/terms" className="underline hover:text-[#1c1815]">Terms of Service</a>{" "}
            and{" "}
            <a href="https://vigyanprep.com/privacy" className="underline hover:text-[#1c1815]">Privacy Policy</a>.
          </div>

        </div>

      </div>

    </div>
  );
}
