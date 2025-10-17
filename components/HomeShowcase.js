import HeroSlider from "./HeroSlider";
import Link from "next/link";

const heroHeight = "h-[30vh] md:h-[45vh] lg:h-[50vh] xl:h-[45vh] 2xl:h-[60vh]";

function PromoCard({ image, title, cta = "Shop Now", href = "/products" }) {
  return (
    <Link href={href} className={`relative block group overflow-hidden rounded-2xl h-full bg-gradient-to-br from-white to-gray-50/30 border border-gray-100/50 shadow-lg hover:shadow-xl transition-all duration-300`}>
      <div className="absolute inset-0">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
        <div className="mb-2 text-lg font-bold bg-gradient-to-r  text-white bg-clip-text drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">{title}</div>
        <span className="inline-flex items-center gap-2 rounded-xl bg-white/90 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-[#223c6c] shadow-md transition-all duration-200 group-hover:shadow-lg group-hover:scale-105">
          {cta}
          <i className="fa-solid fa-arrow-right text-xs" />
        </span>
      </div>
    </Link>
  );
}

export default function HomeShowcase() {
  return (
    <section className="w-full px-4 my-6 md:px-6">
      <div className="grid grid-cols-1 min-[1300px]:grid-cols-5 gap-6 items-stretch">
        <aside className="hidden min-[1300px]:block col-span-1">
          <PromoCard image="/login.png" title="Erkek Koleksiyonu" cta="Keşfet" href="/products?category=erkek" />
        </aside>

        <div className="col-span-1 min-[1300px]:col-span-3">
          <HeroSlider className={heroHeight} />
        </div>

        <aside className="hidden min-[1300px]:block col-span-1">
          <PromoCard image="/register.png" title="Kadın Koleksiyonu" cta="Keşfet" href="/products?category=kadın" />
        </aside>
      </div>
    </section>
  );
}



