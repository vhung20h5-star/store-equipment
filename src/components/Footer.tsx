import React, { useState } from "react";
import {
  Home,
  Mail,
  Send,
  Phone,
  MapPin,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import { useShop } from "@/context/ShopContext";
import { subscribeNewsletter } from "@/services/api";

export const Footer: React.FC = () => {
  const { showToast } = useShop();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [voucherCode, setVoucherCode] = useState("HOMENEST10");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Vui lòng nhập địa chỉ email của bạn.");

      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Địa chỉ email không đúng định dạng.");

      return;
    }

    setIsSubmitting(true);
    try {
      const res = await subscribeNewsletter(email);
      setIsSubscribed(true);
      if (res.voucherCode) {
        setVoucherCode(res.voucherCode);
      }
      showToast(
        res.alreadySubscribed
          ? "Đã ghi nhận thông tin!"
          : "Đăng ký nhận tin thành công!",
        res.message || `Mã ưu đãi 10% của bạn: ${res.voucherCode || voucherCode}`,
        "success",
      );
      setEmail("");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Đăng ký không thành công";
      setError(msg);
      showToast("Lỗi đăng ký", msg, "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);

    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md">
                <Home className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                HomeNest
              </span>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed pr-4">
              HomeNest là điểm đến tin cậy cho các thiết bị gia dụng hiện đại,
              tích hợp công nghệ thông minh nhằm mang lại cuộc sống tiện nghi,
              an toàn và hạnh phúc cho mọi tổ ấm.
            </p>

            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hotline: 1900 6868 (8:00 - 21:00 hàng ngày)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Email: hotro@homenest.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hà Nội & TP. Hồ Chí Minh, Việt Nam</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {["Facebook", "Instagram", "TikTok", "YouTube"].map((network) => (
                <a
                  key={network}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast(
                      "Mạng xã hội",
                      `Liên kết đến ${network} chính thức`,
                      "info",
                    );
                  }}
                >
                  {network}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Khám phá (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Khám phá
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a
                  className="hover:text-emerald-400 transition-colors"
                  href="#hero"
                  onClick={(e) => scrollTo(e, "hero")}
                >
                  Trang chủ
                </a>
              </li>
              <li>
                <a
                  className="hover:text-emerald-400 transition-colors"
                  href="#categories"
                  onClick={(e) => scrollTo(e, "categories")}
                >
                  Danh mục sản phẩm
                </a>
              </li>
              <li>
                <a
                  className="hover:text-emerald-400 transition-colors"
                  href="#products"
                  onClick={(e) => scrollTo(e, "products")}
                >
                  Sản phẩm bán chạy
                </a>
              </li>
              <li>
                <a
                  className="hover:text-emerald-400 transition-colors"
                  href="#promotions"
                  onClick={(e) => scrollTo(e, "promotions")}
                >
                  Khuyến mãi Flash Sale
                </a>
              </li>
              <li>
                <a
                  className="hover:text-emerald-400 transition-colors"
                  href="#about"
                  onClick={(e) => scrollTo(e, "about")}
                >
                  Về chúng tôi
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Hỗ trợ (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Chính sách & Hỗ trợ
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a
                  className="hover:text-emerald-400 transition-colors"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast(
                      "Chính sách bảo hành",
                      "Bảo hành 24 tháng chính hãng toàn diện",
                      "info",
                    );
                  }}
                >
                  Chính sách bảo hành 24 tháng
                </a>
              </li>
              <li>
                <a
                  className="hover:text-emerald-400 transition-colors"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast(
                      "Chính sách đổi trả",
                      "Đổi mới trong 30 ngày nếu phát sinh lỗi kỹ thuật",
                      "info",
                    );
                  }}
                >
                  Chính sách đổi trả 30 ngày
                </a>
              </li>
              <li>
                <a
                  className="hover:text-emerald-400 transition-colors"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast(
                      "Giao hàng",
                      "Miễn phí giao hàng toàn quốc đơn từ 500k",
                      "info",
                    );
                  }}
                >
                  Chính sách vận chuyển
                </a>
              </li>
              <li>
                <a
                  className="hover:text-emerald-400 transition-colors"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast(
                      "Bảo mật",
                      "Cam kết bảo mật thông tin khách hàng tuyệt đối",
                      "info",
                    );
                  }}
                >
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a
                  className="hover:text-emerald-400 transition-colors"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast(
                      "Hướng dẫn",
                      "Hỗ trợ lắp đặt và hướng dẫn sử dụng tận nơi",
                      "info",
                    );
                  }}
                >
                  Hướng dẫn sử dụng thiết bị
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Đăng ký nhận tin & Nhận voucher 10%
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nhận thông báo sớm nhất về các chương trình ưu đãi độc quyền, bí
              quyết chăm sóc nhà cửa và các sản phẩm công nghệ gia dụng mới
              nhất.
            </p>

            {isSubscribed ? (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span className="font-semibold">
                    Cảm ơn bạn đã đăng ký nhận tin!
                  </span>
                </div>
                <p className="text-slate-300 pl-6">
                  Mã ưu đãi 10% của bạn:{" "}
                  <span className="font-mono font-bold text-emerald-400">
                    {voucherCode}
                  </span>
                </p>
              </div>
            ) : (
              <form className="space-y-2" onSubmit={handleSubscribe}>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    className="w-full pl-9 pr-28 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 outline-none focus:border-emerald-500 transition-all"
                    disabled={isSubmitting}
                    placeholder="Nhập email của bạn..."
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                  />
                  <button
                    className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    <span>{isSubmitting ? "Đang gửi..." : "Đăng ký"}</span>
                    {isSubmitting ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                  </button>
                </div>
                {error && <p className="text-[11px] text-rose-400">{error}</p>}
              </form>
            )}

            <div className="pt-2 text-slate-400 text-xs flex items-center gap-4">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Thanh toán
                an toàn
              </span>
              <span className="flex items-center gap-1">
                <CreditCard className="w-4 h-4 text-emerald-400" /> Visa /
                Master / MoMo
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © 2026 HomeNest. All rights reserved. Thiết kế cho giao diện thương
            mại điện tử hiện đại.
          </p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 cursor-pointer">
              Điều khoản dịch vụ
            </span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">
              Quy chế hoạt động
            </span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
