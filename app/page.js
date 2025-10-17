import HomeShowcase from "../components/HomeShowcase";
import FeatureStrip from "../components/FeatureStrip";
import CategoryGrid from "../components/CategoryGrid";
import BestSellersCarousel from "../components/BestSellersCarousel";
import CTASection from "../components/CTASection";
import CategoryProducts from "../components/CategoryProducts";
import NewProductsCarousel from "../components/NewProductsCarousel";

export default function Home() {
  return (
    <div className="w-full">
      <HomeShowcase />
      <FeatureStrip />
      <CategoryGrid />
      <BestSellersCarousel />
      <NewProductsCarousel />
      <CTASection />
      <CategoryProducts category="kadın" title="Kadın Ürünleri" />
      <CategoryProducts category="erkek" title="Erkek Ürünleri" />
    </div>
  );
}
