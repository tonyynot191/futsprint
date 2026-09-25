import React, { useState } from 'react';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff } from 'lucide-react';

export default function SignUp({ onLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [campus, setCampus] = useState('GK Campus (Minna)');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({
      name: fullName,
      email,
      phone,
      campus,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
          Full Name
        </label>
        <div className="relative">
          <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            required
            placeholder="e.g., Victoria"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
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
            required
            placeholder="student@futminna.edu.ng"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            placeholder="09045656852"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
          Preferred Campus Hub
        </label>
        <div className="relative">
          <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <select
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-900 appearance-none text-slate-800"
          >
            <option value="GK Campus (Minna)">GK Campus (Minna)</option>
            <option value="Bosso Campus (Minna)">Bosso Campus (Minna)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
          Password
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-900"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-indigo-950 text-white rounded-xl text-xs font-extrabold hover:bg-indigo-900 transition shadow-md mt-2"
      >
        Create Account
      </button>
    </form>
  );
}