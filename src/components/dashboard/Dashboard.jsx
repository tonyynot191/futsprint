// src/components/dashboard/Dashboard.jsx
import React from 'react';
import { Loader2, Truck, Users, Store, Package } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { getRouteById, getShopById } from '../../config/locations';

const STATUS_LABEL = {
  pending_payment: 'Awaiting Payment',
  paid: 'Paid',
  processing: 'Processing',
  ready: 'Ready for Pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_STYLE = {
  pending_payment: 'bg-amber-100 text-amber-800',
  paid: 'bg-sky-100 text-sky-800',
  processing: 'bg-amber-100 text-amber-800',
  ready: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-slate-200 text-slate-700',
  cancelled: 'bg-rose-100 text-rose-800',
};

const SERVICE_LABEL = {
  print: 'Print',
  photocopy: 'Photocopy',
  typing: 'Typing',
  edit: 'Editing',
  design: 'Design & Large Format',
  custom: 'Custom Request',
};

const ROUTE_ICONS = { course_rep: Users, courier: Truck, dropoff: Store };

function summarize(order) {
  const d = order.details || {};
  if (order.service_type === 'print') {
    const bits = [];
    if (d.paper_size) bits.push(d.paper_size);
    if (d.colour) bits.push(d.colour === 'color' ? 'Colour' : 'B&W');
    if (d.sides) bits.push(d.sides === 'double' ? 'Double-sided' : 'Single-sided');
    if (d.copies) bits.push(`${d.copies}×`);
    const fileCount = d.file_count || (order.order_files?.length ?? 0);
    const fileLabel =
      fileCount > 1 ? `${fileCount} files` : d.file_names?.[0] || d.file_name || 'Print job';
    const suffix = bits.length ? ` (${bits.join(', ')})` : '';
    return fileLabel + suffix;
  }

  if (order.service_type === 'photocopy') {
    // Physical
    if (order.document_description) {
      const bits = [];
      if (d.page_range_label) bits.push(d.page_range_label);
      if (d.copies) bits.push(`${d.copies}×`);
      return order.document_description + (bits.length ? ` (${bits.join(', ')})` : '');
    }
    // Digital
    const bits = [];
    if (d.sides) bits.push(d.sides === 'double' ? 'Double-sided' : 'Single-sided');
    if (d.copies) bits.push(`${d.copies}×`);
    const fileCount = d.file_count || (order.order_files?.length ?? 0);
    const fileLabel =
      fileCount > 1 ? `${fileCount} files` : d.file_names?.[0] || 'Digital document';
    const suffix = bits.length ? ` (${bits.join(', ')})` : '';
    return fileLabel + suffix;
  }

  return SERVICE_LABEL[order.service_type] || 'Order';
}

