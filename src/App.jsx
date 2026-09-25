import React, { useState } from 'react';
import Header from './components/common/Header';
import GuidedAssistantModal from './components/assistant/GuidedAssistantModal';
import PrintingForm from './components/services/PrintingForm.jsx';
import PhotocopyForm from './components/services/PhotocopyForm.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import AccountSettings from './components/account/AccountSettings.jsx';
import AuthModal from './components/auth/AuthModal.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [selectedService, setSelectedService] = useState('printing');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState({
    name: 'Victoria',
    email: 'victoriaab0991@gmail.com',
    phone: '09045656852',
    campus: 'GK Campus (Minna)'
  });

  // Centralized Orders State
  const [orders, setOrders] = useState([
    {
      id: 'FUT-8921',
      service: 'Digital Printing',
      details: 'GST111 Lecture Notes (15 Pages, B&W, Spiral)',
      status: 'Ready for Pickup',
      location: 'GK Campus Hub (Shop 10)',
      cost: '₦950',
      date: 'Today, 8:30 AM',
      active: true,
    },
    {
      id: 'FUT-8804',
      service: 'Book Drop-Off & Copy',
      details: 'PHY101 Textbook (200 Pages, Hardcover Binding)',
      status: 'Processing',
      location: 'Bosso Campus Stand',
      cost: '₦6,500',
      date: 'Yesterday, 2:15 PM',
      active: true,
    }
  ]);

  const handleCreateOrder = (newOrderData) => {
    const newOrder = {
      id: `FUT-${Math.floor(1000 + Math.random() * 9000)}`,
      service: newOrderData.service || 'Digital Printing',
      details: newOrderData.details || 'Document Print Job',
      status: 'Processing',
      location: user?.campus || 'GK Campus Hub',
      cost: newOrderData.cost || '₦300',
      date: 'Just now',
      active: true,
    };

    setOrders([newOrder, ...orders]);
    setActiveTab('dashboard');
  };

  const handleSelectServiceFromAssistant = (serviceKey) => {
    setActiveTab('services');
    setSelectedService(serviceKey);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('services');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        isAuthenticated={isAuthenticated}
        user={user}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'services' && (
          <div>
            <div className="max-w-3xl mx-auto mb-6 flex space-x-2 p-1 bg-slate-200/60 rounded-2xl">
              <button
                onClick={() => setSelectedService('printing')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  selectedService === 'printing'
                    ? 'bg-white text-indigo-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Digital Printing
              </button>
              <button
                onClick={() => setSelectedService('photocopy')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  selectedService === 'photocopy'
                    ? 'bg-white text-indigo-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Book Drop-Off & Copy
              </button>
            </div>

            {selectedService === 'printing' && (
              <PrintingForm onSubmitOrder={handleCreateOrder} />
            )}
            {selectedService === 'photocopy' && (
              <PhotocopyForm onSubmitOrder={handleCreateOrder} />
            )}
          </div>
        )}

        {activeTab === 'dashboard' && (
          isAuthenticated ? (
            <Dashboard user={user} orders={orders} />
          ) : (
            <div className="max-w-md mx-auto text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-800 mb-2">Sign in Required</h2>
              <p className="text-xs text-slate-500 mb-6">Please log in to your student account to view active print jobs.</p>
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
            <AccountSettings user={user} setUser={setUser} onLogout={handleLogout} />
          ) : (
            <div className="max-w-md mx-auto text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-800 mb-2">Sign in Required</h2>
              <p className="text-xs text-slate-500 mb-6">Log in to manage your campus preferences and profile details.</p>
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
        onLogin={handleLogin}
      />
    </div>
  );
}