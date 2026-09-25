// src/components/services/PhotocopyForm.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Upload, FileText, Calculator, X, Loader2, AlertCircle, MapPin,
  Plus, Store, Truck, Users, Calendar, ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import {
  estimatePhotocopyCost,
  MAX_FILE_BYTES,
  MAX_FILES_PER_ORDER,
  ACCEPTED_UPLOAD_EXTENSIONS,
  FRIENDLY_TYPE_LIST,
  COURSE_REP_MIN_GAP_DAYS,
  PAGE_ESTIMATE_PRESETS,
  PHOTOCOPY_PRICING,
} from '../../config/pricing';
import { MAIN_CAMPUS, PARTNER_SHOPS, PHYSICAL_ROUTES } from '../../config/locations';

const todayISO = () => new Date().toISOString().split('T')[0];
const addDays = (iso, days) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const ROUTE_ICONS = { users: Users, truck: Truck, store: Store };

export default function PhotocopyForm({ onOrderPlaced, onRequireAuth }) {
  const { isAuthenticated } = useAuth();
  const { createPhotocopyOrder } = useOrders();

  const [mode, setMode] = useState(null); // null | 'digital' | 'physical'
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Shared
  const [copies, setCopies] = useState(1);
  const [notes, setNotes] = useState('');

  // Digital state
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [digitalPages, setDigitalPages] = useState(20);
  const [sides, setSides] = useState('single');
  const [digitalFinishing, setDigitalFinishing] = useState('none');
  const [digitalShop, setDigitalShop] = useState('');

  // Physical state
  const [docDescription, setDocDescription] = useState('');
  const [pageEstimate, setPageEstimate] = useState(null);
  const [route, setRoute] = useState(null);
  const [receiveDate, setReceiveDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffShop, setDropoffShop] = useState('');

  // Keep return date valid whenever receive date changes
  useEffect(() => {
    if (!receiveDate) return;
    const minReturn = addDays(receiveDate, COURSE_REP_MIN_GAP_DAYS);
    if (!returnDate || returnDate < minReturn) setReturnDate(minReturn);
  }, [receiveDate, returnDate]);

  // Cost estimates
  const digitalEstimate = useMemo(
    () => estimatePhotocopyCost({
      estimatedPages: digitalPages, copies, bindingType: digitalFinishing,
    }),
    [digitalPages, copies, digitalFinishing]
  );

  const physicalEstimate = useMemo(() => {
    if (!pageEstimate) return 0;
    return Math.round(PHOTOCOPY_PRICING.perPage * pageEstimate.mid * copies);
  }, [pageEstimate, copies]);

  // File handlers
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
        setErrorMsg(`"${f.name}" is too large. Maximum is ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB per file.`);
        continue;
      }
      if (next.some((x) => x.name === f.name && x.size === f.size)) continue;
      next.push(f);
    }
    setFiles(next);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const removeFile = (i) => setFiles((p) => p.filter((_, idx) => idx !== i));

  const resetAll = () => {
    setFiles([]);
    setDocDescription('');
    setPageEstimate(null);
    setRoute(null);
    setReceiveDate('');
    setReturnDate('');
    setPickupAddress('');
    setDropoffShop('');
    setNotes('');
    setDigitalShop('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    if (mode === 'digital') {
      if (files.length === 0) return setErrorMsg('Please attach at least one document.');
      if (!digitalShop) return setErrorMsg('Please choose a pickup shop.');
      setSubmitting(true);
      try {
        const order = await createPhotocopyOrder({
          mode: 'digital',
          files,
          pickupShopId: digitalShop,
          printOptions: {
            sides,
            copies,
            estimated_pages: digitalPages,
            finishing: digitalFinishing,
            notes: notes.trim() || null,
            estimated_cost: digitalEstimate,
            pricing_source: 'placeholder_client_estimate',
          },
        });
        resetAll();
        if (onOrderPlaced) onOrderPlaced(order);
      } catch (err) {
        setErrorMsg(err.message || 'Could not place order.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (mode === 'physical') {
      if (!docDescription.trim()) return setErrorMsg('Please describe the document.');
      if (!pageEstimate) return setErrorMsg('Please pick a page estimate range.');
      if (!route) return setErrorMsg('Please pick a handoff method.');
      if (route === 'course_rep' && (!receiveDate || !returnDate)) {
        return setErrorMsg('Please pick both receive and return dates.');
      }
      if (route === 'courier' && !pickupAddress.trim()) {
        return setErrorMsg('Please tell us where the courier should pick up.');
      }
      if (route === 'dropoff' && !dropoffShop) {
        return setErrorMsg('Please pick a drop-off shop.');
      }

      setSubmitting(true);
      try {
        const payload = {
          mode: route,
          documentDescription: docDescription,
          pageEstimate,
          copies,
          estimatedCost: physicalEstimate,
        };
        if (route === 'course_rep') {
          payload.scheduledReceiveDate = receiveDate;
          payload.scheduledReturnDate = returnDate;
        } else if (route === 'courier') {
          payload.pickupAddress = pickupAddress;
        } else if (route === 'dropoff') {
          payload.dropoffShopId = dropoffShop;
        }

        const order = await createPhotocopyOrder(payload);
        resetAll();
        if (onOrderPlaced) onOrderPlaced(order);
      } catch (err) {
        setErrorMsg(err.message || 'Could not place order.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (!isAuthenticated) return true;
    if (mode === 'digital') return files.length > 0 && Boolean(digitalShop);
    if (mode === 'physical') {
      if (!docDescription.trim() || !pageEstimate || !route) return false;
      if (route === 'course_rep') return Boolean(receiveDate && returnDate);
      if (route === 'courier') return Boolean(pickupAddress.trim());
      if (route === 'dropoff') return Boolean(dropoffShop);
    }
    return false;
  }, [
    submitting, isAuthenticated, mode, files, digitalShop,
    docDescription, pageEstimate, route, receiveDate, returnDate,
    pickupAddress, dropoffShop,
  ]);

  const estimateShown = mode === 'physical' ? physicalEstimate : digitalEstimate;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-slate-200">
      <div className="mb-6 pb-4 border-b border-slate-100">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">Photocopy</h2>
        <p className="text-xs text-slate-500 mt-1">
          Copy a digital or physical document. Pay on FUTSPrint, skip the queue.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 flex items-start gap-2 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ---- MODE SELECTOR ---- */}
      {mode === null && (
        <div className="space-y-4">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            What do you have?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('digital')}
              className="text-left p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-900 transition"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-900 shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Digital document</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Upload your files. We copy them and you pick up at a partner shop.
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('physical')}
              className="text-left p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-900 transition"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Physical document</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Textbook, notepad, past questions. Give to a rep, courier, or drop off.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ---- FORM ---- */}
      {mode !== null && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <button
            type="button"
            onClick={() => { setMode(null); setErrorMsg(''); setRoute(null); }}
            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-indigo-900 transition"
          >
            <ArrowLeft size={12} /> Change type
          </button>

          {mode === 'digital' && (
            <DigitalFields
              files={files} addFiles={addFiles} removeFile={removeFile} fileInputRef={fileInputRef}
              digitalPages={digitalPages} setDigitalPages={setDigitalPages}
              sides={sides} setSides={setSides}
              copies={copies} setCopies={setCopies}
              digitalFinishing={digitalFinishing} setDigitalFinishing={setDigitalFinishing}
              digitalShop={digitalShop} setDigitalShop={setDigitalShop}
              notes={notes} setNotes={setNotes}
            />
          )}

          {mode === 'physical' && (
            <PhysicalFields
              docDescription={docDescription} setDocDescription={setDocDescription}
              pageEstimate={pageEstimate} setPageEstimate={setPageEstimate}
              copies={copies} setCopies={setCopies}
              route={route} setRoute={setRoute}
              receiveDate={receiveDate} setReceiveDate={setReceiveDate}
              returnDate={returnDate} setReturnDate={setReturnDate}
              pickupAddress={pickupAddress} setPickupAddress={setPickupAddress}
              dropoffShop={dropoffShop} setDropoffShop={setDropoffShop}
              notes={notes} setNotes={setNotes}
            />
          )}

          {/* Estimate + submit */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-400 text-indigo-950 rounded-xl">
                <Calculator size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {mode === 'physical' ? 'Estimated Deposit' : 'Estimated Total'}
                </p>
                <p className="text-xl font-extrabold text-amber-400">
                  ₦{estimateShown.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {mode === 'physical'
                    ? 'Final price confirmed after staff count the pages'
                    : 'Final price confirmed by staff'}
                </p>
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
                : !isAuthenticated
                  ? 'Sign in to Place Order'
                  : mode === 'physical'
                    ? 'Submit Request & Pay Deposit'
                    : 'Place Photocopy Order'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ============================================================
   DIGITAL FIELDS
   ============================================================ */
function DigitalFields({
  files, addFiles, removeFile, fileInputRef,
  digitalPages, setDigitalPages,
  sides, setSides, copies, setCopies,
  digitalFinishing, setDigitalFinishing,
  digitalShop, setDigitalShop,
  notes, setNotes,
}) {
  const totalBytes = files.reduce((s, f) => s + (f.size || 0), 0);

  return (
    <>
      {/* Files */}
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
              <li key={`${f.name}-${f.size}-${i}`} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white">
                <FileText size={18} className="text-amber-500 shrink-0" />
                <span className="flex-1 min-w-0 text-xs font-semibold text-slate-800 truncate">{f.name}</span>
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

      {/* Page count */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Total Estimated Pages (all files combined)
        </label>
        <input
          type="number"
          min="1"
          value={digitalPages}
          onChange={(e) => setDigitalPages(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-900"
        />
        <p className="text-[10px] text-slate-400 mt-1">
          Staff will confirm the exact page count and final price before copying.
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Sides</label>
          <div className="grid grid-cols-2 gap-2">
            {[{ id: 'single', label: 'Single' }, { id: 'double', label: 'Double' }].map((s) => (
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
                onClick={() => setDigitalFinishing(f.id)}
                className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                  digitalFinishing === f.id
                    ? 'bg-indigo-950 text-white border-indigo-950'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pickup shop */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={16} className="text-indigo-900" />
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pickup Location</p>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          All pickup shops are at <span className="font-bold text-slate-800">{MAIN_CAMPUS.name}</span>. Choose the shop closest to you.
        </p>
        <ShopPicker selected={digitalShop} onSelect={setDigitalShop} />
        {digitalShop && (
          <p className="text-[11px] text-slate-500 mt-3">
            After payment, you&apos;ll get a <span className="font-bold text-slate-700">pickup code</span>. Show it at{' '}
            <span className="font-bold text-slate-700">{PARTNER_SHOPS.find((s) => s.id === digitalShop)?.name}</span> to
            collect your document — no queue.
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Special Instructions (optional)
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., copy chapters 1–3 only, add a cover page"
          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-900 resize-none"
        />
      </div>
    </>
  );
}

/* ============================================================
   PHYSICAL FIELDS
   ============================================================ */
function PhysicalFields({
  docDescription, setDocDescription,
  pageEstimate, setPageEstimate,
  copies, setCopies,
  route, setRoute,
  receiveDate, setReceiveDate,
  returnDate, setReturnDate,
  pickupAddress, setPickupAddress,
  dropoffShop, setDropoffShop,
  notes, setNotes,
}) {
  const minReturnDate = receiveDate ? addDays(receiveDate, COURSE_REP_MIN_GAP_DAYS) : todayISO();

  return (
    <>
      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Describe the document
        </label>
        <textarea
          rows={2}
          required
          value={docDescription}
          onChange={(e) => setDocDescription(e.target.value)}
          placeholder="e.g. PHY101 textbook, hardcover, ~450 pages"
          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-900 resize-none"
        />
      </div>

      {/* Page estimate */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          How many pages (roughly)?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PAGE_ESTIMATE_PRESETS.map((p) => {
            const selected = pageEstimate?.id === p.id;
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => setPageEstimate(p)}
                className={`py-3 px-2 rounded-xl text-[11px] font-bold border transition ${
                  selected
                    ? 'bg-indigo-950 text-white border-indigo-950'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 mt-2">
          Staff will count the actual pages and confirm the final price before copying.
        </p>
      </div>

      {/* Copies */}
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

      {/* Route selection */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          How should we handle it?
        </label>
        <div className="space-y-3">
          {PHYSICAL_ROUTES.map((r) => {
            const Icon = ROUTE_ICONS[r.icon] || Users;
            const selected = route === r.id;
            return (
              <button
                type="button"
                key={r.id}
                onClick={() => setRoute(r.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition ${
                  selected
                    ? 'border-indigo-950 bg-indigo-50/40 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    selected ? 'bg-indigo-950 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="text-sm font-bold text-slate-800">{r.name}</p>
                      {r.tagline && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {r.tagline}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{r.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Route-specific fields */}
      {route === 'course_rep' && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-indigo-900" />
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Schedule</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Rep receives work
              </label>
              <input
                type="date"
                value={receiveDate}
                min={todayISO()}
                onChange={(e) => setReceiveDate(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Rep returns work
              </label>
              <input
                type="date"
                value={returnDate}
                min={minReturnDate}
                disabled={!receiveDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900 disabled:opacity-60"
              />
            </div>
          </div>

          {receiveDate && returnDate && (
            <p className="text-[11px] text-slate-500">
              Minimum gap of {COURSE_REP_MIN_GAP_DAYS} days is enforced so your rep has time to process the work.
            </p>
          )}
        </div>
      )}

      {route === 'courier' && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Truck size={16} className="text-indigo-900" />
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Courier Pickup</p>
          </div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Where should the courier pick up?
          </label>
          <input
            type="text"
            required
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            placeholder="e.g. Hostel B, Room 214, Block 3 — or in front of ETF Hall"
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900"
          />
          <p className="text-[10px] text-slate-400 mt-2">
            Include hostel name, block, and room number if possible. The worker will contact you by phone.
          </p>
        </div>
      )}

      {route === 'dropoff' && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-indigo-900" />
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Drop-off Shop</p>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            All shops are at <span className="font-bold text-slate-800">{MAIN_CAMPUS.name}</span>. Drop in with your code and skip the queue.
          </p>
          <ShopPicker selected={dropoffShop} onSelect={setDropoffShop} />
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Special Instructions (optional)
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. don't damage the spine, copy in black and white only"
          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-900 resize-none"
        />
      </div>
    </>
  );
}

/* ============================================================
   SHOP PICKER
   ============================================================ */
function ShopPicker({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {PARTNER_SHOPS.map((shop) => {
        const isSelected = selected === shop.id;
        return (
          <button
            type="button"
            key={shop.id}
            onClick={() => onSelect(shop.id)}
            className={`text-left p-4 rounded-2xl border-2 transition ${
              isSelected
                ? 'border-indigo-950 bg-white shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${
                isSelected ? 'bg-indigo-950 text-white' : 'bg-slate-100 text-slate-600'
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
  );
}