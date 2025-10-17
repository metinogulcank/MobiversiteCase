"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchOrder, updateOrder } from "../../../../lib/api";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const data = await fetchOrder(orderId);
      setOrder(data || null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  const cancelOrder = async () => {
    if (!order) return;
    if (!confirm("Bu siparişi iptal etmek istediğinize emin misiniz?")) return;
    await updateOrder(order.id, { status: "İptal edildi", canceledAt: new Date().toISOString() });
    await load();
  };

  if (loading) return <div className="px-6 py-6">Yükleniyor…</div>;
  if (!order) return <div className="px-6 py-6">Sipariş bulunamadı.</div>;

  return (
    <div className="px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sipariş #{order.id}</h1>
          <div className="text-sm text-neutral-600">{order.createdAt ? new Date(order.createdAt).toLocaleString('tr-TR') : '-'}</div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/orders" className="rounded border px-3 py-2 text-sm">Geri</Link>
          {order.status !== "İptal edildi" && (
            <button onClick={cancelOrder} className="rounded border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50">Siparişi İptal Et</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-3 rounded border p-4">
          <div className="font-medium">Ürünler</div>
          <div className="divide-y">
            {(order.items||[]).map((it, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 text-sm">
                <div className="flex items-center gap-3">
                  {it.color && <span className="inline-block h-3 w-3 rounded-full border" style={{ backgroundColor: it.color }} title={it.color} />}
                  <div>
                    <div className="font-medium">{it.title}</div>
                    <div className="text-xs text-neutral-500">Adet: {it.qty}{it.size ? ` · Beden: ${it.size}` : ''}</div>
                  </div>
                </div>
                <div className="text-sm">{(Number(it.price)*Number(it.qty)).toLocaleString('tr-TR')} TL</div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3 rounded border p-4">
          <div className="font-medium">Özet</div>
          <div className="flex items-center justify-between text-sm"><span>Ara Toplam</span><span>{Number(order.total - (order.shipping||0)).toLocaleString('tr-TR')} TL</span></div>
          <div className="flex items-center justify-between text-sm"><span>Kargo</span><span>{Number(order.shipping||0).toLocaleString('tr-TR')} TL</span></div>
          <div className="flex items-center justify-between font-semibold"><span>Toplam</span><span>{Number(order.total||0).toLocaleString('tr-TR')} TL</span></div>
          <div className="pt-2 text-sm"><span className="font-medium">Durum: </span>{order.status}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded border p-4 text-sm">
          <div className="mb-2 font-medium">Teslimat Bilgileri</div>
          <div>{order.fullName}</div>
          <div>{order.phone}</div>
          <div className="whitespace-pre-wrap">{order.address}</div>
        </div>
        <div className="rounded border p-4 text-sm">
          <div className="mb-2 font-medium">Fatura Adresi</div>
          <div className="whitespace-pre-wrap">{order.billingAddress || order.address}</div>
        </div>
      </div>
    </div>
  );
}


