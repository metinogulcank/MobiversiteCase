"use client";

import { useEffect, useState } from "react";
import { fetchOrders, fetchProducts, fetchUsers } from "../../lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    recentOrders: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [orders, products] = await Promise.all([
          fetchOrders(),
          fetchProducts()
        ]);

        
        let users = [];
        try {
          users = await fetchUsers();
        } catch (userError) {
          console.warn('Users endpoint not available:', userError);
          const uniqueEmails = new Set(orders.map(order => order.userEmail).filter(Boolean));
          users = Array.from(uniqueEmails).map((email, index) => ({ id: index + 1, email }));
        }

        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

        const recentOrders = [...orders]
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 5);

        const topProducts = [...products]
          .sort((a, b) => Number(b.sales || 0) - Number(a.sales || 0))
          .slice(0, 5);

        setStats({
          totalRevenue,
          totalOrders: orders.length,
          totalUsers: users.length,
          totalProducts: products.length,
          recentOrders,
          topProducts
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#223c6c]"></div>
        <div className="mt-2">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-emerald-50/30 p-6 shadow-lg border border-emerald-100/50">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString('tr-TR')} TL</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <i className="fa-solid fa-chart-line text-emerald-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-lg border border-blue-100/50">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Sipariş</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders.toLocaleString('tr-TR')}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <i className="fa-solid fa-shopping-cart text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-purple-50/30 p-6 shadow-lg border border-purple-100/50">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString('tr-TR')}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <i className="fa-solid fa-users text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-orange-50/30 p-6 shadow-lg border border-orange-100/50">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Ürün</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts.toLocaleString('tr-TR')}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <i className="fa-solid fa-box text-orange-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 p-6 shadow-lg border border-gray-100/50">
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Siparişler</h3>
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50">
                  <div>
                    <p className="font-medium text-gray-900">Sipariş #{order.id}</p>
                    <p className="text-sm text-gray-600">{order.userEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{Number(order.total || 0).toLocaleString('tr-TR')} TL</p>
                    <p className="text-xs text-gray-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('tr-TR') : '-'}</p>
                  </div>
                </div>
              ))}
              {stats.recentOrders.length === 0 && (
                <p className="text-center text-gray-500 py-4">Henüz sipariş bulunmuyor</p>
              )}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 p-6 shadow-lg border border-gray-100/50">
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">En Çok Satan Ürünler</h3>
            <div className="space-y-3">
              {stats.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#223c6c] text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.title}</p>
                    <p className="text-sm text-gray-600">{Number(product.sales || 0).toLocaleString('tr-TR')} satış</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{Number(product.price).toLocaleString('tr-TR')} TL</p>
                  </div>
                </div>
              ))}
              {stats.topProducts.length === 0 && (
                <p className="text-center text-gray-500 py-4">Henüz ürün bulunmuyor</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}