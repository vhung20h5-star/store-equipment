import { Navbar } from "@/components/Navbar";
import { PromoSection } from "@/components/PromoSection";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { QuickViewModal } from "@/components/QuickViewModal";
import { CheckoutModal } from "@/components/CheckoutModal";
import { OrderLookupModal } from "@/components/OrderLookupModal";
import { AdminOrderModal } from "@/components/AdminOrderModal";
import { AdminProductModal } from "@/components/AdminProductModal";
import { AdminPromotionModal } from "@/components/AdminPromotionModal";
import { VoucherWalletModal } from "@/components/VoucherWalletModal";
import { AuthModal } from "@/components/AuthModal";
import { ToastContainer } from "@/components/ToastContainer";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <PromoSection />
      </main>
      <Footer />

      <CartDrawer />
      <QuickViewModal />
      <CheckoutModal />
      <OrderLookupModal />
      <AdminOrderModal />
      <AdminProductModal />
      <AdminPromotionModal />
      <VoucherWalletModal />
      <AuthModal />
      <ToastContainer />
    </div>
  );
}
