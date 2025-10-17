"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

export default function ProductCard({ product }) {
  const { add } = useCart();
  const { items, toggle, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const wished = isInWishlist(product.id);

  return (
    <div className="border rounded-lg p-4 flex flex-col">
      <div className="relative">
        <img src={product.image} alt={product.title} className="w-full h-40 object-contain transition-transform duration-500 group-hover:scale-105 rounded" />
        <button
          title={wished ? "Favoride" : "Favori"}
          onClick={() => toggle(product)}
          className="absolute right-2 top-2 h-9 w-9 grid place-items-center rounded-full bg-white/90 shadow"
        >
          <i className={`${wished ? "fa-solid text-red-600" : "fa-regular text-neutral-700"} fa-heart`}></i>
        </button>
      </div>
      <Link href={`/products/${product.id}`} className="mt-3 font-medium hover:underline">
        {product.title}
      </Link>
      <div className="text-sm text-neutral-500">{product.category}</div>
      <div className="mt-2 font-semibold">{Number(product.price).toLocaleString('tr-TR')} TL</div>
    </div>
  );
}


