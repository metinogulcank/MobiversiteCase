
import Link from "next/link";
import { fetchProduct, fetchProducts, fetchProductReviews } from "../../../lib/api";
import RecCard from "../../../components/RecCard";
import { notFound } from "next/navigation";
import AddActions from "./product-actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

export default async function ProductDetail({ params }) {
  const { id } = await params;
  let product = null;
  try {
    product = await fetchProduct(id);
  } catch (_) {}
  if (!product) return notFound();

  const gallery = Array.isArray(product.gallery) && product.gallery.length ? product.gallery : [product.image];
  let reviews = [];
  try { reviews = await fetchProductReviews(product.id); } catch (_) { reviews = []; }
  const reviewCount = reviews.length;
  const rating = reviewCount > 0 ? (reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviewCount) : 0;
  const price = Number(product.price);
  const colors = Array.isArray(product.colors) ? product.colors : [];
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="px-4 md:px-6">
        <nav className="mx-auto max-w-7xl py-4 text-sm text-neutral-500">
          <Link href="/" className="hover:underline">Anasayfa</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:underline">Ürünler</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-800">{product.title}</span>
        </nav>
        
        <div id="details" className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-6 lg:gap-10 lg:grid-cols-2">
          <div className="h-full lg:sticky lg:top-24">
            <ImageGallery images={gallery} title={product.title} />
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/30 p-4 md:p-6 lg:p-8 shadow-lg border border-blue-100/50">
            <div className="relative z-10">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#223c6c]/10 px-2.5 py-1 text-xs font-medium text-[#223c6c]">Öne Çıkan</span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">Stokta</span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">{product.title}</h1>
              <div className="mt-2 text-sm text-neutral-500">{product.category}</div>
              <div className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
                <Stars value={rating} />
                <span>{rating.toFixed(1)}</span>
                <span className="text-neutral-400">( {reviewCount} yorum )</span>
              </div>
              <div className="mt-6 text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">{price.toLocaleString("tr-TR")} TL</div>

              <div className="mt-6">
                <AddActions product={product} />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="text-sm text-neutral-500">Paylaş:</div>
                <a className="text-[#223c6c] hover:opacity-80" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(product.title)}`} target="_blank"><i className="fa-brands fa-x-twitter"></i></a>
                <a className="text-[#223c6c] hover:opacity-80" href={`https://www.facebook.com/sharer/sharer.php?u=`} target="_blank"><i className="fa-brands fa-facebook"></i></a>
                <a className="text-[#223c6c] hover:opacity-80" href={`https://wa.me/?text=${encodeURIComponent(product.title)}`} target="_blank"><i className="fa-brands fa-whatsapp"></i></a>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3">
                <InfoCard icon="fa-truck" title="Aynı Gün Kargo" desc="16:00'a kadar verilen siparişlerde." />
                <InfoCard icon="fa-box" title="300 TL ve Üzeri Ücretsiz Kargo" desc="Sepet tutarına göre ücretsiz gönderim." />
                <InfoCard icon="fa-rotate-left" title="14 Gün İade" desc="Koşulsuz iade garantisi." />
              </div>
            </div>
          </div>
        </div>

        <section className="mx-auto max-w-7xl pt-8 pb-6">
          <h2 className="mb-4 text-xl md:text-2xl font-semibold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">Ürün Açıklaması</h2>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 p-4 md:p-6 shadow-lg border border-gray-100/50">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: String(product.description || "").replace(/\n/g, "<br/>") }} />
          </div>
        </section>

        <section className="mx-auto max-w-7xl py-6">
          <h2 className="mb-4 text-xl md:text-2xl font-semibold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">Yorumlar</h2>
          {reviews.length === 0 ? (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 p-4 md:p-6 text-sm text-neutral-600 shadow-lg border border-gray-100/50">Henüz yorum bulunmuyor.</div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 p-4 md:p-6 shadow-lg border border-gray-100/50">
              <ul className="divide-y">
                {reviews.map((rv, idx) => (
                  <li key={idx} className="py-4">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <div className="font-medium text-neutral-900">{rv.userEmail || 'Kullanıcı'}</div>
                      <Stars value={Number(rv.rating || 0)} />
                    </div>
                    {rv.comment && <div className="text-sm text-neutral-700">{rv.comment}</div>}
                    {Array.isArray(rv.photos) && rv.photos.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {rv.photos.map((src, pidx)=> (
                          <button key={pidx} data-review-img={src} className="h-16 w-16 overflow-hidden rounded border">
                            <img src={src} alt="review" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <LightboxScript />
              <div id="lightbox" className="fixed inset-0 z-50 hidden place-items-center bg-black/70 p-6">
                <button id="lightbox-close" className="absolute right-4 top-4 h-9 w-9 rounded-full bg-white/90"><i className="fa-solid fa-xmark"></i></button>
                <img id="lightbox-img" src="" alt="review" className="max-h-[85vh] max-w-[90vw] rounded shadow" />
              </div>
            </div>
          )}
        </section>

        <section className="mx-auto max-w-7xl py-6">
          <h2 className="mb-4 text-xl md:text-2xl font-semibold bg-gradient-to-r from-[#223c6c] to-[#1a2f54] bg-clip-text text-transparent">Bunları da beğenebilirsiniz</h2>
          <Recommendations currentId={id} currentCategory={product.category} />
        </section>
      </div>
    </div>
  );
}

function Stars({ value = 0 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <i key={i} className="fa-solid fa-star" />;
        if (i === full && half) return <i key={i} className="fa-regular fa-star-half-stroke" />;
        return <i key={i} className="fa-regular fa-star" />;
      })}
    </div>
  );
}

function InfoCard({ icon, title, desc }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/30 p-4 shadow-lg border border-blue-100/50">
      <div className="relative z-10 flex items-start gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#223c6c]/10 text-[#223c6c]">
          <i className={`fa-solid ${icon}`} />
        </span>
        <div>
          <div className="font-medium text-neutral-900">{title}</div>
          <div className="text-sm text-neutral-600">{desc}</div>
        </div>
      </div>
    </div>
  );
}

function ImageGallery({ images, title }) {
  return (
    <div className="w-full max-w-[400px] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[650px] mx-auto flex flex-col items-center justify-center">
      <GalleryScript />
      <div
        id="main-image"
        className="overflow-hidden rounded-2xl border border-gray-200 p-4 md:p-6 bg-white shadow-lg"
        style={{ 
          borderColor: "#e5e7eb", 
          width: "100%", 
          aspectRatio: "1/1",
          maxWidth: "650px"
        }}
      >
        <img src={images[0]} alt={title} className="h-full w-full object-cover transition-transform duration-300" />  
      </div>
      <div className="mt-3 w-full max-w-[400px] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[650px]">
        <div className="relative">
          <button id="thumb-left" className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white shadow hover:shadow-md"><i className="fa-solid fa-chevron-left"></i></button>
          <div id="thumbs" className="mx-10 flex gap-2 md:gap-3 overflow-x-auto scroll-smooth">
            {images.map((src, idx) => (
              <button
                key={idx}
                className="min-w-[70px] md:min-w-[90px] aspect-square overflow-hidden rounded-lg border border-gray-200 hover:border-[#223c6c] transition-colors duration-200"
                data-image-role="thumb"
                data-image-src={src}
              >
                <img src={src} alt={`${title}-${idx}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <button id="thumb-right" className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white shadow hover:shadow-md"><i className="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>
    </div>
  );
}

function GalleryScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('click', function(e){
            const btn = e.target.closest('[data-image-role="thumb"]');
            if(!btn) return;
            const src = btn.getAttribute('data-image-src');
            const main = document.querySelector('#main-image img');
            if(main && src){ main.src = src; }
          });

          const mainWrap = document.getElementById('main-image');
          if(mainWrap){
            const img = mainWrap.querySelector('img');
            let zooming = false;
            mainWrap.addEventListener('mouseenter', ()=>{
              const src = img.getAttribute('src');
              mainWrap.style.backgroundImage = 'url(' + src + ')';
              mainWrap.style.backgroundRepeat = 'no-repeat';
              mainWrap.style.backgroundSize = '200%';
              img.style.opacity = '0';
              zooming = true;
            });
            mainWrap.addEventListener('mousemove', (ev)=>{
              if(!zooming) return;
              const rect = mainWrap.getBoundingClientRect();
              const x = ((ev.clientX - rect.left) / rect.width) * 100;
              const y = ((ev.clientY - rect.top) / rect.height) * 100;
              mainWrap.style.backgroundPosition = x + '% ' + y + '%';
            });
            const stop = ()=>{
              zooming = false;
              mainWrap.style.backgroundImage = '';
              img.style.opacity = '1';
            };
            mainWrap.addEventListener('mouseleave', stop);
            document.addEventListener('click', function(e){
              const btn = e.target.closest('[data-image-role="thumb"]');
              if(!btn) return;
              const src = btn.getAttribute('data-image-src');
              if(zooming){ mainWrap.style.backgroundImage = 'url(' + src + ')'; }
            });
            const leftBtn = document.getElementById('thumb-left');
            const rightBtn = document.getElementById('thumb-right');
            const strip = document.getElementById('thumbs');
            leftBtn && leftBtn.addEventListener('click', ()=> strip && strip.scrollBy({ left: -300, behavior: 'smooth' }));
            rightBtn && rightBtn.addEventListener('click', ()=> strip && strip.scrollBy({ left: 300, behavior: 'smooth' }));
          }
        `,
      }}
    />
  );
}

function LightboxScript() {
  return (
    <script dangerouslySetInnerHTML={{ __html: `
      (function(){
        document.addEventListener('click', function(e){
          const btn = e.target.closest('[data-review-img]');
          if(!btn) return;
          const src = btn.getAttribute('data-review-img');
          const box = document.getElementById('lightbox');
          const img = document.getElementById('lightbox-img');
          if (!box || !img) return;
          img.src = src;
          box.classList.remove('hidden');
          box.classList.add('grid');
        });
        const close = ()=>{
          const box = document.getElementById('lightbox');
          if(!box) return;
          box.classList.add('hidden');
          box.classList.remove('grid');
        };
        document.addEventListener('click', function(e){
          if(e.target && (e.target.id === 'lightbox' || e.target.id === 'lightbox-close')) close();
        });
        document.addEventListener('keydown', function(e){ if(e.key === 'Escape') close(); });
      })();
    ` }} />
  );
}

async function Recommendations({ currentId, currentCategory }) {
  let items = [];
  try { items = await fetchProducts(); } catch (_){ items = []; }
  const others = items.filter((p) => String(p.id) !== String(currentId));

  const normalize = (s) => String(s || '').trim().toLowerCase();
  const parts = normalize(currentCategory).split(/\s+/).filter(Boolean);

  let picked = [];
  if (parts.length > 0) {
    const full = parts.join(' ');
    const sameCat = others.filter(p => normalize(p.category) === full);
    picked.push(...sameCat);

    for (let cut = parts.length - 1; cut >= 1 && picked.length < 10; cut--) {
      const parent = parts.slice(0, cut).join(' ');
      const parentMatches = others.filter(p => normalize(p.category) === parent && !picked.includes(p));
      picked.push(...parentMatches);
    }
  }

  if (picked.length < 10) {
    const newest = [...others]
      .filter(p => !picked.includes(p))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    picked.push(...newest);
  }

  const show = picked.slice(0, 10);

  return (
    <div className="relative">
      <button type="button" data-rec="left" className="absolute left-0 top-1/2 z-10 -translate-y-1/2 h-9 w-9 rounded-full border bg-white shadow hover:shadow-md"><i className="fa-solid fa-chevron-left"></i></button>
      <div id="rec-strip" className="mx-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {show.map((p) => (
          <RecCard key={p.id} product={p} />
        ))}
      </div>
      <button type="button" data-rec="right" className="absolute right-0 top-1/2 z-10 -translate-y-1/2 h-9 w-9 rounded-full border bg-white shadow hover:shadow-md"><i className="fa-solid fa-chevron-right"></i></button>
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          function onClick(e){
            const btn = e.target.closest('[data-rec]');
            if(!btn) return;
            e.preventDefault();
            const dir = btn.getAttribute('data-rec');
            const strip = document.getElementById('rec-strip');
            if(!strip) return;
            const card = strip.querySelector('[data-card]');
            const gap = 16; 
            const step = card ? (card.getBoundingClientRect().width + gap) : 240;
            const delta = dir === 'left' ? -step : step;
            strip.scrollBy({ left: delta, behavior: 'smooth' });
          }
          document.addEventListener('click', onClick);
        })();
      ` }} />
    </div>
  );
}


