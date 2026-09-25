// src/components/common/Header.jsx
import React from 'react';
import { Sparkles, User } from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  onOpenAssistant,
  onOpenAuth,
  isAuthenticated,
  user,
}) {
  const navButton = (tab, label) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 px-3 sm:px-4 py-1.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
        activeTab === tab
          ? 'bg-amber-400 text-indigo-950 shadow-sm'
          : 'text-indigo-200 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="sticky top-0 z-40 bg-indigo-950 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
        {/* Top row: logo + actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer shrink-0"
            onClick={() => setActiveTab('services')}
          >
            <div className="bg-amber-400 text-indigo-950 p-1.5 sm:p-2 rounded-xl font-black text-sm sm:text-lg">
              FP
            </div>
            <div className="hidden xs:block sm:block">
              <h1 className="text-sm sm:text-base font-black tracking-wide text-white">
                FUTSPRINT
              </h1>
              <p className="hidden sm:block text-[10px] text-indigo-200">
                FUT Minna Digital Print Hub
              </p>
            </div>
          </div>

          {/* Nav tabs — desktop only, inline */}
          <div className="hidden md:flex items-center space-x-1 bg-indigo-900/60 p-1 rounded-2xl border border-indigo-800">
            {navButton('services', 'Order Services')}
            {navButton('dashboard', 'Student Dashboard')}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onOpenAssistant}
              className="flex items-center gap-1.5 bg-amber-400 text-indigo-950 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-black hover:bg-amber-300 transition"
              aria-label="Guided Assistant"
            >
              <Sparkles size={14} />
              <span className="hidden lg:inline">Guided Assistant</span>
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition border max-w-[140px] sm:max-w-none ${
                  activeTab === 'account'
                    ? 'bg-amber-400 text-indigo-950 border-amber-400'
                    : 'bg-indigo-900/80 text-white border-indigo-700 hover:bg-indigo-800'
                }`}
              >
                <User size={14} />
                <span className="truncate">{user?.name || 'Account'}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 bg-indigo-900 text-white px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold border border-indigo-700 hover:bg-indigo-800 transition"
              >
                <User size={14} />
                <span className="hidden sm:inline">Student Portal</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Nav tabs — mobile only, second row */}
        <div className="md:hidden mt-2.5 flex items-center space-x-1 bg-indigo-900/60 p-1 rounded-2xl border border-indigo-800">
          {navButton('services', 'Order Services')}
          {navButton('dashboard', 'Student Dashboard')}
        </div>
      </div>
    </header>
  );
}