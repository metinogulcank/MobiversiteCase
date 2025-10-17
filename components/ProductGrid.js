"use client";

import { useState, useEffect } from "react";
import { fetchProducts, fetchProductReviews } from "../lib/api";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

function ProductCard({ product, reviews = [] }) {
  const colors = Array.isArray(product.colors) ? product.colors : [];
  const colorCount = colors.length || ((Number(product.id) % 6) + 1);
  const { toggle, isInWishlist } = useWishlist();
  const wished = isInWishlist(product.id);
  
  const productReviews = reviews.filter(r => r.productId === product.id);
  const averageRating = productReviews.length > 0 
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length 
    : 0;
  const reviewCount = productReviews.length;
  
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-white">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2 transition-opacity duration-300">
          <button onClick={(e)=>{e.preventDefault(); toggle(product);}} title={wished?"Favoride":"Favori"} className="h-10 w-10 grid place-items-center rounded-xl bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
            <i className={`${wished?"fa-solid text-red-500":"fa-regular text-gray-600"} fa-heart text-sm`} />
          </button>
        </div>
        <div className="absolute left-3 bottom-3 flex items-center gap-1">
          <div className="ml-1 flex items-center gap-1">
            <span className="text-xs flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm">
              <span className="h-3 w-3 rounded-full bg-gradient-to-r from-red-500 to-purple-500"></span>
              {colorCount}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <a href={`/products/${product.id}`} className="block">
          <div className="text-sm text-[#223c6c] line-clamp-2 mb-2 font-semibold">{product.title}</div>
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(star => (
                <span key={star} className={`text-xs ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
              ))}
            </div>
            <span className="text-xs text-gray-500">({reviewCount})</span>
          </div>
          <div className="text-lg font-bold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">{Number(product.price).toLocaleString("tr-TR")} TL</div>
        </a>
      </div>
    </div>
  );
}

export default function ProductGrid({ filters, currentPage, onPageChange }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("newest"); 

  const PRODUCTS_PER_PAGE = 20;

  useEffect(() => {
    async function getProducts() {
      setLoading(true);
      try {
        const [allProducts, allReviews] = await Promise.all([
          fetchProducts(),
          fetchProductReviews()
        ]);
        setProducts(allProducts);
        setReviews(allReviews);
      } catch (error) {
        console.error("Ürünler yüklenirken hata:", error);
        setProducts([]);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }
    getProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(product => 
        filters.category.some(cat => 
          product.category?.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    if (filters.priceRange && filters.priceRange.length === 2) {
      filtered = filtered.filter(product => 
        product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      );
    }

    if (filters.colors && filters.colors.length > 0) {
      filtered = filtered.filter(product => 
        product.colors && product.colors.some(color => 
          filters.colors.includes(color)
        )
      );
    }

    if (filters.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter(product => 
        product.sizes && product.sizes.some(size => 
          filters.sizes.includes(size)
        )
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "newest") {
        const da = new Date(a.createdAt || 0).getTime();
        const db = new Date(b.createdAt || 0).getTime();
        return db - da; 
      }
      if (sortBy === "price_asc") {
        return Number(a.price) - Number(b.price);
      }
      if (sortBy === "price_desc") {
        return Number(b.price) - Number(a.price);
      }
      if (sortBy === "best_selling") {
        return Number(b.sales || 0) - Number(a.sales || 0);
      }
      return 0;
    });

    setFilteredProducts(sorted);
    setTotalPages(Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  }, [products, filters, sortBy]);

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 rounded"></div>
              <div className="mt-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-600 font-medium">
          {filteredProducts.length} ürün bulundu
        </p>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">Sırala:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:border-[#223c6c] focus:outline-none focus:ring-2 focus:ring-[#223c6c]/20 transition-all duration-200 bg-white"
          >
            <option value="newest">En Yeni</option>
            <option value="price_asc">En Düşük Fiyat</option>
            <option value="price_desc">En Yüksek Fiyat</option>
            <option value="best_selling">En Çok Satan</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {currentProducts.map((product) => (
          <ProductCard key={product.id} product={product} reviews={reviews} />
        ))}
      </div>
        
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 border rounded-xl text-sm font-medium transition-all duration-200 ${
                page === currentPage
                  ? 'bg-gradient-to-r from-[#223c6c] to-[#1a2f54] text-white border-transparent shadow-lg'
                  : 'border-gray-300 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}

      {filteredProducts.length === 0 && !loading && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 p-12 text-center shadow-lg border border-gray-100/50">
          <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-br from-[#223c6c]/5 to-transparent rounded-bl-3xl"></div>
          <div className="relative z-10">
            <i className="fa-solid fa-search text-5xl text-gray-300 mb-6"></i>
            <h3 className="text-xl font-bold text-gray-600 mb-3">Ürün bulunamadı</h3>
            <p className="text-gray-500">Filtrelerinizi değiştirerek tekrar deneyin.</p>
          </div>
        </div>
      )}
    </div>
  );
}

