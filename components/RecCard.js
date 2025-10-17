"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWishlist } from "../context/WishlistContext";
import { fetchProductReviews } from "../lib/api";

export default function RecCard({ product }) {
  const { toggle, isInWishlist } = useWishlist();
  const wished = isInWishlist(product.id);
  const [rating, setRating] = useState({ avg: 0, count: 0 });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rev = await fetchProductReviews(product.id);
        const count = Array.isArray(rev) ? rev.length : 0;
        const avg = count ? (rev.reduce((s,r)=> s + Number(r.rating||0), 0) / count) : 0;
        if (mounted) setRating({ avg, count });
      } catch {}
    })();
    return () => { mounted = false; };
  }, [product?.id]);
  return (
    <Link href={`/products/${product.id}`} className="group relative min-w-[220px] snap-start overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 border border-gray-100/50 p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <button
        onClick={(e)=>{ e.preventDefault(); toggle(product); }}
        title={wished?"Favoride":"Favori"}
        className="absolute right-2 top-2 h-9 w-9 grid place-items-center rounded-xl bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
      >
        <i className={`${wished?"fa-solid text-red-600":"fa-regular text-neutral-700"} fa-heart text-sm`} />
      </button>
      <div className="aspect-square overflow-hidden rounded-xl">
        <img src={product.image} alt={product.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="mt-3 line-clamp-2 text-sm text-[#223c6c] font-semibold">{product.title}</div>
      <div className="mt-2 flex items-center gap-2 text-[12px] text-neutral-600">
        <span className="text-amber-500 text-xs">
          {Array.from({ length: 5 }).map((_, i) => {
            const full = Math.floor(rating.avg);
            const half = rating.avg - full >= 0.5;
            if (i < full) return <i key={i} className="fa-solid fa-star" />;
            if (i === full && half) return <i key={i} className="fa-regular fa-star-half-stroke" />;
            return <i key={i} className="fa-regular fa-star" />;
          })}
        </span>
        {<span>({rating.count})</span>}
      </div>
      <div className="mt-2 text-sm font-bold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">{Number(product.price).toLocaleString('tr-TR')} TL</div>
    </Link>
  );
}


