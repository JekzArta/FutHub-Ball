"use client";

import { 
  TrendingUp, 
  Users, 
  CalendarCheck, 
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  MoreVertical,
  MessageSquare
} from "lucide-react";

export default function AdminDashboard() {
  // Dummy Data for Dashboard
  const stats = [
    { label: "Total Pendapatan", value: "Rp 12.550.000", change: "+15%", isUp: true, icon: Wallet, color: "bg-emerald-100 text-emerald-600" },
    { label: "Booking Bulan Ini", value: "248", change: "+5%", isUp: true, icon: CalendarCheck, color: "bg-blue-100 text-blue-600" },
    { label: "Total User", value: "1,204", change: "+12%", isUp: true, icon: Users, color: "bg-violet-100 text-violet-600" },
    { label: "Konversi Batal", value: "3.2%", change: "-1.1%", isUp: false, icon: TrendingUp, color: "bg-red-100 text-red-600" },
  ];

  const recentBookings = [
    { id: "BK-0921", user: "Budi Santoso", field: "Lapangan A", time: "18:00 - 20:00", date: "Hari ini", status: "pending", amount: "Rp 160.000" },
    { id: "BK-0920", user: "Andi Pratama", field: "Lapangan C", time: "15:00 - 17:00", date: "Hari ini", status: "confirmed", amount: "Rp 150.000" },
    { id: "BK-0919", user: "Tito Karno", field: "Lapangan B", time: "20:00 - 22:00", date: "Kemarin", status: "completed", amount: "Rp 200.000" },
    { id: "BK-0918", user: "Dina Melia", field: "Lapangan A", time: "09:00 - 11:00", date: "Kemarin", status: "rejected", amount: "Rp 120.000" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Ringkasan aktivitas penyewaan lapangan futsal.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              </div>
              <div className={`p-2 rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-sm">
              <span className={`flex items-center font-medium ${stat.isUp ? 'text-emerald-600' : 'text-red-600'}`}>
                {stat.isUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {stat.change}
              </span>
              <span className="text-slate-500">vs bulan lalu</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings (takes 2/3 width on large screens) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Booking Terbaru</h2>
            <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">User & Lapangan</th>
                  <th className="px-5 py-3 font-medium">Jadwal</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 uppercase-first">
                {recentBookings.map((bk) => (
                  <tr key={bk.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-slate-500">{bk.id}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{bk.user}</p>
                      <p className="text-xs text-slate-500">{bk.field}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-900">{bk.time}</p>
                      <p className="text-xs text-slate-500">{bk.date}</p>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">{bk.amount}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                        ${bk.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                        ${bk.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                        ${bk.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                        ${bk.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                      `}>
                        {bk.status === 'pending' && <Clock className="h-3 w-3" />}
                        {bk.status === 'confirmed' && <CheckCircle2 className="h-3 w-3" />}
                        {bk.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                        {bk.status === 'rejected' && <XCircle className="h-3 w-3" />}
                        {bk.status.charAt(0).toUpperCase() + bk.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right pr-4">
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
           <h2 className="text-lg font-bold text-slate-900 mb-4">Butuh Perhatian</h2>
           
           <div className="space-y-3">
             <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-50 border border-yellow-100">
               <div className="mt-0.5"><Clock className="h-5 w-5 text-yellow-600" /></div>
               <div>
                 <p className="text-sm font-medium text-yellow-900">7 Booking Pending</p>
                 <p className="text-xs text-yellow-700 mt-0.5">Memerlukan verifikasi pembayaran manual segera.</p>
                 <button className="text-xs font-semibold text-yellow-800 mt-2 hover:underline">Lihat Booking</button>
               </div>
             </div>

             <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
               <div className="mt-0.5"><MessageSquare className="h-5 w-5 text-slate-500" /></div>
               <div>
                 <p className="text-sm font-medium text-slate-900">Ulasan Baru (4.8★)</p>
                 <p className="text-xs text-slate-500 mt-0.5">3 ulasan baru ditambahkan hari ini.</p>
                 <button className="text-xs font-semibold text-emerald-600 mt-2 hover:underline">Baca Ulasan</button>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
