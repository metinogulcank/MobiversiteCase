"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchProducts, deleteProduct } from "../../../lib/api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const title = String(p.title || "").toLowerCase();
      const category = String(p.category || "").toLowerCase();
      const brand = String(p.brand || "").toLowerCase();
      return title.includes(q) || category.includes(q) || brand.includes(q);
    });
  }, [products, query]);

  

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">Ürünler</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ürün, kategori veya marka ara"
              className="w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#223c6c]/20 focus:border-[#223c6c] transition-all duration-200"
            />
          </div>
          <Link
            href="/admin/products/new"
            className="rounded-xl bg-gradient-to-r from-[#223c6c] to-[#1a2f54] px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
          >
            Ürün Ekle
          </Link>
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
                  <th className="px-4 py-3">Ürün</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Fiyat</th>
                  <th className="px-4 py-3">Satış</th>
                  <th className="px-4 py-3">Eklenme</th>
                  <th className="px-4 py-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 align-middle">{p.id}</td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.title} className="h-12 w-12 rounded-lg object-contain" />
                        <div>
                          <div className="font-medium text-gray-900">{p.title}</div>
                          {p.brand && <div className="text-xs text-gray-500">{p.brand}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">{p.category}</td>
                    <td className="px-4 py-3 align-middle font-semibold">{Number(p.price).toLocaleString("tr-TR")} TL</td>
                    <td className="px-4 py-3 align-middle">{Number(p.sales || 0).toLocaleString("tr-TR")}</td>
                    <td className="px-4 py-3 align-middle">{p.createdAt ? new Date(p.createdAt).toLocaleDateString("tr-TR") : "-"}</td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/products/${p.id}/edit`} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200">Düzenle</Link>
                        <button
                          onClick={async () => {
                            if (!confirm("Ürünü silmek istediğinize emin misiniz?")) return;
                            try {
                              await deleteProduct(p.id);
                              setProducts((prev) => prev.filter((x) => x.id !== p.id));
                            } catch (e) {}
                          }}
                          className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Sonuç bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="lg:hidden space-y-4">
            {filtered.map((p) => (
              <div key={p.id} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/30 p-4 shadow-lg border border-blue-100/50">
                <div className="flex items-start gap-4">
                  <img src={p.image} alt={p.title} className="h-16 w-16 rounded-lg object-contain flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 mb-1">{p.title}</div>
                    {p.brand && <div className="text-xs text-gray-500 mb-2">{p.brand}</div>}
                    <div className="text-sm text-gray-600 mb-2">{p.category}</div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-[#223c6c]">{Number(p.price).toLocaleString("tr-TR")} TL</div>
                      <div className="text-xs text-gray-500">Satış: {Number(p.sales || 0).toLocaleString("tr-TR")}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/products/${p.id}/edit`} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-center">Düzenle</Link>
                      <button
                        onClick={async () => {
                          if (!confirm("Ürünü silmek istediğinize emin misiniz?")) return;
                          try {
                            await deleteProduct(p.id);
                            setProducts((prev) => prev.filter((x) => x.id !== p.id));
                          } catch (e) {}
                        }}
                        className="flex-1 rounded-lg border border-red-300 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors duration-200 text-center"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!filtered.length && (
              <div className="py-8 text-center text-gray-500">
                Sonuç bulunamadı
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
