// src/components/auth/AuthModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import SignIn from './SignIn';
import SignUp from './SignUp';

export default function AuthModal({ isOpen, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 md:p-8 shadow-xl border border-slate-100 relative my-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="text-center mb-5 sm:mb-6 pr-8">
            <h2 className="text-xl sm:text-2xl font-black text-indigo-950">
              {isSignUp ? 'Create Student Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isSignUp
                ? 'Sign up to manage your orders & drop-offs easily'
                : 'Sign in to access your print dashboard and order history'}
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl mb-5 sm:mb-6">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                !isSignUp ? 'bg-white text-indigo-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                isSignUp ? 'bg-white text-indigo-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign Up
            </button>
          </div>

          {isSignUp
            ? <SignUp onSuccess={onClose} />
            : <SignIn onSuccess={onClose} />}

          <div className="mt-5 sm:mt-6 text-center text-[11px] text-slate-400">
            By continuing, you agree to FUTSPrint terms of service & privacy policy.
          </div>
        </div>
      </div>
    </div>
  );
}