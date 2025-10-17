"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { addToWishlist, fetchWishlist, removeFromWishlist } from "../lib/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user, ready } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchWishlist();
        setItems(Array.isArray(data) ? data : []);
      } catch {}
    }
    load();
  }, []);

  const toggle = async (product) => {
    if (!ready) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }
    const exists = items.find((w) => String(w.productId) === String(product.id));
    if (exists) {
      try { await removeFromWishlist(exists.id); } catch {}
      setItems((prev) => prev.filter((w) => w.id !== exists.id));
    } else {
      try {
        const saved = await addToWishlist({ productId: product.id, title: product.title, savedPrice: product.price, image: product.image, userEmail: user.email });
        setItems((prev) => [saved, ...prev]);
      } catch {}
    }
  };

  const remove = async (wishlistId) => {
    try { await removeFromWishlist(wishlistId); } catch {}
    setItems((prev) => prev.filter((w) => w.id !== wishlistId));
  };

  const isInWishlist = (productId) => items.some((w) => String(w.productId) === String(productId));

  const value = useMemo(() => ({ items, toggle, remove, isInWishlist }), [items]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}


