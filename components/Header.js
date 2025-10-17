"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { fetchCatalog } from "../lib/api";
import { useCart } from "../context/CartContext";

export default function Header() {
  const [showSearch, setShowSearch] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGenders, setOpenGenders] = useState([]);
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [catalog, setCatalog] = useState({ categories: {} });
  const cartCount = useMemo(() => items.reduce((s,i)=> s + i.qty, 0), [items]);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchCatalog();
        setCatalog({ categories: data?.categories || {} });
      } catch (e) {}
    }
    load();
  }, []);

  const toggleGender = (g) => {
    setOpenGenders((prev)=> prev.includes(g) ? prev.filter(x=> x!==g) : [...prev, g]);
  };

  return (
    <div className="w-full">
      <header className="px-6 border-b border-black/[.08] bg-white relative z-20">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button onClick={()=> setMobileOpen(v=>!v)} aria-label="Menü" className="md:hidden text-xl hover:opacity-80">
              <i className={`fa-solid ${mobileOpen ? "fa-xmark" : "fa-bars"}`} />
            </button>
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img src="/mobilogo.png" alt="MobiShop" className="h-16 w-auto" />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-3 lg:gap-8 text-sm">
            {["Tüm Ürünler","Erkek","Kadın","Çocuk","İndirim"].map((label) => (
              <div key={label} className="relative group">
                <Link href={label === "Tüm Ürünler" ? "/products" : `/products?category=${encodeURIComponent(label.toLowerCase())}`} className={label === "İndirim" ? "text-red-600" : ""}>{label.toUpperCase()}</Link>
                {( ["Erkek","Kadın","Çocuk"].includes(label) ) && (
                  <div className="pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 absolute left-1/2 -translate-x-1/2 mrr top-full">
                    <div className="mt-4 w-[71vw] max-w-5xl bg-white shadow-xl border border-black/5 p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                      {Object.keys((catalog.categories || {})[label.toLowerCase()] || {}).map((grp) => (
                        <div key={grp}>
                          <div className="font-semibold mb-3">{grp.charAt(0).toUpperCase()+grp.slice(1)}</div>
                          <ul className="space-y-2 text-sm text-black/80">
                            <li>
                              <Link href={`/products?category=${encodeURIComponent(`${label.toLowerCase()} ${grp.toLowerCase()}`)}`} className="hover:underline">{`${label} ${grp}`}</Link>
                            </li>
                            {(((catalog.categories || {})[label.toLowerCase()] || {})[grp] || []).map((sub) => (
                              <li key={sub}>
                                <Link href={`/products?category=${encodeURIComponent(`${label.toLowerCase()} ${grp.toLowerCase()} ${sub.toLowerCase()}`)}`} className="hover:underline">{sub}</Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <div className="hidden md:block">
                        <img src="/register.png" alt="kampanya" className="w-full h-48 object-cover rounded" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-5 text-lg">
            <button onClick={() => setShowSearch((s) => !s)} title="Ara" aria-label="Ara" className="hover:opacity-80">
              <i className="fa-solid fa-magnifying-glass" />
            </button>
            
            <Link href="/wishlist" title="İstek Listesi" aria-label="İstek Listesi" className="hover:opacity-80 relative">
              <i className="fa-regular fa-heart" />
            </Link>
            <Link href="/cart" title="Sepet" aria-label="Sepet" className="hover:opacity-80 relative">
              <i className="fa-solid fa-bag-shopping" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 h-5 min-w-[20px] rounded-full bg-[#223c6c] px-1 text-center text-[11px] leading-5 text-white">{cartCount}</span>
              )}
            </Link>
            {!user && <Link href="/login" className="md:hidden text-sm">Giriş</Link>}
            {!user ? (
              <div className="relative group text-sm hidden md:block">
                <button className="flex items-center gap-2 hover:opacity-80">
                  <span>Giriş Yap</span>
                </button>
                <div className="pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 absolute right-0 top-full">
                  <div className="mt-3 w-56 bg-white shadow-xl border border-black/5 p-4 flex flex-col gap-2 text-sm">
                    <Link href="/login" className="h-9 grid place-items-center" style={{ backgroundColor: "#223c6c", color: "#fff" }}>Giriş Yap</Link>
                    <Link href="/register" className="h-9 grid place-items-center" style={{ border: "1px solid #223c6c", color: "#223c6c" }}>Kayıt Ol</Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative group text-sm">
                <Link href="/profile" className="hidden md:flex items-center gap-2 hover:opacity-80">
                  <i className="fa-regular fa-user text-lg" />
                </Link>
              </div>
            )}
          </div>
          
          <div
            className={`absolute left-0 right-0 top-full bg-white border-b border-black/[.08] transition-all duration-200 ${
              showSearch ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
            }`}
          >
            <div className="px-6 py-3">
              <form action="/products" method="GET" className="max-w-2xl mx-auto flex items-center gap-3">
                <i className="fa-solid fa-magnifying-glass text-neutral-500" />
                <input
                  type="text"
                  name="q"
                  placeholder="Ürün, kategori veya marka ara"
                  className="flex-1 bg-transparent outline-none border-0"
                />
                <button type="submit" className="text-sm px-3 py-1" style={{ color: "#223c6c", border: "1px solid #223c6c" }}>Ara</button>
              </form>
            </div>
          </div>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? "max-h-[70vh] border-t border-black/10" : "max-h-0"}`}>
          <div className="px-6 py-4 space-y-4 bg-white">
            <Link href="/products" className="block text-sm font-semibold">TÜM ÜRÜNLER</Link>
            {Object.keys(catalog.categories || {}).map((gender)=> (
              <div key={gender} className="border-t border-black/[.06] pt-3">
                <button onClick={()=> toggleGender(gender)} className="w-full flex items-center justify-between text-left text-sm font-semibold">
                  <span>{gender.charAt(0).toUpperCase()+gender.slice(1)}</span>
                  <i className={`fa-solid ${openGenders.includes(gender) ? "fa-chevron-up" : "fa-chevron-down"} text-xs`} />
                </button>
                <div className={`pl-3 grid transition-all ${openGenders.includes(gender) ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    {Object.keys((catalog.categories||{})[gender]||{}).map((grp)=> (
                      <div key={grp} className="py-2">
                        <Link href={`/products?category=${encodeURIComponent(`${gender} ${grp}`)}`} className="block text-sm py-1">{grp.charAt(0).toUpperCase()+grp.slice(1)}</Link>
                        <div className="pl-3 space-y-1">
                          {(((catalog.categories||{})[gender]||{})[grp]||[]).map((sub)=> (
                            <Link key={sub} href={`/products?category=${encodeURIComponent(`${gender} ${grp} ${sub}`)}`} className="block text-xs text-black/70">{sub}</Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2 grid grid-cols-2 gap-2">
              {!user && (
                <>
                  <Link href="/login" className="text-center rounded-xl bg[#223c6c] text-white py-2 text-sm">Giriş Yap</Link>
                  <Link href="/register" className="text-center rounded-xl border border-[#223c6c] text-[#223c6c] py-2 text-sm">Kayıt Ol</Link>
                </>
              )}
              {user && (
                <>
                  <Link href="/profile" className="text-center rounded-xl border border-[#223c6c] text-[#223c6c] py-2 text-sm">Hesabım</Link>
                  <button onClick={logout} className="text-center rounded-xl bg-[#223c6c] text-white py-2 text-sm">Çıkış</button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}