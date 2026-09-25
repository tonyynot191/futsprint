import React, { useState } from 'react';
import { X, Sparkles, FileText, Copy, Edit3, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function GuidedAssistantModal({ isOpen, onClose, onSelectService }) {
  const [selectedGoal, setSelectedGoal] = useState(null);

  if (!isOpen) return null;

  const options = [
    {
      id: 'print',
      title: 'I have a digital file (PDF, Word) to print',
      desc: 'Select paper size, color options, single/double sided, and drop-off or pickup settings.',
      icon: FileText,
      serviceKey: 'printing',
      tag: 'Digital Upload'
    },
    {
      id: 'photocopy',
      title: 'I have a physical document or book to copy',
      desc: 'Arrange physical book drop-off or schedule a logistics pickup on campus.',
      icon: Copy,
      serviceKey: 'photocopy',
      tag: 'Hard Copy / Book'
    },
    {
      id: 'typing',
      title: 'I have handwritten notes or audio to type out',
      desc: 'Submit photos or audio recordings for professional manuscript formatting and typing.',
      icon: Edit3,
      serviceKey: 'typing',
      tag: 'Handwritten / Voice'
    }
  ];

  const handleConfirm = () => {
    if (selectedGoal) {
      onSelectService(selectedGoal.serviceKey);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Guided Assistant</h2>
              <p className="text-xs text-slate-500">What are you looking to achieve today?</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Goal Selector Options */}
        <div className="space-y-3 my-5">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedGoal?.id === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelectedGoal(opt)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-3.5 ${
                  isSelected
                    ? 'border-indigo-900 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className={`p-2.5 rounded-xl mt-0.5 ${
                  isSelected ? 'bg-indigo-900 text-white' : 'bg-white text-slate-600 shadow-sm'
                }`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800">{opt.title}</h3>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-600">
                      {opt.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            disabled={!selectedGoal}
            onClick={handleConfirm}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
              selectedGoal
                ? 'bg-amber-400 hover:bg-amber-300 text-indigo-950 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Proceed to Form</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}