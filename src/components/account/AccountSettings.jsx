// src/components/account/AccountSettings.jsx
import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Bell, LogOut, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AccountSettings({ onLogout }) {
  const { profile, user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || '',
    campus: profile?.campus || 'GK Campus (Minna)',
    matric_number: profile?.matric_number || '',
    department: profile?.department || '',
  });

  const [notifications, setNotifications] = useState({
    sms: true,
    emailAlerts: true,
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);
    try {
      await updateProfile({
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        campus: formData.campus,
        matric_number: formData.matric_number.trim(),
        department: formData.department.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black">Account Settings</h2>
          <p className="text-xs text-indigo-200 mt-1">
            Manage your student profile, campus pickup location, and notifications.
          </p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold px-3.5 py-2 rounded-xl border border-rose-500/30 transition"
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {errorMsg && (
          <div className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
            {errorMsg}
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <User size={14} /> Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-xs font-semibold cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Matric Number
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.matric_number}
                  onChange={(e) => setFormData({ ...formData, matric_number: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Default Campus Hub
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <select
                  value={formData.campus}
                  onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-900 appearance-none text-slate-800"
                >
                  <option value="GK Campus (Minna)">GK Campus (Minna)</option>
                  <option value="Bosso Campus (Minna)">Bosso Campus (Minna)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Bell size={14} /> Print Status Alerts
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800">SMS Notifications</p>
                <p className="text-[10px] text-slate-500">Receive an SMS when your print or drop-off job is ready for pickup.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.sms}
                onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                className="w-4 h-4 accent-indigo-950 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800">Email Receipt & Status Updates</p>
                <p className="text-[10px] text-slate-500">Get order confirmation details sent to your registered email.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailAlerts}
                onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                className="w-4 h-4 accent-indigo-950 rounded"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check size={16} /> Changes saved successfully!
            </span>
          ) : (
            <span className="text-xs text-slate-400">All information is kept securely within FUTSPrint.</span>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-950 text-white rounded-xl text-xs font-bold hover:bg-indigo-900 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}