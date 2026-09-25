import React, { useState } from 'react';
import { Upload, FileText, Calculator } from 'lucide-react';

export default function PrintingForm() {
  const [file, setFile] = useState(null);
  const [paperSize, setPaperSize] = useState('A4');
  const [printType, setPrintType] = useState('bw');
  const [sides, setSides] = useState('single');
  const [copies, setCopies] = useState(1);
  const [totalPages] = useState(10);

  const baseRate = printType === 'color' ? 100 : 30;
  const sideMultiplier = sides === 'double' ? 1.8 : 1;
  const estimatedCost = Math.round(totalPages * baseRate * sideMultiplier * copies);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
      <div className="mb-6 pb-4 border-b border-slate-100">
        <h2 className="text-xl font-extrabold text-slate-800">Document Printing Service</h2>
        <p className="text-xs text-slate-500 mt-1">Upload your digital files (PDF, DOCX) for instant printing and delivery.</p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Upload Document
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-500 transition cursor-pointer bg-slate-50/50 relative">
            <input 
              type="file" 
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {file ? (
              <div className="flex items-center justify-center space-x-3 text-indigo-900 font-bold text-sm">
                <FileText size={24} className="text-amber-500" />
                <span>{file.name}</span>
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-900 rounded-xl flex items-center justify-center mx-auto">
                  <Upload size={20} />
                </div>
                <p className="text-xs font-bold text-slate-700">Click or drop your document here</p>
                <p className="text-[10px] text-slate-400">Supports PDF, DOCX up to 50MB</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Paper Size</label>
            <div className="grid grid-cols-2 gap-2">
              {['A4', 'A3'].map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => setPaperSize(size)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                    paperSize === size
                      ? 'bg-indigo-950 text-white border-indigo-950'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Print Color</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'bw', label: 'Black & White' },
                { id: 'color', label: 'Full Color' }
              ].map((mode) => (
                <button
                  type="button"
                  key={mode.id}
                  onClick={() => setPrintType(mode.id)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                    printType === mode.id
                      ? 'bg-indigo-950 text-white border-indigo-950'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Sides</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'single', label: 'Single Sided' },
                { id: 'double', label: 'Double Sided' }
              ].map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSides(s.id)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                    sides === s.id
                      ? 'bg-indigo-950 text-white border-indigo-950'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Number of Copies</label>
            <input 
              type="number"
              min="1"
              value={copies}
              onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-900"
            />
          </div>
        </div>

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
            disabled={!file}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition shadow-md ${
              file
                ? 'bg-amber-400 hover:bg-amber-300 text-indigo-950 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Place Print Order
          </button>
        </div>
      </form>
    </div>
  );
}