// src/components/auth/SignUp.jsx
import React, { useState } from 'react';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Best-effort suggestions — students can type anything.
const DEPARTMENT_SUGGESTIONS = [
  'Computer Science',
  'Cyber Security',
  'Information Technology',
  'Software Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Agricultural Engineering',
  'Biochemistry',
  'Microbiology',
  'Biology',
  'Chemistry',
  'Physics',
  'Mathematics',
  'Statistics',
  'Architecture',
  'Quantity Surveying',
  'Urban and Regional Planning',
  'Agricultural Economics',
  'Business Administration',
  'Entrepreneurship',
  'Science and Technology Education',
];

const CAMPUS_OPTIONS = [
  'GK Campus (Minna)',
  'Bosso Campus (Minna)',
];

export default function SignUp({ onSuccess }) {
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    matricNumber: '',
    department: '',
    email: '',
    phone: '',
    campus: CAMPUS_OPTIONS[0],
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
    const [infoMsg, setInfoMsg] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (form.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

        setSubmitting(true);
    setInfoMsg('');
    try {
      const result = await signUp({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        matricNumber: form.matricNumber,
        department: form.department,
        phone: form.phone,
        campus: form.campus,
      });
      if (result.needsEmailConfirmation) {
        setInfoMsg(
          'Account created. Check your email to confirm it before signing in. ' +
          '(If you meant to skip this, ask the admin to turn off "Confirm email" in Supabase.)'
        );
        return;
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Sign up failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
          {errorMsg}
        </div>
      )}
            {infoMsg && (
        <div className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          {infoMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Full Name
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              required
              placeholder="e.g., Victoria Adeyemi"
              value={form.fullName}
              onChange={set('fullName')}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-900"
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
              placeholder="e.g., 2021/1/12345CT"
              value={form.matricNumber}
              onChange={set('matricNumber')}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-900"
            />
          </div>
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
            list="department-suggestions"
            placeholder="Start typing your department"
            value={form.department}
            onChange={set('department')}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-900"
          />
          <datalist id="department-suggestions">
            {DEPARTMENT_SUGGESTIONS.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
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
            value={form.email}
            onChange={set('email')}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              value={form.phone}
              onChange={set('phone')}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Preferred Campus
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <select
              value={form.campus}
              onChange={set('campus')}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-900 appearance-none text-slate-800"
            >
              {CAMPUS_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
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
            minLength={6}
            placeholder="At least 6 characters"
            value={form.password}
            onChange={set('password')}
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
        disabled={submitting}
        className="w-full py-3 bg-indigo-950 text-white rounded-xl text-xs font-extrabold hover:bg-indigo-900 transition shadow-md mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  );
}