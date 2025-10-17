# MobiShop - Kurumsal Teknik Dokümantasyon

MobiShop; modern, ölçeklenebilir ve kullanıcı deneyimi odaklı bir e-ticaret uygulamasıdır. Proje; Next.js (App Router), Tailwind CSS, json-server tabanlı mock API ve Stripe test entegrasyonu ile geliştirilmiştir. Aşağıdaki bölümlerde, sistemin modülleri ve işlevleri kurumsal bir dille özetlenmiştir.

## İçindekiler
- Özellik Özeti
- Kurulum ve Çalıştırma
- Mimari Genel Bakış
- Modüller ve İşlevler
  - Admin
  - Ana Sayfa
  - Ürünler
  - Ürün Detayı
  - İstek Listesi
  - Sepet
  - Ödeme
  - Profil
- Veri Kaynakları ve Entegrasyonlar
- Teknik Notlar

---

## Özellik Özeti

### Admin
- [x] Dinamik Ürün Ekleme / Düzenleme / Silme
- [x] Dinamik Kategori Ekleme / Düzenleme / Silme
- [x] Dinamik Sipariş Yönetimi (durum akışı: Sipariş alındı → Sipariş hazırlanıyor → Kargoya verildi → Teslim edildi, iptal işlemleri)
- [x] Dashboard (Toplam gelir, toplam sipariş, kullanıcı sayısı, toplam ürün sayısı; son siparişler ve en çok satanlar özetleri)

### Ana Sayfa
- [x] Dinamik Header (Admin panel üzerinden yönetilen kategorileri otomatik olarak görüntüler)
- [x] En Son Eklenen Ürünler (son 10 ürün, responsive carousel)
- [x] Öneriler (kullanıcının gezdiği ürün kategorisi/cinsiyetine göre öneriler)

### Ürünler Sayfası
- [x] Dinamik kategori kontrolü (hiyerarşik yapı desteği)
- [x] Kategori, Renk, Beden, Fiyat aralığı bazlı arama/filtreleme
- [x] Seçilen özelliğe göre sıralama (yeniden eskiye, fiyata göre, satışa göre vb.)
- [x] Mobil/Tablet’te açılır “FilterBar” çekmecesi, Desktop’ta sabit kenar çubuğu

### Ürün Detayı
- [x] Öneriler: Önce aynı kategori, yetmezse üst kategori, yine yetmezse en yeniler ile 10 ürüne tamamlanır
- [x] Dinamik yorumlar (review görselleri lightbox ile)
- [x] Dinamik değerlendirme (ortalama puan ve yorum adedi)

### İstek Listesi
- [x] Veritabanı üzerinden kullanıcının favorilerini sorgulama
- [x] Kullanıcının eklediği fiyattan daha ucuza düşmüşse indirim göstergesi

### Sepet
- [x] Seçili ürünlerin fiyatlarını toplama
- [x] 300₺ üzeri kargo ücretsiz
- [x] 300₺ altı siparişlerde kargo ücreti ekleme (79₺)
- [x] Variant (renk/beden) bilinçli sepet kalemleri, mobil uyumlu modern arayüz

### Ödeme Ekranı
- [x] Stripe ile ödeme simülasyonu (3D Secure benzeri akış)
- [x] Başarılı yanıt sonrası sipariş oluşturma ve ürün satış adedini arttırma

### Profil
- [x] Kullanıcı bilgilerinin güncellenmesi (e-posta değişiminde bağlı verilerin senkronizasyonu)
- [x] Satın alınan ürünler için değerlendirme ve fotoğraflı yorum
- [x] Şifre güncelleme simülasyonu

---

## Kurulum ve Çalıştırma

1. Bağımlılıkların kurulumu:
```bash
npm install
```

2. Mock API (json-server) başlatma:
```bash
npm run server
# http://localhost:4000 üzerinde yayınlanır
```

3. Uygulamayı başlatma:
```bash
npm run dev
# http://localhost:3000 üzerinde yayınlanır
```

Çevresel değişken: `NEXT_PUBLIC_API_URL` tanımlı değilse varsayılan olarak `http://localhost:4000` kullanılır.

