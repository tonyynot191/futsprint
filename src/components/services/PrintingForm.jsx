// src/components/services/PrintingForm.jsx
import React, { useMemo, useRef, useState } from 'react';
import {
  Upload, FileText, Calculator, X, Loader2, AlertCircle, MapPin, Plus, Store,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import {
  estimatePrintCost,
  MAX_FILE_BYTES,
  MAX_FILES_PER_ORDER,
  ACCEPTED_UPLOAD_EXTENSIONS,
  FRIENDLY_TYPE_LIST,
} from '../../config/pricing';
import { MAIN_CAMPUS, PARTNER_SHOPS } from '../../config/locations';

export default function PrintingForm({ onOrderPlaced, onRequireAuth }) {
  const { isAuthenticated } = useAuth();
  const { createPrintOrder } = useOrders();
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [paperSize, setPaperSize] = useState('A4');
  const [printType, setPrintType] = useState('bw');
  const [sides, setSides] = useState('single');
  const [copies, setCopies] = useState(1);
  const [finishing, setFinishing] = useState('none');
  const [estimatedPages, setEstimatedPages] = useState(10);
  const [notes, setNotes] = useState('');
  const [pickupShop, setPickupShop] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const totalBytes = useMemo(
    () => files.reduce((sum, f) => sum + (f.size || 0), 0),
    [files]
  );

  const estimatedCost = useMemo(
    () => estimatePrintCost({
      paperSize, printType, sides, copies, pages: estimatedPages, finishing,
    }),
    [paperSize, printType, sides, copies, estimatedPages, finishing]
  );

  const addFiles = (incoming) => {
    setErrorMsg('');
    const list = Array.from(incoming || []);
    if (!list.length) return;

    const next = [...files];
    for (const f of list) {
      if (next.length >= MAX_FILES_PER_ORDER) {
        setErrorMsg(`You can upload up to ${MAX_FILES_PER_ORDER} files per order.`);
        break;
      }
      if (f.size > MAX_FILE_BYTES) {
        setErrorMsg(
          `"${f.name}" is too large. Maximum is ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB per file.`
        );
        continue;
      }
      // Dedup by name + size
      const dup = next.some((x) => x.name === f.name && x.size === f.size);
      if (dup) continue;
      next.push(f);
    }
    setFiles(next);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    if (files.length === 0) {
      setErrorMsg('Please attach at least one document.');
      return;
    }
    if (!pickupShop) {
      setErrorMsg('Please choose a pickup shop at Gidan Kwano Campus.');
      return;
    }

    setSubmitting(true);
    try {
      const order = await createPrintOrder({
        files,
        pickupShopId: pickupShop,
        printOptions: {
          paper_size: paperSize,
          colour: printType,
          sides,
          copies,
          estimated_pages: estimatedPages,
          finishing,
          notes: notes.trim() || null,
          estimated_cost: estimatedCost,
          pricing_source: 'placeholder_client_estimate',
        },
      });
      setFiles([]);
      setNotes('');
      setPickupShop('');
      if (onOrderPlaced) onOrderPlaced(order);
    } catch (err) {
      setErrorMsg(err.message || 'Could not place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !submitting && (!isAuthenticated || (files.length > 0 && pickupShop));

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-slate-200">
      <div className="mb-6 pb-4 border-b border-slate-100">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">Document Printing Service</h2>
        <p className="text-xs text-slate-500 mt-1">
          Upload your files, choose your print options, pay on FUTSPrint, and pick up from your chosen shop at Gidan Kwano — no queue.
        </p>
      </div>

      {!isAuthenticated && (
        <div className="mb-4 flex items-start gap-2 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>You need to be signed in to place an order. Click &quot;Place Print Order&quot; to sign in.</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 flex items-start gap-2 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ---------- Files ---------- */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Upload Documents
            </label>
            <span className="text-[10px] font-bold text-slate-400">
              {files.length}/{MAX_FILES_PER_ORDER} files
              {totalBytes > 0 && ` • ${(totalBytes / (1024 * 1024)).toFixed(2)} MB total`}
            </span>
          </div>

          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 sm:p-6 text-center hover:border-indigo-500 transition bg-slate-50/50 relative">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_UPLOAD_EXTENSIONS}
              onChange={(e) => addFiles(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Upload documents"
            />
            <div className="space-y-2 pointer-events-none">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-900 rounded-xl flex items-center justify-center mx-auto">
                <Upload size={20} />
              </div>
              <p className="text-xs font-bold text-slate-700">
                Tap to add files (you can add more than one)
              </p>
              <p className="text-[10px] text-slate-400 leading-relaxed px-2">
                {FRIENDLY_TYPE_LIST}
                <br />
                Up to {MAX_FILES_PER_ORDER} files • {Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB each
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${f.size}-${i}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white"
                >
                  <FileText size={18} className="text-amber-500 shrink-0" />
                  <span className="flex-1 min-w-0 text-xs font-semibold text-slate-800 truncate">
                    {f.name}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {(f.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                    aria-label={`Remove ${f.name}`}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {files.length > 0 && files.length < MAX_FILES_PER_ORDER && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-indigo-900 hover:text-indigo-700"
            >
              <Plus size={12} /> Add another file
            </button>
          )}
        </div>

        {/* ---------- Document info ---------- */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Total Estimated Pages (all files combined)
          </label>
          <input
            type="number"
            min="1"
            value={estimatedPages}
            onChange={(e) => setEstimatedPages(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-900"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            Staff will confirm the exact page count and final price before printing.
          </p>
        </div>

        {/* ---------- Print options ---------- */}
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
                { id: 'bw', label: 'B&W' },
                { id: 'color', label: 'Full Color' },
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
                { id: 'single', label: 'Single' },
                { id: 'double', label: 'Double' },
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Copies</label>
            <input
              type="number"
              min="1"
              value={copies}
              onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Finishing</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'none', label: 'None' },
                { id: 'staple', label: 'Stapled' },
                { id: 'spiral', label: 'Spiral' },
                { id: 'hardcover', label: 'Hardcover' },
              ].map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setFinishing(f.id)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                    finishing === f.id
                      ? 'bg-indigo-950 text-white border-indigo-950'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Special Instructions (optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., print pages 1–20 only, staple top-left, use white paper"
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-900 resize-none"
            />
          </div>
        </div>

        {/* ---------- Pickup location ---------- */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-indigo-900" />
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pickup Location
            </p>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            All pickup shops are at <span className="font-bold text-slate-800">{MAIN_CAMPUS.name}</span>. Choose the shop closest to you.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PARTNER_SHOPS.map((shop) => {
              const selected = pickupShop === shop.id;
              return (
                <button
                  type="button"
                  key={shop.id}
                  onClick={() => setPickupShop(shop.id)}
                  className={`text-left p-4 rounded-2xl border-2 transition ${
                    selected
                      ? 'border-indigo-950 bg-white shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      selected ? 'bg-indigo-950 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Store size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">{shop.name}</p>
                      <p className="text-[11px] font-semibold text-indigo-900 mt-0.5">{shop.market}</p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-snug">{shop.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {pickupShop && (
            <p className="text-[11px] text-slate-500 mt-3">
              After payment, you&apos;ll get a <span className="font-bold text-slate-700">pickup code</span>. Show it at{' '}
              <span className="font-bold text-slate-700">{PARTNER_SHOPS.find((s) => s.id === pickupShop)?.name}</span>{' '}
              to collect your document — no queue.
            </p>
          )}
        </div>

        {/* ---------- Estimate + submit ---------- */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-400 text-indigo-950 rounded-xl">
              <Calculator size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Estimated Total
              </p>
              <p className="text-xl font-extrabold text-amber-400">₦{estimatedCost.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Final price confirmed by staff</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 ${
              !canSubmit
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-300 text-indigo-950 cursor-pointer'
            }`}
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting
              ? 'Placing order…'
              : isAuthenticated
                ? 'Place Print Order'
                : 'Sign in to Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
}