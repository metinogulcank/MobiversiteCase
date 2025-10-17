"use client";

import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useMemo, useState } from "react";

export default function CartPage() {
  const { items, updateQty, remove, clear } = useCart();
  const { user } = useAuth();
  const [selectedKeys, setSelectedKeys] = useState(() => new Set(items.map(i => `${i.product.id}|${i.color||""}|${i.size||""}`)));

  const toggleSelect = (key) => {
    setSelectedKeys((prev) => {
      const s = new Set(prev);
      if (s.has(key)) s.delete(key); else s.add(key);
      return s;
    });
  };

  const selectedItems = useMemo(() => items.filter(i => selectedKeys.has(`${i.product.id}|${i.color||""}|${i.size||""}`)), [items, selectedKeys]);
  const subTotal = selectedItems.reduce((sum, i) => sum + Number(i.product.price) * i.qty, 0);
  const shipping = subTotal >= 300 ? 0 : (selectedItems.length > 0 ? 79 : 0);
  const total = subTotal + shipping;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8"> 
        <div className="md:col-span-2 space-y-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">Sepetim</h1>
          {items.length === 0 ? (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 p-8 shadow-lg border border-gray-100/50 text-center">
              <div className="text-gray-600 mb-4">Sepetiniz boş.</div>
              <Link className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#223c6c] to-[#1a2f54] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105" href="/products">
                Ürünlere Göz Atın
              </Link>
            </div>
          ) : (
            items.map(({ product, qty, color, size }) => (
              <div key={`${product.id}|${color||""}|${size||""}`} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/30 p-4 md:p-6 shadow-lg border border-blue-100/50">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="h-5 w-5 rounded border-2 border-gray-300 text-[#223c6c] focus:ring-[#223c6c] focus:ring-2" checked={selectedKeys.has(`${product.id}|${color||""}|${size||""}`)} onChange={() => toggleSelect(`${product.id}|${color||""}|${size||""}`)} />
                    <img src={product.image} alt={product.title} className="h-20 w-20 rounded-xl object-cover shadow-md" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base md:text-lg font-semibold text-gray-800 mb-1">{product.title}</div>
                    <div className="text-sm text-gray-600 flex flex-wrap items-center gap-3">
                      <span className="font-semibold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">{Number(product.price).toLocaleString('tr-TR')} TL</span>
                      {(color || size) && (
                        <span className="flex items-center gap-2 text-xs text-gray-500">
                          {color && (
                            <span className="inline-block h-4 w-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }} title={color} />
                          )}
                          {size && <span>Beden: {size}</span>}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-2 rounded-xl bg-gray-100 p-1">
                      <button className="h-9 w-9 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-[#223c6c]" onClick={() => updateQty(product.id, Math.max(1, qty - 1), { color, size })}>-</button>
                      <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                      <button className="h-9 w-9 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-[#223c6c]" onClick={() => updateQty(product.id, qty + 1, { color, size })}>+</button>
                    </div>
                    <button className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors duration-200" onClick={() => remove(product.id, { color, size })}>Kaldır</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="space-y-6 md:sticky md:top-8 h-max">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-emerald-50/30 p-6 shadow-lg border border-emerald-100/50">
            <div className="relative z-10 mb-4 text-xl font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">Özet</div>
            <div className="relative z-10 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Seçilen Ürünler</span>
                <span className="font-semibold text-gray-800">{selectedItems.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Ara Toplam</span>
                <span className="font-semibold text-gray-800">{subTotal.toLocaleString('tr-TR')} TL</span>
              </div>
              {shipping === 0 ? (
                <div className="flex items-center justify-between">
                  <span className="line-through text-gray-400">Kargo 79 TL</span>
                  <span className="text-emerald-600 font-semibold">300₺ ve üzeri kargo bedava</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Kargo</span>
                  <span className="font-semibold text-gray-800">79 TL</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex items-center justify-between text-lg font-bold">
                <span className="text-gray-800">Toplam</span>
                <span className="bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">{total.toLocaleString('tr-TR')} TL</span>
              </div>
            </div>
          </div>
          <div className="grid gap-3">
            <Link href={user ? "/checkout" : "/login"} className="rounded-xl bg-gradient-to-r from-[#223c6c] to-[#1a2f54] px-6 py-3 text-center text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105">
              Ödeme Yap
            </Link>
            <Link href="/products" className="rounded-xl border border-gray-200 px-6 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200">
              Alışverişe Devam Et
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}


