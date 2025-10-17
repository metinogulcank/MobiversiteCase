"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { fetchUserCart, saveUserCart } from "../lib/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const { user, ready } = useAuth();
  const syncedRef = useRef(false); 
  const readCookie = (name) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };
  const writeCookie = (name, value, days = 30) => {
    if (typeof document === "undefined") return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}`;
  };
  useEffect(() => {
    try {
      const raw = readCookie("mobishop:cart");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      writeCookie("mobishop:cart", JSON.stringify(items));
    } catch {}
  }, [items]);

  useEffect(() => {
    if (!ready || !user) return;
    if (syncedRef.current) return; 
    (async () => {
      try {
        const server = await fetchUserCart(user.email);
        const cookieRaw = readCookie("mobishop:cart");
        const cookieItems = cookieRaw ? JSON.parse(cookieRaw) : [];
        const base = Array.isArray(server?.items) ? server.items : [];
        const map = new Map();
        const keyOf = (it) => {
          const pid = it?.product?.id;
          const c = it?.color || "";
          const s = it?.size || "";
          return `${pid}|${c}|${s}`;
        };
        base.forEach((it)=> { const k = keyOf(it); if (String(it?.product?.id)) map.set(k, it); });
        cookieItems.forEach((it)=> { const k = keyOf(it); if (!String(it?.product?.id)) return; if (!map.has(k)) map.set(k, it); });
        const merged = Array.from(map.values());
        await saveUserCart(user.email, merged);
        setItems(merged);
        writeCookie("mobishop:cart", JSON.stringify(merged));
        syncedRef.current = true;
      } catch {
      }
    })();
  }, [user, ready]);

  useEffect(() => {
    if (!ready || !user) return;
    if (!syncedRef.current) return; 
    (async () => {
      try {
        await saveUserCart(user.email, items);
      } catch {}
    })();
  }, [items, user, ready]);

  const add = (product, qty = 1, options = {}) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && (i.color || "") === (options.color || "") && (i.size || "") === (options.size || ""));
      if (existing) {
        return prev.map((i) => (i.product.id === product.id && (i.color || "") === (options.color || "") && (i.size || "") === (options.size || "")) ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { product, qty, color: options.color || null, size: options.size || null }];
    });
  };

  const remove = (productId, options = {}) => {
    const optColor = options.color || "";
    const optSize = options.size || "";
    setItems((prev) => prev.filter((i) => !(i.product.id === productId && (i.color || "") === optColor && (i.size || "") === optSize)));
  };

  const updateQty = (productId, qty, options = {}) => {
    const optColor = options.color || "";
    const optSize = options.size || "";
    setItems((prev) => prev.map((i) => (i.product.id === productId && (i.color || "") === optColor && (i.size || "") === optSize ? { ...i, qty } : i)));
  };

  const clear = () => setItems([]);

  const total = items.reduce((sum, i) => sum + Number(i.product.price) * i.qty, 0);

  const value = useMemo(() => ({ items, add, remove, updateQty, clear, total }), [items, total]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}


