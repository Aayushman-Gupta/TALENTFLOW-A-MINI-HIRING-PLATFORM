import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// --- ICONS (Added for the password toggle) ---
const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
    />
  </svg>
);

// SVG image for lock icon.
const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

// SVG image for eye open icon.
const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

// SVG image for eye close icon.
const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 .847 0 1.67.129 2.457.375M17.5 15.5c.9-.9 1.5-2.1 1.5-3.5 0-2.8-2.2-5-5-5M2 2l20 20"
    />
  </svg>
);

export default function LoginPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  //Using a background image which is stored under my public folder.
  const backgroundImageUrl = "/office-background.png";

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center font-sans"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      {/* Form Container with Frosted Glass Effect */}
      <div className="w-full max-w-md p-8 space-y-8 bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="text-center">
          {/* CHANGE: Darkened header text for better contrast */}
          <h1 className="text-4xl font-bold text-gray-800 tracking-wider">
            Welcome
          </h1>
          <p className="text-gray-700 mt-2">Sign in to the HR Portal</p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleLogin}>
          {/* Email Input */}
          <div className="relative">
            <div className="absolute top-3 left-3">
              <MailIcon />
            </div>
            {/* CHANGE: Lightened input fields */}
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-40 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute top-3 left-3">
              <LockIcon />
            </div>
            {/* CHANGE: Lightened input fields */}
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-40 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
              required
            />
            {/* CHANGE: Replaced text with Eye icons */}
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                className="h-4 w-4 rounded bg-transparent border-gray-400 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="remember-me" className="ml-2 text-gray-800">
                Remember me
              </label>
            </div>
            <a
              href="#"
              className="font-medium text-indigo-600 hover:text-indigo-800"
            >
              Forgot Password?
            </a>
          </div>

          {/* Sign In Button */}
          <div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-bold text-lg shadow-lg transition duration-300 transform hover:scale-105"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}