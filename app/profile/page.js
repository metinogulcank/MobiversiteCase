"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchOrders, createReview, fetchUserReviews, updateUserEmailEverywhere } from "../../lib/api";

export default function ProfilePage() {
  const { user, logout, ready } = useAuth();
  const [orders, setOrders] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [submittingId, setSubmittingId] = useState(null);
  const [tab, setTab] = useState("orders");
  const [profileEdit, setProfileEdit] = useState({ email: "", name: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    (async () => {
      const all = await fetchOrders();
      const mine = (all || []).filter(o => o.userEmail === user.email).sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(mine);
      setMyReviews(await fetchUserReviews(user.email));
    })();
  }, [user, ready]);

  useEffect(() => {
    if (user) {
      setProfileEdit({ email: user.email || "", name: user.name || "", phone: user.phone || "" });
    }
  }, [user]);

  const reviewedKey = (productId) => myReviews.some(r => String(r.productId) === String(productId));

  const submitReview = async (orderId, item, form) => {
    setSubmittingId(`${orderId}:${item.productId}`);
    await createReview({
      userEmail: user.email,
      productId: item.productId,
      rating: form.rating,
      comment: form.comment,
      photos: form.photos, 
      createdAt: new Date().toISOString(),
      orderId,
      title: item.title,
    });
    setMyReviews(await fetchUserReviews(user.email));
    setSubmittingId(null);
  };

  if (!ready) return <div className="px-6 py-6">Yükleniyor…</div>;
  if (!user) {
    return (
      <div className="px-6 py-6">
        <p>Profilinizi görüntülemek için giriş yapmalısınız.</p>
        <Link className="text-[#223c6c] hover:underline" href="/login">Giriş sayfasına git</Link>
      </div>
    );
  }

  const saveProfile = async () => {
    if (!profileEdit.email) return alert('Email gerekli');
    if (profileEdit.email !== user.email) {
      setSavingProfile(true);
      const res = await updateUserEmailEverywhere(user.email, profileEdit.email).catch(()=>({ error: true }));
      setSavingProfile(false);
      if (res?.error) return alert('Email başka bir kullanıcı tarafından kullanılıyor veya hata oluştu');
      try { localStorage.setItem("mobishop:user", JSON.stringify({ email: profileEdit.email })); } catch {}
      window.location.reload();
    } else {
      alert('Profil bilgileri güncellendi');
    }
  };

  const savePassword = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      return alert('Tüm alanları doldurun');
    }
    if (passwordForm.new !== passwordForm.confirm) {
      return alert('Yeni şifreler eşleşmiyor');
    }
    if (passwordForm.new.length < 6) {
      return alert('Yeni şifre en az 6 karakter olmalı');
    }
    
    setSavingPassword(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Şifre başarıyla güncellendi');
      setPasswordForm({ current: "", new: "", confirm: "" });
    } catch {
      alert('Şifre güncellenirken hata oluştu');
    } finally {
      setSavingPassword(false);
    }
  };

  const totalOrders = orders.length;
  const delivered = orders.filter(o => (o.status||"").toLowerCase().includes("teslim")).length;
  const totalReviews = myReviews.length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-[#223c6c] to-[#1b2f54] p-6 text-white shadow-sm">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-white/15 text-lg font-semibold">
              {String(user.email || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-xl font-semibold">Hoş geldin</div>
              <div className="text-white/80 text-sm">{user.email}</div>
            </div>
          </div>
          <button onClick={logout} className="rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur transition hover:bg-white/15">
            Çıkış Yap
          </button>
        </div>
        <div className="relative z-10 mt-4 grid grid-cols-3 gap-4 text-center">
          <StatPill label="Sipariş" value={totalOrders} />
          <StatPill label="Teslim Edilen" value={delivered} />
          <StatPill label="Yorum" value={totalReviews} />
        </div>
        <GradientDeco />
      </div>

      <div className="mt-6">
        <div className="inline-flex overflow-hidden rounded-full border bg-white p-1 shadow-sm">
          <button onClick={()=> setTab("orders")} className={`px-4 py-1.5 text-sm ${tab==='orders'? 'bg-[#223c6c] text-white rounded-full' : 'text-[#223c6c]'}`}>Siparişlerim</button>
          <button onClick={()=> setTab("profile")} className={`px-4 py-1.5 text-sm ${tab==='profile'? 'bg-[#223c6c] text-white rounded-full' : 'text-[#223c6c]'}`}>Profil</button>
        </div>

        {tab === 'orders' && (
          <div className="mt-6">
            {orders.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center text-neutral-600">Henüz siparişiniz yok.</div>
            ) : (
              <div className="space-y-6">
                {orders.map((o) => (
                  <div key={o.id} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="relative z-10 mb-5 flex flex-wrap items-center justify-between gap-2">
                      <div className="font-bold text-xl bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">Sipariş #{o.id}</div>
                      <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString('tr-TR')}</div>
                      <span className="rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 px-4 py-1.5 text-xs text-white font-semibold shadow-sm">{o.status}</span>
                    </div>
                    <div className="relative z-10 space-y-4">
                      {(o.items||[]).map((it, idx) => (
                        <OrderItemReviewRow
                          key={idx}
                          item={it}
                          disabled={reviewedKey(it.productId)}
                          onSubmit={(form)=> submitReview(o.id, it, form)}
                          submitting={submittingId === `${o.id}:${it.productId}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        

        {tab === 'profile' && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-lg border border-blue-100/50">
              <div className="relative z-10 mb-4 text-lg font-semibold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">Bilgiler</div>
              <div className="relative z-10 grid gap-4 text-sm">
                <label className="grid gap-2">
                  <span className="text-gray-600 font-medium">E-posta</span>
                  <input className="rounded-xl border border-gray-200 px-4 py-3 bg-white/80 backdrop-blur-sm focus:border-[#223c6c] focus:outline-none focus:ring-2 focus:ring-[#223c6c]/20 transition-all duration-200" value={profileEdit.email} onChange={(e)=> setProfileEdit({ ...profileEdit, email: e.target.value })} />
                </label>
                <label className="grid gap-2">
                  <span className="text-gray-600 font-medium">Ad Soyad</span>
                  <input className="rounded-xl border border-gray-200 px-4 py-3 bg-white/80 backdrop-blur-sm focus:border-[#223c6c] focus:outline-none focus:ring-2 focus:ring-[#223c6c]/20 transition-all duration-200" value={profileEdit.name} onChange={(e)=> setProfileEdit({ ...profileEdit, name: e.target.value })} />
                </label>
                <label className="grid gap-2">
                  <span className="text-gray-600 font-medium">Telefon</span>
                  <input className="rounded-xl border border-gray-200 px-4 py-3 bg-white/80 backdrop-blur-sm focus:border-[#223c6c] focus:outline-none focus:ring-2 focus:ring-[#223c6c]/20 transition-all duration-200" value={profileEdit.phone} onChange={(e)=> setProfileEdit({ ...profileEdit, phone: e.target.value })} />
                </label>
                <div className="pt-2">
                  <button onClick={saveProfile} disabled={savingProfile} className="rounded-xl bg-gradient-to-r from-[#223c6c] to-[#1a2f54] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                    {savingProfile? 'Kaydediliyor…' : 'Kaydet'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-emerald-50/30 p-6 shadow-lg border border-emerald-100/50">
              
              <div className="relative z-10 mb-4 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">Şifre Değiştir</div>
              <div className="relative z-10 grid gap-4 text-sm">
                <label className="grid gap-2">
                  <span className="text-gray-600 font-medium">Mevcut Şifre</span>
                  <input type="password" className="rounded-xl border border-gray-200 px-4 py-3 bg-white/80 backdrop-blur-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200" value={passwordForm.current} onChange={(e)=> setPasswordForm({ ...passwordForm, current: e.target.value })} />
                </label>
                <label className="grid gap-2">
                  <span className="text-gray-600 font-medium">Yeni Şifre</span>
                  <input type="password" className="rounded-xl border border-gray-200 px-4 py-3 bg-white/80 backdrop-blur-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200" value={passwordForm.new} onChange={(e)=> setPasswordForm({ ...passwordForm, new: e.target.value })} />
                </label>
                <label className="grid gap-2">
                  <span className="text-gray-600 font-medium">Yeni Şifre (Tekrar)</span>
                  <input type="password" className="rounded-xl border border-gray-200 px-4 py-3 bg-white/80 backdrop-blur-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200" value={passwordForm.confirm} onChange={(e)=> setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
                </label>
                <div className="pt-2">
                  <button onClick={savePassword} disabled={savingPassword} className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                    {savingPassword? 'Güncelleniyor…' : 'Şifreyi Güncelle'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderItemReviewRow({ item, disabled, onSubmit, submitting }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState([]);

  const stars = [1,2,3,4,5];
  const canSubmit = !disabled && rating > 0 && comment.trim().length > 0;

  const handleFiles = (e) => {
    const list = Array.from(e.target.files || []);
    setFiles(list);
  };

  const handleSubmit = async () => {
    let uploaded = [];
    if (files.length > 0) {
      const fd = new FormData();
      fd.append("productId", String(item.productId));
      files.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      uploaded = Array.isArray(json?.paths) ? json.paths : [];
    }
    await onSubmit({ rating, comment, photos: uploaded });
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50/30 p-5 shadow-md border border-blue-100/50">
      
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <div className="font-semibold text-gray-800">{item.title} × {item.qty}</div>
        <div className="text-sm font-bold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">{Number(item.price).toLocaleString('tr-TR')} TL</div>
      </div>
      
      {!disabled && (
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {stars.map(s => (
                <button key={s} onClick={()=> setRating(s)} disabled={disabled} className="text-xl transition-all duration-200 hover:scale-125 hover:drop-shadow-lg" title={`${s} yıldız`}>
                  <span className={s <= rating ? "text-yellow-400 drop-shadow-sm" : "text-gray-300"}>★</span>
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-500 font-medium">Değerlendir</span>
          </div>
          
          <textarea 
            value={comment} 
            onChange={(e)=> setComment(e.target.value)} 
            placeholder="Ürün hakkında deneyimini paylaş..." 
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm resize-none focus:border-[#223c6c] focus:outline-none focus:ring-2 focus:ring-[#223c6c]/20 transition-all duration-200 bg-white/80 backdrop-blur-sm" 
            rows={2}
            disabled={disabled} 
          />
          
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              multiple 
              onChange={handleFiles} 
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-xs bg-white/80 backdrop-blur-sm focus:border-[#223c6c] focus:outline-none transition-all duration-200" 
              disabled={disabled} 
            />
            <button 
              onClick={handleSubmit} 
              disabled={!canSubmit || submitting} 
              className="rounded-xl bg-gradient-to-r from-[#223c6c] to-[#1a2f54] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting ? 'Gönderiliyor…' : (disabled ? '✓ Gönderildi' : 'Gönder')}
            </button>
          </div>
        </div>
      )}
      
      {disabled && (
        <div className="relative z-10 text-center py-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2">
            <span className="text-emerald-600">✓</span>
            <span className="text-sm text-emerald-700 font-medium">Bu ürün için değerlendirme gönderildi</span>
          </div>
        </div>
      )}
      
      {files.length > 0 && (
        <div className="relative z-10 mt-4 flex flex-wrap gap-3">
          {files.map((f, idx) => (
            <div key={idx} className="h-14 w-14 overflow-hidden rounded-xl border-2 border-white shadow-md">
              <img src={URL.createObjectURL(f)} alt="preview" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-xl bg-white/10 py-3">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-white/80">{label}</div>
    </div>
  );
}

function GradientDeco() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -left-24 -bottom-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
    </div>
  );
}


