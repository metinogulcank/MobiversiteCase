"use client";

import { useState, useEffect } from "react";
import { fetchCatalog } from "../lib/api";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function FilterBar({ filters, onFiltersChange }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState({
    category: true,
    price: true,
    color: true,
    size: true
  });
  const [catalog, setCatalog] = useState({ categories: {}, colors: [], sizes: [] });

  const [openGroups, setOpenGroups] = useState([]); 

  const [priceMinStr, setPriceMinStr] = useState(String(filters.priceRange?.[0] ?? 0));
  const [priceMaxStr, setPriceMaxStr] = useState(String(filters.priceRange?.[1] ?? 5000));

  useEffect(() => {
    const min = filters.priceRange?.[0] ?? 0;
    const max = filters.priceRange?.[1] ?? 5000;
    setPriceMinStr(String(min));
    setPriceMaxStr(String(max));
  }, [filters.priceRange]);

  useEffect(() => {
    const nextOpen = new Set(openGroups);
    (filters.category || []).forEach((val) => {
      const parts = String(val).toLowerCase().split(/\s+/);
      const gender = parts[0];
      const group = parts[1];
      const cats = catalog.categories || {};
      if (gender && group && cats[gender] && cats[gender][group]) {
        nextOpen.add(`${gender}:${group}`);
      }
    });
    setOpenGroups(Array.from(nextOpen));
  }, [filters.category, catalog]);

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
        setCatalog({ categories: {}, colors: [], sizes: [] });
      }
    }
    load();
  }, []);

  const toggleCategoryValue = (value) => {
    const currentValues = filters.category || [];
    const exists = currentValues.includes(value);
    let newValues = exists
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    const parts = String(value).toLowerCase().split(/\s+/).filter(Boolean);
    if (exists) {
      if (parts.length === 3) {
        const gender = parts[0];
        const group = `${parts[0]} ${parts[1]}`;
        if (!newValues.includes(gender)) newValues = [...new Set([...newValues, gender])];
        if (!newValues.includes(group)) newValues = [...new Set([...newValues, group])];
      } else if (parts.length === 2) {
        const gender = parts[0];
        if (!newValues.includes(gender)) newValues = [...new Set([...newValues, gender])];
      }
    }

    onFiltersChange({ ...filters, category: newValues });

    try {
      const params = new URLSearchParams(searchParams?.toString() || "");
      const toggled = String(value).toLowerCase();
      const current = (searchParams?.get("category") || "").toLowerCase();
      if (!exists) {
        params.set("category", toggled);
      } else if (current === toggled) {
        if (parts.length === 3) {
          params.set("category", `${parts[0]} ${parts[1]}`);
        } else if (parts.length === 2) {
          params.set("category", `${parts[0]}`);
        } else {
          params.delete("category");
        }
      }
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : `${pathname}`);
    } catch (e) {
    }
  };

  const toggleGroup = (gender, grp) => {
    const value = `${gender} ${grp}`;
    toggleCategoryValue(value);
    const key = `${gender}:${grp}`;
    setOpenGroups((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const colors = Array.isArray(catalog.colors) && catalog.colors.length ? catalog.colors : [
    { label: "Mavi", value: "#223c6c" },
    { label: "Siyah", value: "#000000" },
    { label: "Beyaz", value: "#ffffff" },
    { label: "Kırmızı", value: "#ff0000" },
    { label: "Yeşil", value: "#2a9d8f" },
    { label: "Sarı", value: "#e9c46a" },
    { label: "Turuncu", value: "#e76f51" },
    { label: "Mor", value: "#845ef7" },
    { label: "Gri", value: "#6c757d" }
  ];

  const sizes = Array.isArray(catalog.sizes) && catalog.sizes.length ? catalog.sizes : ["XS", "S", "M", "L", "XL", "XXL", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "Tek Beden"];

  const toggleFilter = (type, value) => {
    const currentValues = filters[type] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({
      ...filters,
      [type]: newValues
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: [],
      priceRange: [0, 5000],
      colors: [],
      sizes: []
    });
    setOpenGroups([]);
    setPriceMinStr("0");
    setPriceMaxStr("5000");

    try {
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.delete("category");
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : `${pathname}`);
    } catch (e) {
    }
  };

  const toggleSection = (section) => {
    setIsOpen(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">Filtreler</h3>
        <button 
          onClick={clearFilters}
          className="text-sm text-gray-500 hover:text-[#223c6c] transition-colors duration-200 font-medium"
        >
          Temizle
        </button>
      </div>

      <div className="mb-6">
        <button 
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full text-left font-semibold mb-3 text-gray-800 hover:text-[#223c6c] transition-colors duration-200"
        >
          <span>Kategori</span>
          <i className={`fa-solid fa-chevron-${isOpen.category ? 'up' : 'down'} text-sm transition-transform duration-200`}></i>
        </button>
        {isOpen.category && (
          <div className="space-y-4 max-h-[20vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              {Object.keys(catalog.categories || {}).map((g) => {
                const gKey = String(g).toLowerCase();
                const genderChecked = (filters.category || []).some((v) => {
                  const lc = String(v).toLowerCase();
                  return lc === gKey || lc.startsWith(`${gKey} `);
                });
                return (
                  <div key={g} className="w-full">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={genderChecked}
                        onChange={() => {
                          const willCheck = !genderChecked;
                          toggleCategoryValue(gKey);
                          if (!willCheck) {
                            setOpenGroups((prev) => prev.filter((k) => !k.startsWith(`${gKey}:`)));
                          }
                        }}
                        className="h-4 w-4 rounded border-2 border-gray-300 text-[#223c6c]"
                      />
                      <span className="text-sm font-medium">{String(g).charAt(0).toUpperCase()+String(g).slice(1)}</span>
                    </label>
                    <div
                      className={`pl-4 overflow-hidden transition-all ease-in-out duration-300 ${genderChecked ? 'opacity-100' : 'opacity-0'}`}
                      style={{ maxHeight: genderChecked ? 600 : 0 }}
                      aria-hidden={!genderChecked}
                    >
                      <div className="mt-2 space-y-2">
                        {Object.keys((catalog.categories || {})[g] || {}).map((grp) => {
                          const grpKey = String(grp).toLowerCase();
                          const value = `${gKey} ${grpKey}`;
                          const groupChecked = (filters.category || []).some((v) => {
                            const lc = String(v).toLowerCase();
                            return lc === value || lc.startsWith(`${value} `);
                          });
                          const key = `${gKey}:${grpKey}`;
                          const isOpenGrp = openGroups.includes(key);
                          const subs = ((catalog.categories || {})[g] || {})[grp] || [];
                          return (
                            <div key={value} className="w-full">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={groupChecked}
                                  onChange={() => toggleGroup(gKey, grpKey)}
                                  className="h-4 w-4 rounded border-2 border-gray-300 text-[#223c6c] "
                                />
                                <span className="text-sm">{String(grp).charAt(0).toUpperCase()+String(grp).slice(1)}</span>
                              </label>
                              <div
                                className={`pl-4 overflow-hidden transition-all ease-in-out duration-300 ${isOpenGrp ? 'opacity-100' : 'opacity-0'}`}
                                style={{ maxHeight: isOpenGrp ? 500 : 0 }}
                                aria-hidden={!isOpenGrp}
                              >
                                <div className="mt-2 grid grid-cols-1 gap-2">
                                  {subs.map((sub) => {
                                    const subVal = `${gKey} ${grpKey} ${String(sub).toLowerCase()}`;
                                    return (
                                      <label key={subVal} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={filters.category?.includes(subVal) || false}
                                          onChange={() => toggleCategoryValue(subVal)}
                                          className="h-4 w-4 rounded border-2 border-gray-300 text-[#223c6c] "
                                        />
                                        <span className="text-sm">{String(sub)}</span>
                                      </label>
                                    );
                                  })}
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
        )}
      </div>

      <div className="mb-6">
        <button 
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left font-semibold mb-3 text-gray-800 hover:text-[#223c6c] transition-colors duration-200"
        >
          <span>Fiyat Aralığı</span>
          <i className={`fa-solid fa-chevron-${isOpen.price ? 'up' : 'down'} text-sm transition-transform duration-200`}></i>
        </button>
        {isOpen.price && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Min"
                value={priceMinStr}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D+/g, "");
                  const cleaned = raw.replace(/^0+(?=\d)/, "");
                  setPriceMinStr(cleaned === "" ? "" : cleaned);
                }}
                onBlur={() => {
                  const min = Number(priceMinStr || 0);
                  const max = Number(priceMaxStr || 5000);
                  const normalizedMin = Math.max(0, Math.min(min, max));
                  setPriceMinStr(String(normalizedMin));
                  onFiltersChange({
                    ...filters,
                    priceRange: [normalizedMin, max]
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Max"
                value={priceMaxStr}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D+/g, "");
                  const cleaned = raw.replace(/^0+(?=\d)/, "");
                  setPriceMaxStr(cleaned === "" ? "" : cleaned);
                }}
                onBlur={() => {
                  const min = Number(priceMinStr || 0);
                  const max = Number(priceMaxStr || 5000);
                  const normalizedMax = Math.max(min, max);
                  setPriceMaxStr(String(normalizedMax));
                  onFiltersChange({
                    ...filters,
                    priceRange: [min, normalizedMax]
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm   transition-all duration-200"
              />
            </div>
            <div className="text-xs text-gray-500">
              {filters.priceRange?.[0] || 0} TL - {filters.priceRange?.[1] || 5000} TL
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <button 
          onClick={() => toggleSection('color')}
          className="flex items-center justify-between w-full text-left font-semibold mb-3 text-gray-800 hover:text-[#223c6c] transition-colors duration-200"
        >
          <span>Renk</span>
          <i className={`fa-solid fa-chevron-${isOpen.color ? 'up' : 'down'} text-sm transition-transform duration-200`}></i>
        </button>
        {isOpen.color && (
          <div className="grid grid-cols-3 gap-2">
            {colors.map(color => (
              <label key={color.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.colors?.includes(color.value) || false}
                  onChange={() => toggleFilter('colors', color.value)}
                  className="h-4 w-4 rounded border-2 border-gray-300 text-[#223c6c] "
                />
                <div className="flex items-center gap-1">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.value }}
                  ></div>
                  <span className="text-xs">{color.label}</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <button 
          onClick={() => toggleSection('size')}
          className="flex items-center justify-between w-full text-left font-semibold mb-3 text-gray-800 hover:text-[#223c6c] transition-colors duration-200"
        >
          <span>Beden</span>
          <i className={`fa-solid fa-chevron-${isOpen.size ? 'up' : 'down'} text-sm transition-transform duration-200`}></i>
        </button>
        {isOpen.size && (
          <div className="grid grid-cols-3 gap-2">
            {sizes.map(size => (
              <label key={size} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.sizes?.includes(size) || false}
                  onChange={() => toggleFilter('sizes', size)}
                  className="h-4 w-4 rounded border-2 border-gray-300 text-[#223c6c]"
                />
                <span className="text-xs">{size}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

