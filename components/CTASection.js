export default function CTASection({ 
  backgroundImage = "/cta-bg.jpg"
}) {
  return (
    <section className="w-full my-16">
      <div 
        className="relative w-full h-[30vh] md:h-[60vh] bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${backgroundImage})`
        }}
      >
      </div>
    </section>
  );
}
