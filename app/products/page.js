"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FilterBar from "../../components/FilterBar";
import ProductGrid from "../../components/ProductGrid";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    category: [],
    priceRange: [0, 5000],
    colors: [],
    sizes: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const qParam = searchParams.get("q");

    if (categoryParam) {
      setFilters((prev) => ({
        ...prev,
        category: [categoryParam],
      }));
    }

    if (qParam) {
      document.title = `${qParam} - Ürünler | MobiShop`;
    }
  }, [searchParams]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="w-full px-6 py-8">
        <nav className="mb-6 text-sm text-gray-600 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-[#223c6c] transition-colors duration-200">MobiShop</Link>
          <span className="text-gray-400">/</span>
          {(() => {
            const categoryRaw = searchParams.get("category");
            if (!categoryRaw) {
              return <span className="font-semibold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">Tüm ürünler</span>;
            }
            const parts = categoryRaw.split(/\s+/).filter(Boolean);
            return parts.map((p, idx) => {
              const label = p.charAt(0).toUpperCase() + p.slice(1);
              const value = parts.slice(0, idx + 1).join(" ");
              const isLast = idx === parts.length - 1;
              return (
                <span key={value} className="flex items-center gap-2">
                  {!isLast ? (
                    <Link href={`/products?category=${encodeURIComponent(value)}`} className="hover:text-[#223c6c] transition-colors duration-200">
                      {label}
                    </Link>
                  ) : (
                    <span className="font-semibold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">{label}</span>
                  )}
                  {!isLast && <span className="text-gray-400">/</span>}
                </span>
              );
            });
          })()}
        </nav>

        <div className="mb-4 lg:hidden">
          <button
            onClick={() => setShowFilters(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#223c6c] to-[#1a2f54] px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <i className="fa-solid fa-sliders" /> Filtreleri Göster
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="hidden lg:block w-full lg:w-1/4">
            <div className="sticky top-8">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/30 shadow-lg border border-blue-100/50">
                <FilterBar filters={filters} onFiltersChange={handleFiltersChange} />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-3/4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 shadow-lg border border-gray-100/50 p-6">
              <ProductGrid
                filters={filters}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[88%] max-w-sm bg-white shadow-2xl p-4 overflow-y-auto">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-lg font-semibold" style={{ color: '#223c6c' }}>Filtreler</div>
              <button onClick={() => setShowFilters(false)} className="h-8 w-8 grid place-items-center rounded-full border"><i className="fa-solid fa-xmark" /></button>
            </div>
            <FilterBar filters={filters} onFiltersChange={handleFiltersChange} />
          </div>
        </div>
      )}
    </div>
  );
}


