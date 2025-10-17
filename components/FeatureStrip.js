export default function FeatureStrip() {
  const items = [
    {
      icon: "fa-truck-fast",
      title: "Ücretsiz Kargo",
      desc: "Ekstra ücret olmadan siparişleriniz kapınıza gelir.",
    },
    {
      icon: "fa-microphone-lines",
      title: "7/24 Destek",
      desc: "Müşteri destek ekibimiz günün her saati hizmetinizde.",
    },
    {
      icon: "fa-handshake",
      title: "Kolay İade",
      desc: "Memnun kalmazsanız kolayca iade edebilirsiniz.",
    },
    {
      icon: "fa-shield-halved",
      title: "Güvenli Ödeme",
      desc: "Güvenli ödeme altyapısı ile içiniz rahat olsun.",
    },
  ];

  return (
    <section className="px-4 md:px-6 my-8">
      <div className="rounded-2xl border border-dashed border-black/[.12] bg-white/70">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-black/[.08]">
          {items.map((it) => (
            <div key={it.title} className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-full border border-black/[.12] grid place-items-center text-[#223c6c]">
                <i className={`fa-solid ${it.icon}`} />
              </div>
              <div>
                <div className="font-semibold mb-1" style={{ color: "#223c6c" }}>{it.title}</div>
                <div className="text-sm text-black/70 max-w-[22ch]">{it.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


