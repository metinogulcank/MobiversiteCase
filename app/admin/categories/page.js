"use client";

import { useEffect, useState } from "react";

export default function AdminCategoriesPage() {
  const [catalog, setCatalog] = useState({ categories: {} });
  const [gender, setGender] = useState("kadın");
  const [group, setGroup] = useState("giyim");
  const [sub, setSub] = useState("");
  const [newGender, setNewGender] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/catalog");
      const json = await res.json();
      setCatalog(json);
      const genders = Object.keys(json.categories || {});
      if (genders.length) {
        setGender(genders[0]);
        const groups = Object.keys(json.categories[genders[0]] || {});
        if (groups.length) setGroup(groups[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addSub = async () => {
    if (!gender || !group || !sub.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/catalog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gender, group, sub: sub.trim() }) });
      setSub("");
      await load();
    } finally { setSaving(false); }
  };

  const addGender = async () => {
    if (!newGender.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/catalog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gender: newGender.trim(), group: null, sub: null }) });
      setNewGender("");
      await load();
    } finally { setSaving(false); }
  };

  const addGroup = async () => {
    if (!gender || !newGroup.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/catalog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gender, group: newGroup.trim(), sub: null }) });
      setNewGroup("");
      await load();
    } finally { setSaving(false); }
  };

  const removeSub = async (g, grp, s) => {
    setSaving(true);
    try {
      const qs = new URLSearchParams({ gender: g, group: grp, sub: s }).toString();
      await fetch(`/api/catalog?${qs}`, { method: "DELETE" });
      await load();
    } finally { setSaving(false); }
  };

  const removeGroup = async (g, grp) => {
    if (!confirm(`${g} / ${grp} grubunu silmek istiyor musunuz?`)) return;
    setSaving(true);
    try {
      const qs = new URLSearchParams({ gender: g, group: grp }).toString();
      await fetch(`/api/catalog?${qs}`, { method: "DELETE" });
      await load();
    } finally { setSaving(false); }
  };

  const removeGender = async (g) => {
    if (!confirm(`${g} ana kategorisini ve altındaki tüm grupları silmek istiyor musunuz?`)) return;
    setSaving(true);
    try {
      const qs = new URLSearchParams({ gender: g }).toString();
      await fetch(`/api/catalog?${qs}`, { method: "DELETE" });
      await load();
    } finally { setSaving(false); }
  };

  if (loading) return <div className="text-sm text-gray-600">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Kategoriler</h1>
          <p className="text-sm text-gray-500">Ana, orta ve alt kategorileri yönetin.</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-medium">Ana Kategori Ekle</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input value={newGender} onChange={(e)=> setNewGender(e.target.value)} placeholder="Örn: elektronik" className="rounded border border-gray-300 px-3 py-2 text-sm md:col-span-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button disabled={saving} onClick={addGender} className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60">Ekle</button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-medium">Orta Kategori (Grup) Ekle</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <select value={gender} onChange={(e)=> setGender(e.target.value)} className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {Object.keys(catalog.categories || {}).map((g)=> <option key={g} value={g}>{g}</option>)}
          </select>
          <input value={newGroup} onChange={(e)=> setNewGroup(e.target.value)} placeholder="Örn: telefon" className="rounded border border-gray-300 px-3 py-2 text-sm md:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button disabled={saving} onClick={addGroup} className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60">Ekle</button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-medium">Alt Kategori Ekle</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <select value={gender} onChange={(e)=> setGender(e.target.value)} className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {Object.keys(catalog.categories || {}).map((g)=> <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={group} onChange={(e)=> setGroup(e.target.value)} className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {Object.keys((catalog.categories || {})[gender] || {}).map((grp)=> <option key={grp} value={grp}>{grp}</option>)}
          </select>
          <input value={sub} onChange={(e)=> setSub(e.target.value)} placeholder="Alt kategori adı" className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button disabled={saving} onClick={addSub} className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60">Ekle</button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-medium">Mevcut Kategoriler</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Object.keys(catalog.categories || {}).map((g)=> (
            <div key={g} className="rounded-lg border border-gray-200 p-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase text-gray-700">{g}</div>
                <button onClick={()=> removeGender(g)} className="text-xs text-red-600 hover:text-red-700">Ana Kategoriyi Sil</button>
              </div>
              {Object.keys(catalog.categories[g] || {}).map((grp)=> (
                <div key={grp} className="mb-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium capitalize">{grp}</div>
                    <button onClick={()=> removeGroup(g, grp)} className="text-[11px] text-red-600 hover:text-red-700">Grubu Sil</button>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(catalog.categories[g][grp] || []).map((s)=> (
                      <span key={s} className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-50 px-2 py-1 text-xs">
                        <span className="text-gray-700">{s}</span>
                        <button title="Sil" onClick={()=> removeSub(g, grp, s)} className="grid h-4 w-4 place-items-center rounded-full bg-red-100 text-red-600 hover:bg-red-200">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
