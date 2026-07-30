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
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });

        if (error) throw error;

        // Also insert into students table
        await supabase.from("students").insert({
          email,
          full_name: fullName,
        });

        setMessage({ text: "Account created successfully! Check your email to confirm.", type: "success" });
      } else {
        // Sign In
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage({ text: "Login successful! Redirecting...", type: "success" });
        setTimeout(() => {
          window.location.href = "https://test.vigyanprep.com";
        }, 1200);
      }
    } catch (err: any) {
      setMessage({ text: err.message || "An error occurred", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#16120b] text-white flex flex-col justify-center items-center px-4 py-12">
      {/* Brand */}
      <div className="text-center mb-8">
        <h1 className="font-serif italic text-4xl font-bold text-amber-100 tracking-wider">
          VIGYAN<span className="font-sans text-xs tracking-normal uppercase text-amber-400 font-semibold ml-1">.prep</span>
        </h1>
        <p className="text-xs text-neutral-400 font-light mt-1">Student Portal Authentication</p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md bg-neutral-900/90 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <button
            onClick={() => setIsSignUp(false)}
            className={`text-sm font-medium pb-1 transition-colors ${
              !isSignUp ? "text-amber-400 border-b-2 border-amber-400" : "text-neutral-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`text-sm font-medium pb-1 transition-colors ${
              isSignUp ? "text-amber-400 border-b-2 border-amber-400" : "text-neutral-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-xs font-medium mb-4 ${
              message.type === "success"
                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
                : "bg-red-950/80 text-red-300 border border-red-500/30"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5">Full Name</label>
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
            <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5">Email Address</label>
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
            <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5">Password</label>
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
            {loading ? "Processing..." : isSignUp ? "Create Account &rarr;" : "Sign In &rarr;"}
          </button>
        </form>
      </div>
    </div>
  );
}
