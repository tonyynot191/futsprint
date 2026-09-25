import React from 'react';
import { Sparkles, User } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  onOpenAssistant, 
  onOpenAuth, 
  isAuthenticated, 
  user 
}) {
  return (
    <header className="sticky top-0 z-40 bg-indigo-950 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('services')}>
          <div className="bg-amber-400 text-indigo-950 p-2 rounded-xl font-black text-lg">
            FP
          </div>
          <div>
            <h1 className="text-base font-black tracking-wide text-white">FUTSPRINT</h1>
            <p className="text-[10px] text-indigo-200">FUT Minna Digital Print Hub</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-indigo-900/60 p-1 rounded-2xl border border-indigo-800">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'services'
                ? 'bg-amber-400 text-indigo-950 shadow-sm'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            Order Services
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'dashboard'
                ? 'bg-amber-400 text-indigo-950 shadow-sm'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            Student Dashboard
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 bg-amber-400 text-indigo-950 px-3.5 py-1.5 rounded-xl text-xs font-black hover:bg-amber-300 transition"
          >
            <Sparkles size={14} /> Guided Assistant
          </button>

          {isAuthenticated ? (
            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                activeTab === 'account'
                  ? 'bg-amber-400 text-indigo-950 border-amber-400'
                  : 'bg-indigo-900/80 text-white border-indigo-700 hover:bg-indigo-800'
              }`}
            >
              <User size={14} /> {user?.name || 'Account'}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-indigo-900 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold border border-indigo-700 hover:bg-indigo-800 transition"
            >
              <User size={14} /> Student Portal
            </button>
          )}
        </div>

      </div>
    </header>
  );
}