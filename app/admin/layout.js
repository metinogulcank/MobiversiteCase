"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "fa-chart-line" },
    { href: "/admin/categories", label: "Kategoriler", icon: "fa-tags" },
    { href: "/admin/products", label: "Ürünler", icon: "fa-box" },
    { href: "/admin/orders", label: "Siparişler", icon: "fa-shopping-cart" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">Admin Panel</h2>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  pathname === item.href
                    ? 'bg-gradient-to-r from-[#223c6c] to-[#1a2f54] text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-[#223c6c]'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <i className={`fa-solid ${item.icon} w-4`} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex h-screen">
        <aside className="hidden lg:flex lg:w-64 lg:flex-col">
          <div className="flex flex-1 flex-col bg-white shadow-lg">
            <div className="flex items-center justify-center p-4 border-b">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">Admin Panel</h2>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-gradient-to-r from-[#223c6c] to-[#1a2f54] text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-[#223c6c]'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} w-4`} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="lg:hidden flex items-center justify-between p-4 bg-white shadow-sm border-b">
            <button
              onClick={() => setSidebarOpen(true)}
              className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center"
            >
              <i className="fa-solid fa-bars text-sm" />
            </button>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">Admin Panel</h1>
            <div className="w-10" />
          </div>

          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 shadow-lg border border-gray-100/50 p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}


