"use client";

import { useEffect, useState } from "react";
import { fetchWishlist, removeFromWishlist, fetchProducts } from "../../lib/api";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export default function WishlistPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productMap, setProductMap] = useState({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [wishlistData, products] = await Promise.all([
          fetchWishlist(),
          fetchProducts(),
        ]);
        setItems(Array.isArray(wishlistData) ? wishlistData : []);
        const map = {};
        (Array.isArray(products) ? products : []).forEach((p) => {
          map[String(p.id)] = p;
        });
        setProductMap(map);
      } catch { setItems([]); }
      setLoading(false);
    }
    if (user) load();
  }, [user]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="mb-8 text-3xl font-bold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">İstek Listem</h1>
      {!user ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 p-8 shadow-lg border border-gray-100/50 text-center">
          <div className="text-gray-600 mb-4">Favorileri görmek için lütfen giriş yapın.</div>
          <Link className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#223c6c] to-[#1a2f54] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105" href="/login">
            Giriş Yap
          </Link>
        </div>
      ) : loading ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 p-8 shadow-lg border border-gray-100/50 text-center">
          <div className="text-gray-600">Yükleniyor...</div>
        </div>
      ) : items.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 p-8 shadow-lg border border-gray-100/50 text-center">
          <div className="text-gray-600 mb-4">Listeniz boş.</div>
          <Link className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#223c6c] to-[#1a2f54] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105" href="/products">
            Ürünlere Göz Atın
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((w) => (
            <div key={w.id} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-lg border border-blue-100/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Link href={`/products/${w.productId}`} className="block">
                <div className="aspect-square overflow-hidden rounded-xl mb-4 shadow-md">
                  <img src={w.image} alt={w.title} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
                </div>
                <div className="mb-3 line-clamp-2 text-lg font-semibold text-gray-800">{w.title}</div>
                <PriceRow wishlistItem={w} currentPrice={productMap[String(w.productId)]?.price} />
              </Link>
              <div className="mt-4 flex gap-3">
                <Link href={`/products/${w.productId}`} className="flex-1 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#223c6c] to-[#1a2f54] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105">
                  Sepete Ekle
                </Link>
                <button 
                  aria-label="Favoriden Kaldır" 
                  title="Favoriden Kaldır" 
                  onClick={async ()=> { try { await removeFromWishlist(w.id); setItems(prev=> prev.filter(i=> i.id!==w.id)); } catch {} }} 
                  className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                >
                  <i className="fa-solid fa-heart text-sm"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PriceRow({ wishlistItem, currentPrice }){
  const saved = Number(wishlistItem.savedPrice);
  const current = Number(currentPrice ?? wishlistItem.price ?? wishlistItem.savedPrice);
  if (!isFinite(saved)) {
    return <div className="text-sm font-semibold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">{Number(current).toLocaleString('tr-TR')} TL</div>;
  }
  if (isFinite(current) && current < saved) {
    return (
      <div className="flex items-baseline gap-2 text-sm">
        <span className="line-through text-gray-400">{saved.toLocaleString('tr-TR')} TL</span>
        <span className="font-semibold text-red-600">{current.toLocaleString('tr-TR')} TL</span>
      </div>
    );
  }
  return <div className="text-sm font-semibold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">{current.toLocaleString('tr-TR')} TL</div>;
}
