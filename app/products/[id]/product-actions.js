"use client";
import React from "react";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useAuth } from "../../../context/AuthContext";

export default function AddActions({ product }) {
  const { add } = useCart();
  const { toggle, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const wished = isInWishlist(product.id);
  const [color, setColor] = React.useState("");
  const [size, setSize] = React.useState("");

  return (
    <div className="flex flex-col gap-3">
      {(Array.isArray(product.colors) && product.colors.length > 0) && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600">Renk:</span>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button key={c} title={c} onClick={()=> setColor(c)} className={`h-7 w-7 rounded-full border ${color===c? 'ring-2 ring-[#223c6c]':''}`} style={{ backgroundColor: c, borderColor: '#e5e7eb' }} />
            ))}
          </div>
        </div>
      )}
      {(Array.isArray(product.sizes) && product.sizes.length > 0) && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600">Beden:</span>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button key={s} onClick={()=> setSize(s)} className={`rounded-full border px-3 py-1 text-xs ${size===s? 'border-[#223c6c] text-[#223c6c]':''}`}>{s}</button>
            ))}
          </div>
        </div>
      )}
      <button className="px-4 py-2 rounded bg-[#223c6c] text-white" onClick={() => add(product, 1, { color, size })}>
        Sepete Ekle
      </button>
      <button
        className={`px-4 py-2 rounded border ${wished ? "bg-pink-100 border-pink-400" : ""}`}
        onClick={() => toggle(product)}
      >
        {wished ? "İstek Listesinde" : "İstek Listesine Ekle"}
      </button>
    </div>
  );
}


