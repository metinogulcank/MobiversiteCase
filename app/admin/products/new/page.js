"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createProduct, fetchCatalog, updateProduct } from "../../../../lib/api";
import { useRouter } from "next/navigation";

export default function AdminNewProductPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [categoriesSelected, setCategoriesSelected] = useState([]); 
  const [colorsSelected, setColorsSelected] = useState([]); 
  const [files, setFiles] = useState([]); 
  const [saving, setSaving] = useState(false);
  const [catalog, setCatalog] = useState({ categories: {}, colors: [] });
  const [sizesSelected, setSizesSelected] = useState([]);
  const [openGenders, setOpenGenders] = useState([]); 
  const [openGroups, setOpenGroups] = useState([]); 
  const [categorySearch, setCategorySearch] = useState("");
  const [colorSearch, setColorSearch] = useState("");
  const editorRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchCatalog();
        setCatalog({
          categories: data?.categories || {},
          colors: data?.colors || [],
          sizes: data?.sizes || [],
        });
      } catch (e) {
        setCatalog({ categories: {}, colors: [] });
      }
    }
    load();
  }, []);

  const previews = useMemo(() => {
    return files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [files]);

  const onFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const selected = Array.from(e.dataTransfer.files || []);
    setFiles((prev) => [...prev, ...selected]);
  };

  const reorder = (fromIndex, toIndex) => {
    setFiles((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr;
    });
  };

  const handleSave = async () => {
    if (!title || !price) return;
    setSaving(true);
    try {
      const basePayload = {
        title,
        price: Number(price),
        description,
        category: categoriesSelected.join(" "),
        colors: colorsSelected,
        sizes: sizesSelected,
        createdAt: new Date().toISOString(),
        sales: 0,
      };
      const saved = await createProduct(basePayload);

      const form = new FormData();
      form.append("productId", String(saved.id));
      files.forEach((f) => form.append("files", f));
      let uploaded = [];
      if (files.length) {
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const json = await res.json();
        uploaded = json?.paths || [];
      }

      const patch = {
        image: uploaded[0] || saved.image || "",
        gallery: uploaded,
      };
      await updateProduct(saved.id, patch);
      router.push("/admin/products");
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Yeni Ürün</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
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
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Kategoriler</label>
            <div className="mb-2">
              <input
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Kategorilerde ara..."
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="rounded border border-gray-300 p-3 max-h-[50vh] overflow-y-auto">
              {Object.keys(catalog.categories).map((gender) => {
                const genderOpen = openGenders.includes(gender);
                const toggleGender = () =>
                  setOpenGenders((prev) =>
                    prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender]
                  );
                return (
                  <div key={gender} className="mb-2">
                    <button type="button" onClick={toggleGender} className="flex w-full items-center justify-between text-left text-xs font-semibold capitalize text-gray-700">
                      <span>{gender}</span>
                      <i className={`fa-solid fa-chevron-${genderOpen ? "up" : "down"} text-[10px]`}></i>
                    </button>
                    <div className={`pl-2 overflow-hidden transition-all duration-300 ${genderOpen ? 'opacity-100' : 'opacity-0'}`} style={{ maxHeight: genderOpen ? 1000 : 0 }}>
                      <div className="mt-2 space-y-2">
                        {Object.keys(catalog.categories[gender]).map((grp) => {
                          const key = `${gender}:${grp}`;
                          const groupOpen = openGroups.includes(key);
                          const toggleGroup = () =>
                            setOpenGroups((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
                          const subs = catalog.categories[gender][grp].filter((sub) =>
                            (categorySearch || "").trim() === "" ? true : `${gender} ${grp} ${sub}`.toLowerCase().includes(categorySearch.toLowerCase())
                          );
                          return (
                            <div key={key}>
                              <button type="button" onClick={toggleGroup} className="flex w-full items-center justify-between text-left text-xs capitalize text-gray-600">
                                <span>{grp}</span>
                                <i className={`fa-solid fa-chevron-${groupOpen ? "up" : "down"} text-[10px]`}></i>
                              </button>
                              <div className={`pl-2 overflow-hidden transition-all duration-300 ${groupOpen ? 'opacity-100' : 'opacity-0'}`} style={{ maxHeight: groupOpen ? 600 : 0 }}>
                                <div className="mt-1 grid grid-cols-2 gap-1">
                                  {subs.map((sub) => {
                                    const value = `${gender} ${grp} ${sub}`.toLowerCase();
                                    const checked = categoriesSelected.includes(value);
                                    return (
                                      <label key={value} className="flex items-center gap-2 text-xs">
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={(e) => {
                                            if (e.target.checked) setCategoriesSelected((prev) => [...new Set([...prev, value])]);
                                            else setCategoriesSelected((prev) => prev.filter((v) => v !== value));
                                          }}
                                        />
                                        <span>{sub}</span>
                                      </label>
                                    );
                                  })}
                                  {subs.length === 0 && (
                                    <div className="col-span-2 text-[11px] text-gray-400">Sonuç yok</div>
                                  )}
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
            <div className="mb-2">
              <input
                value={colorSearch}
                onChange={(e) => setColorSearch(e.target.value)}
                placeholder="Renklerde ara..."
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-[30vh] overflow-y-auto">
              {catalog.colors
                .filter((c) => (colorSearch ? (c.label?.toLowerCase().includes(colorSearch.toLowerCase()) || c.value?.toLowerCase().includes(colorSearch.toLowerCase())) : true))
                .map((c) => {
                  const checked = colorsSelected.includes(c.value);
                  return (
                    <label key={c.value} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) setColorsSelected((prev) => [...new Set([...prev, c.value])]);
                          else setColorsSelected((prev) => prev.filter((v) => v !== c.value));
                        }}
                      />
                      <span className="inline-flex items-center gap-1">
                        <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: c.value }}></span>
                        {c.label}
                      </span>
                    </label>
                  );
                })}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Bedenler</label>
            <div className="grid grid-cols-3 gap-2 max-h-[24vh] overflow-y-auto">
              {(catalog.sizes || []).map((s) => {
                const checked = sizesSelected.includes(s);
                return (
                  <label key={s} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) setSizesSelected((prev) => [...new Set([...prev, s])]);
                        else setSizesSelected((prev) => prev.filter((v) => v !== s));
                      }}
                    />
                    <span>{s}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">Medya Yükle (çoklu)</label>
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center"
        >
          <input type="file" multiple accept="image/*,video/*" onChange={onFileChange} className="mb-3" />
          <div className="text-xs text-gray-500">Sürükleyip bırakabilir veya dosya seçebilirsiniz.</div>
        </div>

        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {previews.map((p, idx) => (
              <div key={idx} className="group relative rounded border border-gray-200 p-2">
                {p.file.type.startsWith("video/") ? (
                  <video src={p.url} className="h-full w-full rounded object-cover" controls />
                ) : (
                  <img src={p.url} alt={p.file.name} className="h-full w-full rounded object-cover" />
                )}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <button
                    disabled={idx === 0}
                    onClick={() => reorder(idx, idx - 1)}
                    className="rounded border px-2 py-1 disabled:opacity-40"
                  >
                    Yukarı
                  </button>
                  <button
                    disabled={idx === previews.length - 1}
                    onClick={() => reorder(idx, idx + 1)}
                    className="rounded border px-2 py-1 disabled:opacity-40"
                  >
                    Aşağı
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button onClick={() => router.push("/admin/products")} className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">İptal</button>
        <button disabled={saving} onClick={handleSave} className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </div>
  );
}


