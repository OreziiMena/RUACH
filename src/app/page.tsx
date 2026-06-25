import "./page.module.css";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import Features from "@/components/Features";
import NewCollections from "@/components/NewCollections";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import ProductService from "@/services/product.service";
import HomeDiscountBanner from "@/components/HomeDiscountBanner";
import PromoModal from "@/components/PromoModal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "RUACH H. FASHION | Premium Fashion Design",
  description: "Discover RUACH H. FASHION's latest collections blending contemporary design with timeless aesthetics.",
};

export default async function Home() {
  const collections = await ProductService.getProducts({ page: 1, limit: 4 });

  return (
    <main className="main-container">
      <PromoModal />
      <Hero />
      <NewCollections initialProducts={collections.data} />
      <Gallery />
      <Features />
      <Testimonials />
      <Newsletter />
      <HomeDiscountBanner />
    </main>
  );
}
