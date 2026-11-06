import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { CategoriesSection } from "@/components/CategoriesSection";
import { ProductsSection } from "@/components/ProductsSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { PromoSection } from "@/components/PromoSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { QuickViewModal } from "@/components/QuickViewModal";
import { CheckoutModal } from "@/components/CheckoutModal";
import { OrderLookupModal } from "@/components/OrderLookupModal";
import { AdminOrderModal } from "@/components/AdminOrderModal";
import { AuthModal } from "@/components/AuthModal";
import { ToastContainer } from "@/components/ToastContainer";

export default function IndexPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Top Sticky Navigation */}
      <Navbar />

      {/* Main Landing Sections */}
      <main className="flex-1">
        {/* Section 2: Hero Section */}
        <HeroSection />

        {/* Section 3: Categories */}
        <CategoriesSection />

        {/* Section 4: Best Sellers & Product Catalog */}
        <ProductsSection />

        {/* Section 5: Benefits & Trust */}
        <BenefitsSection />

        {/* Section 6: Special Flash Sale Promo */}
        <PromoSection />

        {/* Section 7: Customer Testimonials */}
        <TestimonialsSection />

        {/* Section 8: Call to Action */}
        <CTASection />
      </main>

      {/* Section 9: Comprehensive Footer */}
      <Footer />

      {/* Interactive Drawers & Overlays */}
      <CartDrawer />
      <QuickViewModal />
      <CheckoutModal />
      <OrderLookupModal />
      <AdminOrderModal />
      <AuthModal />
      <ToastContainer />
    </div>
  );
}
