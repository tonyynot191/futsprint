import React, { useState } from 'react';
import { BookOpen, MapPin, Clock, Calculator, ShieldCheck } from 'lucide-react';

export default function PhotocopyForm() {
  const [documentType, setDocumentType] = useState('book'); // 'book' or 'loose'
  const [estimatedPages, setEstimatedPages] = useState(50);
  const [bindingType, setBindingType] = useState('staple'); // 'staple', 'spiral', 'hardcover'
  const [copies, setCopies] = useState(1);
  const [dropoffLocation, setDropoffLocation] = useState('GK Campus Hub');

  // Pricing calculation logic (in NGN)
  const pageRate = 25;
  const bindingCosts = {
    staple: 100,
    spiral: 500,
    hardcover: 1500
  };

  const estimatedCost = (estimatedPages * pageRate + bindingCosts[bindingType]) * copies;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
      <div className="mb-6 pb-4 border-b border-slate-100">
        <h2 className="text-xl font-extrabold text-slate-800">Book Drop-Off & Photocopy Service</h2>
        <p className="text-xs text-slate-500 mt-1">
          Bring your physical textbooks, note pads, or past questions for high-speed duplicating and binding.
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        
        {/* Physical Material Type */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Item Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'book', label: 'Bound Textbook / Notebook', desc: 'Requires manual page turning' },
              { id: 'loose', label: 'Loose Sheets / Past Questions', desc: 'High-speed auto feeder' }
            ].map((type) => (
              <div
                key={type.id}
                onClick={() => setDocumentType(type.id)}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer ${
                  documentType === type.id
                    ? 'border-indigo-950 bg-indigo-50/40'
                    : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                }`}
              >
                <p className="text-xs font-bold text-slate-800">{type.label}</p>
                <p className="text-[10px] text-slate-500 mt-1">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Estimated Page Count */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Estimated Page Count
            </label>
            <input 
              type="number"
              min="1"
              value={estimatedPages}
              onChange={(e) => setEstimatedPages(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-900"
            />
          </div>

          {/* Number of Sets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Number of Sets / Copies
            </label>
            <input 
              type="number"
              min="1"
              value={copies}
              onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-900"
            />
          </div>

          {/* Binding Option */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Finishing & Binding
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'staple', label: 'Stapled', price: '+₦100' },
                { id: 'spiral', label: 'Spiral Binding', price: '+₦500' },
                { id: 'hardcover', label: 'Hardcover', price: '+₦1,500' }
              ].map((b) => (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => setBindingType(b.id)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold border flex flex-col items-center justify-center transition ${
                    bindingType === b.id
                      ? 'bg-indigo-950 text-white border-indigo-950'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{b.label}</span>
                  <span className={`text-[10px] mt-0.5 ${bindingType === b.id ? 'text-amber-400' : 'text-slate-400'}`}>
                    {b.price}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Drop-off Point Selection */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Preferred Drop-Off Point
            </label>
            <select
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-900"
            >
              <option value="GK Campus Hub">GK Campus Hub (Shop 10, Ultramodern Market)</option>
              <option value="Bosso Campus Stand">Bosso Campus Student Drop-Off Station</option>
              <option value="Hostel Logistics Pickup">Hostel Dispatch Courier Drop</option>
            </select>
          </div>

        </div>

        {/* Live Summary & Submit */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between mt-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-400 text-indigo-950 rounded-xl">
              <Calculator size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Total</p>
              <p className="text-xl font-extrabold text-amber-400">₦{estimatedCost.toLocaleString()}</p>
            </div>
          </div>

          <button
            type="submit"
            className="bg-amber-400 hover:bg-amber-300 text-indigo-950 font-bold px-6 py-3 rounded-xl text-xs transition shadow-md cursor-pointer"
          >
            Generate Drop-Off Code
          </button>
        </div>

      </form>
    </div>
  );
}