---

## Mimari Genel Bakış

- Next.js App Router mimarisi
- Client/Server Component ayrımı
- Tailwind CSS ile modern, responsive ve tutarlı tasarım
- Context tabanlı durum yönetimi: `AuthContext`, `CartContext`, `WishlistContext`
- json-server ile mock REST API (ürünler, siparişler, kullanıcılar, yorumlar, kategori verileri)
- Stripe test entegrasyonu ile ödeme simülasyonu

Klasör yapısı (özet):
- `app/` sayfalar ve route bileşenleri
- `components/` paylaşılan UI bileşenleri (Header, Footer, ProductCard, Carousel’ler vb.)
- `context/` global durum sağlayıcıları
- `lib/` API istemcisi ve yardımcı fonksiyonlar
- `public/` statik dosyalar

---

## Modüller ve İşlevler

### Admin
- Ürün Yönetimi: Listeleme, arama, ekleme, düzenleme, silme. Rich text açıklama, çoklu görsel/video yükleme, sürükle-bırak medya sıralama.
- Kategori Yönetimi: Hiyerarşik kategori (ana/orta/alt) ekleme, düzenleme, silme.
- Sipariş Yönetimi: Durum akışı yönetimi, sipariş detayları, iptal.
- Dashboard: Toplam gelir, sipariş sayısı, kullanıcı sayısı (users endpoint yoksa siparişlerden türetilir), toplam ürün sayısı, son siparişler, en çok satan ürünler.

### Ana Sayfa
- Dinamik Header: Kategoriler json-server’dan çekilir ve Header’da otomatik güncellenir.
- Çok Satanlar / Yeni Ürünler: Responsive carousel; 2 (mobil), 3 (tablet), 4 (1300–1600px), 5 (1600px+) kolon.
- Öneriler: Kullanıcı gezinimine ve kategori/cinsiyet bağlamına göre öneriler.

### Ürünler
- FilterBar: Dinamik kategori/renk/beden listeleri; fiyat aralığı; URL senkronizasyonu; animasyonlu hiyerarşi.
- ProductGrid: Sıralama (tarih, fiyat, satış), sayfalama, dinamik değerlendirme ve yorum sayıları.

### Ürün Detayı
- Galeri: Yakınlaştırma, küçük görseller, kaydırma okları.
- Bilgi kartları, dinamik değerlendirme ve yorumlar (fotoğraflı, lightbox).
- Öneriler: Aynı kategori → üst kategori → en yeni ürünler ile 10 öğe.

### İstek Listesi
- Giriş zorunluluğu; favoriye ekleme/çıkarma; fiyat düşüş göstergesi.

### Sepet ve Ödeme
- Variant duyarlı sepet; toplam ve kargo hesaplama; responsive arayüz.
- Stripe test akışı; onay sonrası sipariş oluşturma ve ürün satış adedi güncelleme.

### Profil
- Bilgiler ve şifre güncelleme; satın alınan ürünlere puan/yorum ve fotoğraf ekleme.

---

## Veri Kaynakları ve Entegrasyonlar

- json-server (REST): `products`, `orders`, `users`, `wishlist`, `carts`, `reviews`, `catalog`
- API istemcisi: `lib/api.js` (Axios)
- Güvenlik yardımcıları: `lib/security.js`
- Statik medya yükleme: `/api/upload` uç noktası ve `public/products/{id}/` klasör hiyerarşisi

---

## Teknik Notlar

- Carousel’lerde responsive kolon hesaplama ve `ResizeObserver` ile esnek genişlik yönetimi.
- Hydration uyarılarına karşı `suppressHydrationWarning` gövde seviyesinde dev ortam optimizasyonu.
- Kullanıcı sayısı; `users` uç noktası yok ise siparişlerdeki benzersiz e-posta adreslerinden türetilir.
- Ürün satış metriği: Ödeme onayı sonrası satın alınan miktar kadar `sales` artırılır.

Kurulum veya özelliklerle ilgili sorularınız için lütfen proje içi dokümantasyonu ve yorumları inceleyiniz.
