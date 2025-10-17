"use client";

import { useEffect, useState } from "react";
import { fetchProducts, fetchProductReviews } from "../lib/api";

function ProductCard({ product, ratingInfo }) {
  const { averageRating, reviewCount } = ratingInfo || { averageRating: 0, reviewCount: 0 };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/30 p-4 shadow-lg border border-blue-100/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative z-10">
        <div className="relative mb-3">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-48 object-cover rounded-xl"
          />
          <button className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-600 hover:text-red-500 hover:scale-110 transition-all duration-200">
            <i className="fa-regular fa-heart text-sm" />
          </button>
        </div>
        <div className="p-2">
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
    </div>
  );
}

export default function NewProductsCarousel({ title = "Yeni Ürünler" }) {
  const [items, setItems] = useState([]);
  const [displayItems, setDisplayItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [itemWidth, setItemWidth] = useState(240);
  const [visibleCols, setVisibleCols] = useState(2);
  const [ratings, setRatings] = useState({});
  const viewportRef = useState(null)[0];
  const trackRef = useState(null)[0];

  const getVisibleCols = () => {
    if (typeof window === 'undefined') return 2; 
    if (window.innerWidth >= 1600) return 5;
    if (window.innerWidth >= 1300) return 4;
    if (window.innerWidth >= 768) return 3;
    return 2;
  };

  useEffect(() => {
    async function load() {
      try {
        const products = await fetchProducts();
        const sorted = [...products].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        const newest10 = sorted.slice(0, 10);
        setItems(newest10);
        setDisplayItems(newest10);

        const allReviews = await fetchProductReviews();
        const ratingMap = {};
        newest10.forEach(product => {
          const productReviews = allReviews.filter(r => r.productId === product.id);
          const reviewCount = productReviews.length;
          const averageRating = reviewCount > 0 
            ? productReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviewCount 
            : 0;
          ratingMap[product.id] = { averageRating, reviewCount };
        });
        setRatings(ratingMap);
      } catch (e) {
        console.error('Failed to load products:', e);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const currentPage = Math.floor(index / visibleCols);
    const itemInPage = index % visibleCols;
    if (itemInPage === Math.floor(visibleCols / 2)) {
      const nextPageStart = (currentPage + 1) * visibleCols;
      const nextPageEnd = nextPageStart + visibleCols;
      const nextItems = [];
      for (let i = nextPageStart; i < nextPageEnd; i++) {
        nextItems.push(items[i % items.length]);
      }
      setDisplayItems(prev => [...prev, ...nextItems]);
    }
    if (index > visibleCols * 2) {
      setDisplayItems(prev => prev.slice(visibleCols));
      setIndex(prev => prev - visibleCols);
    }
  }, [index, items, visibleCols]);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => i + 1), 2500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = viewportRef;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const width = el.clientWidth;
      const cols = getVisibleCols();
      setItemWidth(Math.max(1, Math.floor(width / cols)));
      setVisibleCols(cols);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const goToPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goToNext = () => setIndex((i) => i + 1);

  const translatePx = -index * itemWidth;

  return (
    <section className="px-4 md:px-6 my-10">
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">{title}</h2>
        <div className="flex gap-2">
          <button onClick={goToPrev} className="h-9 w-9 grid place-items-center rounded-xl bg-white/90 backdrop-blur-sm shadow border border-gray-200 hover:shadow-md transition-all duration-200">
            <i className="fa-solid fa-chevron-left text-sm" />
          </button>
          <button onClick={goToNext} className="h-9 w-9 grid place-items-center rounded-xl bg-white/90 backdrop-blur-sm shadow border border-gray-200 hover:shadow-md transition-all duration-200">
            <i className="fa-solid fa-chevron-right text-sm" />
          </button>
        </div>
      </div>
      <div className="overflow-hidden" ref={viewportRef}>
        <div
          ref={trackRef}
          className="flex gap-0 will-change-transform"
          style={{ transform: `translateX(${translatePx}px)`, transition: "transform 600ms ease" }}
        >
          {displayItems.map((p, i) => (
            <div key={`${p.id}-${i}`} className="shrink-0 px-2" style={{ width: itemWidth }}>
              <ProductCard product={p} ratingInfo={ratings[p.id]} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
