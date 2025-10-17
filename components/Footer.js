import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/mobilogo.png" alt="MobiShop" className="h-16 w-auto " />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Türkiye&apos;nin en büyük online alışveriş platformu. En kaliteli ürünleri en uygun fiyatlarla sunuyoruz.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fa-brands fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fa-brands fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fa-brands fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fa-brands fa-youtube text-xl"></i>
              </a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hızlı Linkler</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="text-gray-400 hover:text-white transition-colors">Tüm Ürünler</Link></li>
              <li><Link href="/products?category=kadın" className="text-gray-400 hover:text-white transition-colors">Kadın</Link></li>
              <li><Link href="/products?category=erkek" className="text-gray-400 hover:text-white transition-colors">Erkek</Link></li>
              <li><Link href="/products?category=çocuk" className="text-gray-400 hover:text-white transition-colors">Çocuk</Link></li>
              <li><Link href="/products?sale=true" className="text-gray-400 hover:text-white transition-colors">İndirimli Ürünler</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Müşteri Hizmetleri</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">İletişim</Link></li>
              <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Yardım Merkezi</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-white transition-colors">Kargo Bilgileri</Link></li>
              <li><Link href="/returns" className="text-gray-400 hover:text-white transition-colors">İade & Değişim</Link></li>
              <li><Link href="/size-guide" className="text-gray-400 hover:text-white transition-colors">Beden Rehberi</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">İletişim</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-phone text-gray-400"></i>
                <span className="text-gray-400">+90 (212) 555 0123</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-envelope text-gray-400"></i>
                <span className="text-gray-400">info@mobishop.com</span>
              </div>
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-map-marker-alt text-gray-400 mt-1"></i>
                <span className="text-gray-400">
                  Kazım Karabekir Mahallesi, Şehit Mehmet Ali Aslan Sokak<br />
                  , Etimesgut/Ankara
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 MobiShop. Tüm hakları saklıdır.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Gizlilik Politikası</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Kullanım Şartları</Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Çerez Politikası</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
