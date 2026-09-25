// src/App.jsx
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/common/Header';
import GuidedAssistantModal from './components/assistant/GuidedAssistantModal';
import PrintingForm from './components/services/PrintingForm.jsx';
import PhotocopyForm from './components/services/PhotocopyForm.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import AccountSettings from './components/account/AccountSettings.jsx';
import AuthModal from './components/auth/AuthModal.jsx';

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

function AppShell() {
  const { user, profile, loading, isAuthenticated, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState('services');
  const [selectedService, setSelectedService] = useState('printing');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [flashMsg, setFlashMsg] = useState('');

  const uiUser = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Student',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || '',
    campus: profile?.campus || 'GK Campus (Minna)',
    matricNumber: profile?.matric_number || '',
    department: profile?.department || '',
    role: profile?.role || 'student',
  };

  const handleSelectServiceFromAssistant = (serviceKey) => {
    setActiveTab('services');
    setSelectedService(serviceKey);
  };

  const handleOrderPlaced = (order) => {
    setFlashMsg(`Order ${order.order_number} placed successfully.`);
    setActiveTab('dashboard');
    setTimeout(() => setFlashMsg(''), 5000);
  };

  const handleLogout = async () => {
    await signOut();
    setActiveTab('services');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-950 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Loading FUTSPrint…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        isAuthenticated={isAuthenticated}
        user={uiUser}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {flashMsg && (
          <div className="max-w-3xl mx-auto mb-4 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
            {flashMsg}
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <div className="max-w-3xl mx-auto mb-6 flex space-x-1 sm:space-x-2 p-1 bg-slate-200/60 rounded-2xl">
              <button
                onClick={() => setSelectedService('printing')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition truncate ${
                  selectedService === 'printing'
                    ? 'bg-white text-indigo-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Digital Printing
              </button>
              <button
                onClick={() => setSelectedService('photocopy')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition truncate ${
                  selectedService === 'photocopy'
                    ? 'bg-white text-indigo-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Photocopy
              </button>
            </div>

            {selectedService === 'printing' && (
              <PrintingForm
                onOrderPlaced={handleOrderPlaced}
                onRequireAuth={() => setIsAuthOpen(true)}
              />
            )}
            {selectedService === 'photocopy' && (
              <PhotocopyForm
                onOrderPlaced={handleOrderPlaced}
                onRequireAuth={() => setIsAuthOpen(true)}
              />
            )}
          </div>
        )}

        {activeTab === 'dashboard' && (
          isAuthenticated ? (
            <Dashboard user={uiUser} />
          ) : (
            <div className="max-w-md mx-auto text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-800 mb-2">Sign in Required</h2>
              <p className="text-xs text-slate-500 mb-6">
                Please log in to your student account to view active print jobs.
              </p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-6 py-2.5 bg-indigo-950 text-white rounded-xl text-xs font-bold hover:bg-indigo-900 transition"
              >
                Sign In / Register
              </button>
            </div>
          )
        )}

        {activeTab === 'account' && (
          isAuthenticated ? (
            <AccountSettings onLogout={handleLogout} />
          ) : (
            <div className="max-w-md mx-auto text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-800 mb-2">Sign in Required</h2>
              <p className="text-xs text-slate-500 mb-6">
                Log in to manage your campus preferences and profile details.
              </p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-6 py-2.5 bg-indigo-950 text-white rounded-xl text-xs font-bold hover:bg-indigo-900 transition"
              >
                Sign In / Register
              </button>
            </div>
          )
        )}
      </main>

      <GuidedAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onSelectService={handleSelectServiceFromAssistant}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}