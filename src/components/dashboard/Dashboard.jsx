export default function Dashboard({ orders = [] }) {
  const activeOrdersCount = orders.filter(o => o.active).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Overview Header */}
      <div className="bg-indigo-950 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center shadow-md">
        <div>
          <h2 className="text-2xl font-extrabold">Student Order Dashboard</h2>
          <p className="text-xs text-indigo-200 mt-1">Track your print jobs, drop-off materials, and collection points live.</p>
        </div>
        <div className="mt-4 md:mt-0 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center">
          <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Active Orders</p>
          <p className="text-lg font-black">{activeOrdersCount} Jobs Running</p>
        </div>
      </div>

      {/* Active Orders List */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Active Orders</h3>
        {orders.filter(o => o.active).length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No active orders running right now.</p>
        ) : (
          <div className="space-y-4">
            {orders.filter(o => o.active).map((order) => (
              <div key={order.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-indigo-950 bg-indigo-100 px-2.5 py-0.5 rounded-md">{order.id}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      order.status === 'Ready for Pickup' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{order.details}</p>
                  <p className="text-[10px] text-slate-500">
                    {order.location} • {order.date}
                  </p>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
                  <span className="text-sm font-black text-slate-900">{order.cost}</span>
                  <button className="text-xs font-bold bg-indigo-950 text-white px-4 py-2 rounded-xl hover:bg-indigo-900 transition">
                    Track Job
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}