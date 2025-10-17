"use client";

import { useEffect, useState } from "react";
import { fetchProducts, fetchProductReviews } from "../lib/api";
import { useWishlist } from "../context/WishlistContext";

function Stars({ value = 0 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="text-amber-500 text-xs">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <i key={i} className="fa-solid fa-star" />;
        if (i === full && half) return <i key={i} className="fa-regular fa-star-half-stroke" />;
        return <i key={i} className="fa-regular fa-star" />;
      })}
    </span>
  );
}

function ProductCard({ product, ratingInfo }) {
  const colors = Array.isArray(product.colors) ? product.colors : [];
  const colorCount = colors.length || ((Number(product.id) % 6) + 1);
  const avg = Number(ratingInfo?.avg || 0);
  const count = Number(ratingInfo?.count || 0);
  const { toggle, isInWishlist } = useWishlist();
  const wished = isInWishlist(product.id);
  
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-white">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2 transition-opacity duration-300">
          <button onClick={(e)=>{e.preventDefault(); toggle(product);}} title={wished?"Favoride":"Favori"} className="h-10 w-10 grid place-items-center rounded-xl bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
            <i className={`${wished?"fa-solid text-red-600":"fa-regular text-neutral-700"} fa-heart text-sm`} />
          </button>
        </div>
        <div className="absolute left-3 bottom-3 flex items-center gap-1">
          <div className="ml-1 flex items-center gap-1">
            <span className="text-[11px] flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/95 text-neutral-700"><span className="h-3 w-3 rounded-full bg-gradient-to-r from-red-500 to-purple-500"></span>{colorCount}</span>
          </div>
        </div>
      </div>
      <a href={`/products/${product.id}`} className="block p-4">
        <div className="text-sm font-semibold text-[#223c6c] line-clamp-2">{product.title}</div>
        <div className="mt-2 flex items-center gap-2 text-[12px] text-neutral-600">
          <Stars value={avg} />
          {count > 0 && <span>({count})</span>}
        </div>
        <div className="mt-2 text-lg font-bold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">{Number(product.price).toLocaleString("tr-TR")} TL</div>
      </a>
    </div>
  );
}

export default function CategoryProducts({ category, title }) {
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [ratings, setRatings] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCols, setVisibleCols] = useState(5);

  const getVisibleCols = () => {
    if (typeof window === 'undefined') return 5;
    if (window.innerWidth >= 1600) return 5;
    if (window.innerWidth >= 1300) return 4;
    if (window.innerWidth >= 768) return 3;
    return 2;
  };

  useEffect(() => {
    async function getProducts() {
      const products = await fetchProducts();
      
      const filteredProducts = category 
        ? products.filter(p => p.category?.toLowerCase().includes(category.toLowerCase()))
        : products;
      
      setAllProducts(filteredProducts);
      setDisplayProducts(filteredProducts.slice(0, visibleCols));
      
      const allReviews = await fetchProductReviews();
      const ratingMap = {};
      filteredProducts.forEach(product => {
        const productReviews = allReviews.filter(r => r.productId === product.id);
        const reviewCount = productReviews.length;
        const averageRating = reviewCount > 0 
          ? productReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviewCount 
          : 0;
        ratingMap[product.id] = { avg: averageRating, count: reviewCount };
      });
      setRatings(ratingMap);
    }
    getProducts();
  }, [category]);

  useEffect(() => {
    const cols = getVisibleCols();
    setVisibleCols(cols);
    const start = currentIndex * cols;
    const end = start + cols;
    setDisplayProducts(allProducts.slice(start, end));
  }, [allProducts, currentIndex, visibleCols]);

  useEffect(() => {
    const handleResize = () => {
      const cols = getVisibleCols();
      setVisibleCols(cols);
      const start = currentIndex * cols;
      const end = start + cols;
      setDisplayProducts(allProducts.slice(start, end));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [allProducts, currentIndex]);

  const goToPrev = () => {
    const maxIndex = Math.max(0, Math.ceil(allProducts.length / visibleCols) - 1);
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    const maxIndex = Math.max(0, Math.ceil(allProducts.length / visibleCols) - 1);
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const listHref = category ? `/products?category=${encodeURIComponent(category)}` : "/products";

  return (
    <section className="px-4 md:px-6 my-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">{title}</h2>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button 
              onClick={goToPrev} 
              disabled={currentIndex === 0}
              className="h-9 w-9 grid place-items-center rounded-xl bg-white/90 backdrop-blur-sm shadow border border-gray-200 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-chevron-left text-sm" />
            </button>
            <button 
              onClick={goToNext} 
              disabled={currentIndex >= Math.ceil(allProducts.length / visibleCols) - 1}
              className="h-9 w-9 grid place-items-center rounded-xl bg-white/90 backdrop-blur-sm shadow border border-gray-200 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-chevron-right text-sm" />
            </button>
          </div>
          <a 
            href={listHref}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            Tümünü Gör
            <i className="fa-solid fa-arrow-right text-xs" />
          </a>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} ratingInfo={ratings[product.id]} />
        ))}
      </div>
    </section>
  );
}
