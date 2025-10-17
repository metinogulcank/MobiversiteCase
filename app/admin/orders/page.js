"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchOrders, updateOrder } from "../../../lib/api";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(Array.isArray(data) ? [...data].sort((a,b)=> new Date(b.createdAt||0) - new Date(a.createdAt||0)) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!query) return orders;
    const q = query.toLowerCase();
    return orders.filter(o =>
      String(o.id).toLowerCase().includes(q) ||
      String(o.userEmail||"").toLowerCase().includes(q) ||
      String(o.status||"").toLowerCase().includes(q)
    );
  }, [orders, query]);

  const cancelOrder = async (orderId) => {
    if (!confirm("Bu siparişi iptal etmek istediğinize emin misiniz?")) return;
    await updateOrder(orderId, { status: "İptal edildi", canceledAt: new Date().toISOString() });
    await load();
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">Siparişler</h1>
        <div className="relative w-full sm:w-64">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input 
            value={query} 
            onChange={(e)=> setQuery(e.target.value)} 
            placeholder="Ara (id, email, durum)" 
            className="w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#223c6c]/20 focus:border-[#223c6c] transition-all duration-200" 
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Yükleniyor...</div>
      ) : (
        <>
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-gray-600">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Kullanıcı</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Toplam</th>
                  <th className="px-4 py-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 align-middle font-medium">{o.id}</td>
                    <td className="px-4 py-3 align-middle">{o.createdAt ? new Date(o.createdAt).toLocaleString("tr-TR") : "-"}</td>
                    <td className="px-4 py-3 align-middle">{o.userEmail}</td>
                    <td className="px-4 py-3 align-middle">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        o.status === "İptal edildi" ? "bg-red-100 text-red-700" :
                        o.status === "Teslim edildi" ? "bg-green-100 text-green-700" :
                        o.status === "Kargoya verildi" ? "bg-blue-100 text-blue-700" :
                        o.status === "Sipariş hazırlanıyor" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {o.status || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle font-semibold">{Number(o.total||0).toLocaleString('tr-TR')} TL</td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/orders/${o.id}`} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200">Detay</Link>
                        {o.status !== "İptal edildi" && (
                          <button onClick={()=> cancelOrder(o.id)} className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors duration-200">İptal</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Kayıt bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-4">
            {filtered.map((o) => (
              <div key={o.id} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/30 p-4 shadow-lg border border-blue-100/50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium text-gray-900">Sipariş #{o.id}</div>
                    <div className="text-sm text-gray-600">{o.userEmail}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    o.status === "İptal edildi" ? "bg-red-100 text-red-700" :
                    o.status === "Teslim edildi" ? "bg-green-100 text-green-700" :
                    o.status === "Kargoya verildi" ? "bg-blue-100 text-blue-700" :
                    o.status === "Sipariş hazırlanıyor" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {o.status || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-600">{o.createdAt ? new Date(o.createdAt).toLocaleDateString("tr-TR") : "-"}</div>
                  <div className="font-semibold text-[#223c6c]">{Number(o.total||0).toLocaleString('tr-TR')} TL</div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/orders/${o.id}`} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-center">Detay</Link>
                  {o.status !== "İptal edildi" && (
                    <button onClick={()=> cancelOrder(o.id)} className="flex-1 rounded-lg border border-red-300 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors duration-200 text-center">İptal</button>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                Kayıt bulunamadı
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
