function CategoryCard({ title, image, href = "/products" }) {
  return (
    <a href={href} className="group relative block rounded overflow-hidden">
      <div style={{ paddingTop: "100%" }} />
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
      <div className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/3 bg-white/30 rotate-[25deg] translate-x-0 group-hover:translate-x-[300%] transition-transform duration-700" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
        <span
          className="uppercase tracking-widest font-extrabold text-2xl lg:text-6xl md:text-5xl"
          style={{ WebkitTextStroke: "2px #ffffff", color: "transparent" }}
        >
          {title}
        </span>
        <span className="inline-block px-4 py-2 rounded text-xs font-semibold" style={{ backgroundColor: "#223c6c", color: "#ffffff" }}>
          Keşfet
        </span>
      </div>
    </a>
  );
}

export default function CategoryGrid() {
  const cards = [
    { title: "Kadın", image: "/category/kadinkategori.png" },
    { title: "Erkek", image: "/category/erkekkategori.png" },
    { title: "Çocuk", image: "/category/cocukkategori.png" },
  ];

  return (
    <section className="px-4 md:px-6 my-10">
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-6">
        {cards.map((c) => (
          <CategoryCard key={c.title} {...c} />
        ))}
      </div>
    </section>
  );
}


