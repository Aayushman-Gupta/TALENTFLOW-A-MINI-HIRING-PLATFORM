import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";

const Logo = () => (
  <svg
    height="48"
    viewBox="0 0 164 134"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M41.5 133.5L1 93L82 1L163 93L122.5 133.5H41.5Z"
      stroke="#2563eb"
      strokeWidth="2"
    />
    <path d="M122.5 133L82 93L41.5 133" stroke="#60a5fa" strokeWidth="2" />
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with:", email, password);
    // 🔹 Navigate after login (same logic as before)
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
      {/* Top Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-400">
          TalentFlow HR Portal
        </h1>
        <p className="text-gray-400 mt-2">
          Streamline your hiring and candidate management
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#1e293b] border border-slate-700 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center text-white">
          Sign in to your account
        </h2>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Sign in button */}
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-semibold transition"
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-slate-700"></div>
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <div className="flex-grow h-px bg-slate-700"></div>
        </div>

        {/* Google login */}
        <button className="w-full py-2 rounded-lg border border-slate-600 text-gray-300 hover:bg-slate-700 transition">
          Continue with Google
        </button>

        {/* Footer links */}
        <div className="mt-6 text-sm text-center text-gray-400">
          <p>
            Don’t have an account?{" "}
            <p href="/register" className="text-indigo-400 hover:underline">
              Register
            </p>
          </p>
          <p className="mt-2">
            <p href="/forgot" className="text-indigo-400 hover:underline">
              Forgot password?
            </p>
          </p>
        </div>
      </div>
    </div>
  );
}
