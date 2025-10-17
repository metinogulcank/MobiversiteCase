"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { createOrder, updateProduct, fetchProducts } from "../../lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear, remove } = useCart();
  const { user } = useAuth();
  const selected = items; 
  const subTotal = selected.reduce((s, i) => s + Number(i.product.price) * i.qty, 0);
  const shipping = subTotal >= 300 ? 0 : (selected.length > 0 ? 79 : 0);
  const total = subTotal + shipping;

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    billingSame: true,
    billingAddress: "",
  });
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [bankStage, setBankStage] = useState(null); 
  function formatCardNumber(raw) {
    const digits = (raw || "").replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function formatExpiry(raw) {
    const digits = (raw || "").replace(/\D/g, "").slice(0, 4);
    if (digits.length === 0) return "";
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  function formatCvc(raw) {
    return (raw || "").replace(/\D/g, "").slice(0, 3);
  }

  useEffect(() => { if (!user) router.push('/login'); }, [user]);

  const submit = async () => {
    if (!user) { router.push('/login'); return; }
    if (!form.fullName || !form.phone || !form.address) { alert('Teslimat bilgilerini doldurun.'); return; }
    if (!card.number || !card.expiry || !card.cvc || !card.name) { alert('Kart bilgilerini doldurun.'); return; }
    const order = {
      userEmail: user.email,
      items: selected.map(i => ({ productId: i.product.id, title: i.product.title, qty: i.qty, price: i.product.price, color: i.color || null, size: i.size || null })),
      shipping,
      total,
      address: form.address,
      billingAddress: form.billingSame ? form.address : form.billingAddress,
      phone: form.phone,
      fullName: form.fullName,
      status: 'Sipariş alındı',
      createdAt: new Date().toISOString(),
    };
    setBankStage('redirect');
    setTimeout(async () => {
      setBankStage('processing');
      setTimeout(async () => {
        await createOrder(order);
        try {
          await Promise.all(selected.map(async ({ product, qty }) => {
            const currentSales = Number(product.sales || 0);
            const newSales = currentSales + Number(qty || 1);
            await updateProduct(product.id, { sales: newSales });
          }));
        } catch {}
        selected.forEach(({ product, color, size }) => remove(product.id, { color, size }));
        router.push('/profile');
      }, 1200);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 md:px-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">Teslimat Bilgileri</h1>
          
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/30 p-4 md:p-6 shadow-lg border border-blue-100/50">
            <div className="relative z-10 space-y-4">
              <input value={form.fullName} onChange={(e)=> setForm({...form, fullName: e.target.value})} placeholder="Ad Soyad" className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white/80 backdrop-blur-sm focus:border-[#223c6c] focus:outline-none focus:ring-2 focus:ring-[#223c6c]/20 transition-all duration-200" />
              <input value={form.phone} onChange={(e)=> setForm({...form, phone: e.target.value})} placeholder="Telefon" className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white/80 backdrop-blur-sm focus:border-[#223c6c] focus:outline-none focus:ring-2 focus:ring-[#223c6c]/20 transition-all duration-200" />
              <textarea value={form.address} onChange={(e)=> setForm({...form, address: e.target.value})} placeholder="Teslimat Adresi" rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white/80 backdrop-blur-sm focus:border-[#223c6c] focus:outline-none focus:ring-2 focus:ring-[#223c6c]/20 transition-all duration-200 resize-none" />
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={form.billingSame} onChange={(e)=> setForm({...form, billingSame: e.target.checked})} className="h-5 w-5 rounded border-2 border-gray-300 text-[#223c6c] focus:ring-[#223c6c] focus:ring-2" />
                <span className="text-gray-700 font-medium">Fatura adresim teslimat ile aynı</span>
              </label>
              {!form.billingSame && (
                <textarea value={form.billingAddress} onChange={(e)=> setForm({...form, billingAddress: e.target.value})} placeholder="Fatura Adresi" rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white/80 backdrop-blur-sm focus:border-[#223c6c] focus:outline-none focus:ring-2 focus:ring-[#223c6c]/20 transition-all duration-200 resize-none" />
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-emerald-50/30 p-4 md:p-6 shadow-lg border border-emerald-100/50">
            <div className="relative z-10">
              <h2 className="mb-4 text-lg md:text-xl font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">Kart Bilgileri</h2>
              <div className="space-y-4">
                <input value={card.name} onChange={(e)=> setCard({...card, name: e.target.value})} placeholder="Kart Üzerindeki İsim" className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white/80 backdrop-blur-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200" />
                <input value={card.number} onChange={(e)=> setCard({...card, number: formatCardNumber(e.target.value)})} placeholder="Kart Numarası (4242 4242 4242 4242)" className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white/80 backdrop-blur-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200" inputMode="numeric" />
                <div className="grid grid-cols-2 gap-4">
                  <input value={card.expiry} onChange={(e)=> setCard({...card, expiry: formatExpiry(e.target.value)})} placeholder="SKT (AA/YY)" className="rounded-xl border border-gray-200 px-4 py-3 bg-white/80 backdrop-blur-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200" inputMode="numeric" maxLength={5} />
                  <input value={card.cvc} onChange={(e)=> setCard({...card, cvc: formatCvc(e.target.value)})} placeholder="CVC" className="rounded-xl border border-gray-200 px-4 py-3 bg-white/80 backdrop-blur-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200" inputMode="numeric" maxLength={3} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-8 h-max">
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">Sipariş Özeti</h2>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 p-4 md:p-6 shadow-lg border border-gray-100/50">
            <div className="relative z-10 space-y-4">
              <div className="space-y-3">
                {selected.map(({ product, qty, color, size }) => (
                  <div key={`${product.id}|${color||""}|${size||""}`} className="flex items-start justify-between text-sm">
                    <span className="flex flex-col gap-1 flex-1 pr-2">
                      <span className="font-medium text-gray-800">{product.title} × {qty}</span>
                      {(color || size) && (
                        <span className="flex items-center gap-2 text-gray-500">
                          {color && <span className="inline-block h-4 w-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }} title={color} />}
                          {size && <span className="text-xs">Beden: {size}</span>}
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-gray-800 whitespace-nowrap">{(Number(product.price) * qty).toLocaleString('tr-TR')} TL</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span className="font-semibold text-gray-800">{subTotal.toLocaleString('tr-TR')} TL</span>
                </div>
                {shipping === 0 ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="line-through text-gray-400">Kargo 79 TL</span>
                    <span className="text-emerald-600 font-semibold">300₺ ve üzeri kargo bedava</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Kargo</span>
                    <span className="font-semibold text-gray-800">79 TL</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 flex items-center justify-between text-lg font-bold">
                  <span className="text-gray-800">Toplam</span>
                  <span className="bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">{total.toLocaleString('tr-TR')} TL</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={submit} className="w-full rounded-xl bg-gradient-to-r from-[#223c6c] to-[#1a2f54] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105">
              Devam Et ve Öde
            </button>
            <Link href="/products" className="block w-full rounded-xl border border-gray-200 px-6 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200">
              Alışverişe Devam Et
            </Link>
          </div>
        </aside>

        {bankStage && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm">
            <div className="relative overflow-hidden w-full max-w-md rounded-2xl bg-gradient-to-br from-white to-gray-50/30 p-8 text-center shadow-2xl border border-gray-100/50">
              <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-br from-[#223c6c]/10 to-transparent rounded-bl-3xl"></div>
              <div className="relative z-10">
                {bankStage === 'redirect' && (
                  <>
                    <div className="mb-4 text-xl font-bold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">Banka 3D Secure Sayfasına Yönlendiriliyorsunuz…</div>
                    <div className="text-sm text-gray-600 mb-4">Lütfen bekleyin</div>
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#223c6c]"></div>
                  </>
                )}
                {bankStage === 'processing' && (
                  <>
                    <div className="mb-4 text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">Ödeme Onaylanıyor…</div>
                    <div className="text-sm text-gray-600 mb-4">İşleminiz işleniyor</div>
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-emerald-500"></div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


