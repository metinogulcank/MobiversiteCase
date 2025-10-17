"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchProducts, fetchProductReviews } from "../lib/api";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

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
  const { toggle, isInWishlist } = useWishlist();
  const wished = isInWishlist(product.id);
  const avg = Number(ratingInfo?.avg || 0);
  const count = Number(ratingInfo?.count || 0);
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

export default function BestSellersCarousel({ title = "Çok Satanlar" }) {
  const [items, setItems] = useState([]);
  const [ratings, setRatings] = useState({});
  const [index, setIndex] = useState(0);
  const [itemWidth, setItemWidth] = useState(0);
  const [cols, setCols] = useState(2);
  const [displayItems, setDisplayItems] = useState([]);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetchProducts()
      .then((data) => {
        if (!mounted) return;
        const products = Array.isArray(data) ? data : [];
        const sorted = [...products].sort((a, b) => Number(b.sales || 0) - Number(a.sales || 0));
        const top10 = sorted.slice(0, 10);
        setItems(top10);
        setDisplayItems(top10);
        return Promise.all(top10.map(async (p)=>{
          try {
            const rev = await fetchProductReviews(p.id);
            const count = Array.isArray(rev) ? rev.length : 0;
            const avg = count ? (rev.reduce((s,r)=> s + Number(r.rating||0), 0) / count) : 0;
            return [p.id, { avg, count }];
          } catch { return [p.id, { avg:0, count:0 }]; }
        }));
      })
      .then((pairs) => {
        if (!mounted || !pairs) return;
        const map = Object.fromEntries(pairs);
        setRatings(map);
      })
      .catch(() => {
        setItems([]);
        setDisplayItems([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const compute = () => {
      const vw = typeof window !== 'undefined' ? window.innerWidth : el.clientWidth;
      let c = 2;
      if (vw >= 1600) c = 5;
      else if (vw >= 1300) c = 4;
      else if (vw >= 768) c = 3;
      else c = 2;
      setCols(c);
      const width = el.clientWidth;
      setItemWidth(Math.max(1, Math.floor(width / c)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener('resize', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const currentPage = Math.floor(index / cols);
    const itemInPage = index % cols;
    if (itemInPage === Math.max(0, cols - 2)) {
      const nextPageStart = (currentPage + 1) * cols;
      const nextPageEnd = nextPageStart + cols;
      const nextItems = [];
      for (let i = nextPageStart; i < nextPageEnd; i++) {
        nextItems.push(items[i % items.length]);
      }
      setDisplayItems(prev => [...prev, ...nextItems]);
    }
    if (index > cols * 2) {
      setDisplayItems(prev => prev.slice(cols));
      setIndex(prev => prev - cols);
    }
  }, [index, items, cols]);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => i + 1), 2500);
    return () => clearInterval(id);
  }, []);

  const goToPrev = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  const goToNext = () => {
    setIndex(index + 1);
  };

  const translatePx = -(index * itemWidth);

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


