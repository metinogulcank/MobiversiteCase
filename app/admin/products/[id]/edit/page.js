"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProduct, updateProduct, fetchCatalog } from "../../../../../lib/api";

export default function AdminEditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState(null);
  const [catalog, setCatalog] = useState({ categories: {}, colors: [], sizes: [] });
  const [openGenders, setOpenGenders] = useState([]);
  const [openGroups, setOpenGroups] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [p, c] = await Promise.all([fetchProduct(id), fetchCatalog()]);
        setProduct(p);
        setCatalog({ categories: c?.categories || {}, colors: c?.colors || [], sizes: c?.sizes || [] });
      } catch (e) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [colorsSelected, setColorsSelected] = useState([]);
  const [sizesSelected, setSizesSelected] = useState([]);
  const [categoriesSelected, setCategoriesSelected] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]); 
  const [uploading, setUploading] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!product) return;
    setTitle(product.title || "");
    setPrice(String(product.price ?? ""));
    setDescription(product.description || "");
    setColorsSelected(Array.isArray(product.colors) ? product.colors : []);
    setSizesSelected(Array.isArray(product.sizes) ? product.sizes : []);
    const catStr = String(product.category || "");
    const tokens = catStr.split(/\s+/).filter(Boolean);
    const full = [];
    for (let i = 0; i < tokens.length; i += 3) {
      const chunk = tokens.slice(i, i + 3).join(" ");
      if (chunk.split(" ").length === 3) full.push(chunk.toLowerCase());
    }
    setCategoriesSelected(full.length ? full : [catStr.toLowerCase()]);
    const initialGallery = Array.isArray(product.gallery) && product.gallery.length
      ? product.gallery
      : (product.image ? [product.image] : []);
    setGalleryItems(initialGallery.map((u, i) => ({ type: 'url', url: u, key: `url-${i}` })));
  }, [product]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const files = galleryItems.filter((g) => g.type === 'file').map((g) => g.file);
      let uploaded = [];
      if (files.length) {
        setUploading(true);
        const form = new FormData();
        form.append('productId', String(id));
        files.forEach((f) => form.append('files', f));
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        const json = await res.json();
        uploaded = json?.paths || [];
        setUploading(false);
      }

      const urls = [];
      let upIdx = 0;
      for (const item of galleryItems) {
        if (item.type === 'url') urls.push(item.url);
        else urls.push(uploaded[upIdx++] || item.url);
      }

      await updateProduct(id, {
        title,
        price: Number(price),
        description,
        colors: colorsSelected,
        sizes: sizesSelected,
        category: categoriesSelected.join(" "),
        image: urls[0] || product.image || "",
        gallery: urls
      });
      router.push("/admin/products");
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (!product) return <div>Ürün bulunamadı</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Ürün Düzenle #{id}</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Ürün Başlığı</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Fiyat</label>
            <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Açıklama</label>
            <div className="mb-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => { editorRef.current?.focus(); document.execCommand('bold'); }} className="rounded border px-2 py-1 text-xs hover:bg-gray-50">Kalın</button>
              <button type="button" onClick={() => { editorRef.current?.focus(); document.execCommand('italic'); }} className="rounded border px-2 py-1 text-xs hover:bg-gray-50">İtalik</button>
              <button type="button" onClick={() => { editorRef.current?.focus(); document.execCommand('underline'); }} className="rounded border px-2 py-1 text-xs hover:bg-gray-50">Altı çizili</button>
              <button type="button" onClick={() => { editorRef.current?.focus(); document.execCommand('insertUnorderedList'); }} className="rounded border px-2 py-1 text-xs hover:bg-gray-50">• Liste</button>
              <button type="button" onClick={() => { editorRef.current?.focus(); document.execCommand('insertOrderedList'); }} className="rounded border px-2 py-1 text-xs hover:bg-gray-50">1. Liste</button>
              <button type="button" onClick={() => { const url = prompt('Bağlantı URL'); if (url) { editorRef.current?.focus(); document.execCommand('createLink', false, url); } }} className="rounded border px-2 py-1 text-xs hover:bg-gray-50">Link</button>
              <button type="button" onClick={() => { editorRef.current?.focus(); document.execCommand('removeFormat'); }} className="rounded border px-2 py-1 text-xs hover:bg-gray-50">Temizle</button>
            </div>
            <div
              ref={editorRef}
              tabIndex={0}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => setDescription(e.currentTarget.innerHTML)}
              className="min-h-[160px] w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none [&_*_ul]:list-disc [&_*_ol]:list-decimal [&_*_li]:ml-4"
              dangerouslySetInnerHTML={{ __html: description }}
            />
            <div className="mt-1 text-[11px] text-gray-500">Zengin metin; kayıtta HTML olarak saklanır.</div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Galeri</label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => {
                const incoming = Array.from(e.target.files || []).map((f, i) => ({ type: 'file', file: f, key: `file-${Date.now()}-${i}` }));
                setGalleryItems((prev) => [...prev, ...incoming]);
              }}
              className="mb-2"
            />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {galleryItems.map((g, idx) => (
                <div key={g.key} className="rounded border p-2">
                  {String(g.url || g.file?.name).toLowerCase().endsWith('.mp4') ? (
                    <video src={g.url || URL.createObjectURL(g.file)} className="h-full w-full rounded object-cover" controls />
                  ) : (
                    <img src={g.url || URL.createObjectURL(g.file)} className="h-full w-full rounded object-cover" />
                  )}
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <button disabled={idx===0} onClick={() => setGalleryItems((prev)=>{ const arr=[...prev]; const [m]=arr.splice(idx,1); arr.splice(idx-1,0,m); return arr; })} className="rounded border px-2 py-1 disabled:opacity-40">Yukarı</button>
                    <button disabled={idx===galleryItems.length-1} onClick={() => setGalleryItems((prev)=>{ const arr=[...prev]; const [m]=arr.splice(idx,1); arr.splice(idx+1,0,m); return arr; })} className="rounded border px-2 py-1 disabled:opacity-40">Aşağı</button>
                    <button onClick={() => setGalleryItems((prev)=> prev.filter((_,i)=> i!==idx))} className="rounded border px-2 py-1 text-red-600">Sil</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Kategoriler</label>
            <input value={categorySearch} onChange={(e)=>setCategorySearch(e.target.value)} placeholder="Kategorilerde ara..." className="mb-2 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            <div className="rounded border p-3 max-h-[40vh] overflow-y-auto">
              {Object.keys(catalog.categories).map((gender)=>{
                const gOpen = openGenders.includes(gender);
                return (
                  <div key={gender} className="mb-2">
                    <button type="button" onClick={()=> setOpenGenders((prev)=> prev.includes(gender)? prev.filter(x=>x!==gender): [...prev, gender])} className="flex w-full items-center justify-between text-left text-xs font-semibold capitalize">
                      <span>{gender}</span>
                      <i className={`fa-solid fa-chevron-${gOpen? 'up':'down'} text-[10px]`}></i>
                    </button>
                    <div className={`pl-2 overflow-hidden transition-all duration-300 ${gOpen? 'opacity-100':'opacity-0'}`} style={{ maxHeight: gOpen? 1000: 0 }}>
                      <div className="mt-2 space-y-2">
                        {Object.keys(catalog.categories[gender]).map((grp)=>{
                          const key = `${gender}:${grp}`;
                          const grpOpen = openGroups.includes(key);
                          const subs = catalog.categories[gender][grp].filter((sub)=> (categorySearch? `${gender} ${grp} ${sub}`.toLowerCase().includes(categorySearch.toLowerCase()): true));
                          return (
                            <div key={key}>
                              <button type="button" onClick={()=> setOpenGroups((prev)=> prev.includes(key)? prev.filter(k=>k!==key): [...prev, key])} className="flex w-full items-center justify-between text-left text-xs capitalize">
                                <span>{grp}</span>
                                <i className={`fa-solid fa-chevron-${grpOpen? 'up':'down'} text-[10px]`}></i>
                              </button>
                              <div className={`pl-2 overflow-hidden transition-all duration-300 ${grpOpen? 'opacity-100':'opacity-0'}`} style={{ maxHeight: grpOpen? 600: 0 }}>
                                <div className="mt-1 grid grid-cols-2 gap-1">
                                  {subs.map((sub)=>{
                                    const value = `${gender} ${grp} ${sub}`.toLowerCase();
                                    const checked = categoriesSelected.includes(value);
                                    return (
                                      <label key={value} className="flex items-center gap-2 text-xs">
                                        <input type="checkbox" checked={checked} onChange={(e)=> {
                                          if (e.target.checked) setCategoriesSelected((prev)=> [...new Set([...prev, value])]);
                                          else setCategoriesSelected((prev)=> prev.filter((v)=> v!== value));
                                        }} />
                                        <span>{sub}</span>
                                      </label>
                                    );
                                  })}
                                  {subs.length===0 && <div className="col-span-2 text-[11px] text-gray-400">Sonuç yok</div>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Renkler</label>
            <div className="grid grid-cols-2 gap-2 max-h-[24vh] overflow-y-auto">
              {catalog.colors.map((c) => (
                <label key={c.value} className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={colorsSelected.includes(c.value)} onChange={(e) => {
                    if (e.target.checked) setColorsSelected((prev) => [...new Set([...prev, c.value])]);
                    else setColorsSelected((prev) => prev.filter((v) => v !== c.value));
                  }} />
                  <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-full border" style={{ backgroundColor: c.value }}></span>{c.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Bedenler</label>
            <div className="grid grid-cols-3 gap-2 max-h-[24vh] overflow-y-auto">
              {catalog.sizes.map((s) => (
                <label key={s} className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={sizesSelected.includes(s)} onChange={(e) => {
                    if (e.target.checked) setSizesSelected((prev) => [...new Set([...prev, s])]);
                    else setSizesSelected((prev) => prev.filter((v) => v !== s));
                  }} />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={() => router.push("/admin/products")} className="rounded border px-3 py-2 text-sm">İptal</button>
        <button disabled={saving} onClick={handleSave} className="rounded bg-blue-600 px-3 py-2 text-sm text-white">Kaydet</button>
      </div>
    </div>
  );
}


