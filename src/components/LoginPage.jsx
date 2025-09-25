import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// --- UI ENHANCEMENT: Using a consistent icon library and Framer Motion ---
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

// --- UI ENHANCEMENT: A simple placeholder logo component ---
const Logo = () => (
  <svg
    height="48"
    viewBox="0 0 164 134"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M41.5 133.5L1 93L82 1L163 93L122.5 133.5H41.5Z"
      stroke="#4F46E5"
      strokeWidth="2"
    />
    <path d="M122.5 133L82 93L41.5 133" stroke="#A5B4FC" strokeWidth="2" />
  </svg>
);

export default function LoginPage() {
  // --- LOGIC REMAINS UNCHANGED ---
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const backgroundImageUrl = "/office-background.png";

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  // --- UI ENHANCEMENT: Animation variants for the form elements ---
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center font-sans p-4"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      {/* --- UI ENHANCEMENT: Added a dark overlay for better contrast --- */}
      <div className="absolute inset-0 bg-black/50" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20"
      >
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center text-center"
        >
          <Logo />
          <h1 className="text-4xl font-bold text-white tracking-wider mt-4">
            Welcome Back
          </h1>
          <p className="text-gray-300 mt-2">
            Sign in to the TalentFlow HR Portal
          </p>
        </motion.div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <motion.div variants={itemVariants} className="relative">
            <div className="absolute top-1/2 left-3 -translate-y-1/2">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants} className="relative">
            <div className="absolute top-1/2 left-3 -translate-y-1/2">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300"
              required
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {passwordVisible ? <EyeOff /> : <Eye />}
            </button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                className="h-4 w-4 rounded bg-transparent border-gray-400 text-indigo-500 focus:ring-indigo-500"
              />
              <label htmlFor="remember-me" className="ml-2 text-gray-300">
                Remember me
              </label>
            </div>
            <a
              href="#"
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              Forgot Password?
            </a>
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg text-white font-bold text-lg shadow-lg transition-all duration-300"
            >
              Sign In
            </motion.button>
          </motion.div>
        </form>

        {/* --- UI ENHANCEMENT: Added social login options --- */}
        <motion.div variants={itemVariants}>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-800/50 px-2 text-gray-400 rounded-full backdrop-blur-sm">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-lg text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-lg text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              GitHub
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