function formatMoney(v) {
  if (v === null || v === undefined) return '—';
  const n = typeof v === 'string' ? Number(v) : v;
  if (Number.isNaN(n)) return '—';
  return `₦${n.toLocaleString()}`;
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function formatDayOnly(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function Dashboard({ user }) {
  const { orders, loading, error } = useOrders();

  const active = orders.filter(
    (o) => o.status !== 'completed' && o.status !== 'cancelled'
  );
  const past = orders.filter(
    (o) => o.status === 'completed' || o.status === 'cancelled'
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-indigo-950 text-white rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold">
            Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h2>
          <p className="text-xs text-indigo-200 mt-1">
            Track your print jobs, drop-offs, and pickup points live.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center">
          <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Active Orders</p>
          <p className="text-lg font-black">
            {active.length} {active.length === 1 ? 'Job' : 'Jobs'}
          </p>
        </div>
      </div>

      {error && (
        <div className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">
          Could not load orders: {error}
        </div>
      )}

      <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
          Active Orders
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : active.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No active orders right now. Head to <span className="font-bold">Order Services</span> to start one.
          </p>
        ) : (
          <div className="space-y-3">
            {active.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
            Past Orders
          </h3>
          <div className="space-y-3">
            {past.map((order) => (
              <OrderRow key={order.id} order={order} muted />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function OrderRow({ order, muted = false }) {
  const cost = order.paid_amount ?? order.quoted_price ?? order.details?.estimated_cost;
  const isPhysical = order.service_type === 'photocopy' && Boolean(order.document_description);
  const isDigitalPickup = !isPhysical && Boolean(order.pickup_code);
  const route = isPhysical ? getRouteById(order.details?.route) : null;
  const RouteIcon = route ? ROUTE_ICONS[route.id] : null;
  const shop = order.pickup_shop ? getShopById(order.pickup_shop) : null;

  return (
    <div className={`p-4 rounded-2xl border flex flex-col gap-4 ${
      muted ? 'border-slate-100 bg-white' : 'border-slate-100 bg-slate-50/60'
    }`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black text-indigo-950 bg-indigo-100 px-2.5 py-0.5 rounded-md">
              {order.order_number}
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
              STATUS_STYLE[order.status] || 'bg-slate-200 text-slate-700'
            }`}>
              {STATUS_LABEL[order.status] || order.status}
            </span>
            {route && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 flex items-center gap-1">
                {RouteIcon && <RouteIcon size={10} />}
                {route.name}
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-slate-800 truncate">
            {SERVICE_LABEL[order.service_type]} — {summarize(order)}
          </p>
          <p className="text-[10px] text-slate-500">
            {order.pickup_location
              ? `${order.pickup_location} • `
              : order.dropoff_location
                ? `${order.dropoff_location} • `
                : ''}
            {formatDate(order.created_at)}
          </p>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
          <div className="text-right">
            <span className="text-sm font-black text-slate-900 block">{formatMoney(cost)}</span>
            {isPhysical && cost && (
              <span className="text-[9px] text-slate-400 font-bold">Estimated deposit</span>
            )}
          </div>
          <button
            type="button"
            className="text-xs font-bold bg-indigo-950 text-white px-4 py-2 rounded-xl hover:bg-indigo-900 transition"
          >
            Track Job
          </button>
        </div>
      </div>

      {/* Digital pickup card */}
      {isDigitalPickup && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Pickup Code</p>
          <p className="text-lg font-black tracking-[0.3em] text-indigo-950 mt-0.5">
            {order.pickup_code}
          </p>
          <p className="text-[10px] text-amber-800 mt-1">
            Show this code at <span className="font-bold">{shop?.name || 'the shop'}</span>
            {shop?.market ? ` (${shop.market})` : ''} to collect your document — no queue.
          </p>
        </div>
      )}

      {/* Physical tracking card */}
      {isPhysical && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <Package size={14} className="text-indigo-900" />
            <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">
              Tracking ID
            </p>
          </div>
          <p className="text-lg font-black tracking-[0.3em] text-indigo-950">{order.pickup_code}</p>

          {order.details?.route === 'course_rep' && (order.scheduled_receive_date || order.scheduled_return_date) && (
            <p className="text-[10px] text-indigo-900">
              Rep receives <span className="font-bold">{formatDayOnly(order.scheduled_receive_date)}</span> • returns{' '}
              <span className="font-bold">{formatDayOnly(order.scheduled_return_date)}</span>
            </p>
          )}

          {order.details?.route === 'courier' && order.pickup_address && (
            <p className="text-[10px] text-indigo-900">
              Courier pickup at <span className="font-bold">{order.pickup_address}</span>
            </p>
          )}

          {order.details?.route === 'dropoff' && shop && (
            <p className="text-[10px] text-indigo-900">
              Drop off at <span className="font-bold">{shop.name}</span> ({shop.market}). Show your tracking ID to skip the queue.
            </p>
          )}

          <p className="text-[10px] text-indigo-800/80 pt-1 border-t border-indigo-200">
            Estimated deposit paid. Final price confirmed after staff count the pages.
          </p>
        </div>
      )}
    </div>
  );
}