import React from "react";
import { ShieldCheck, Truck, BadgePercent, Headset, Sparkles } from "lucide-react";
import { Benefit } from "@/types";

export const BenefitsSection: React.FC = () => {
  const benefits: Benefit[] = [
    {
      id: "ben-1",
      title: "Sản phẩm chất lượng",
      description: "Ưu tiên các sản phẩm có nguồn gốc rõ ràng và chất lượng đáng tin cậy.",
      icon: "ShieldCheck",
    },
    {
      id: "ben-2",
      title: "Giao hàng tiện lợi",
      description: "Đặt hàng dễ dàng, theo dõi trạng thái giao hàng nhanh chóng toàn quốc.",
      icon: "Truck",
    },
    {
      id: "ben-3",
      title: "Giá cả hợp lý",
      description: "Nhiều lựa chọn phù hợp với nhu cầu và ngân sách của từng gia đình.",
      icon: "BadgePercent",
    },
    {
      id: "ben-4",
      title: "Hỗ trợ tận tâm",
      description: "Hỗ trợ tư vấn và giải đáp thắc mắc khi mua sắm 24/7 chu đáo.",
      icon: "Headset",
    },
  ];

  const renderIcon = (icon: Benefit["icon"]) => {
    switch (icon) {
      case "ShieldCheck":
        return <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case "Truck":
        return <Truck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case "BadgePercent":
        return <BadgePercent className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case "Headset":
        return <Headset className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <section id="about" className="py-16 sm:py-20 bg-slate-50/70 dark:bg-slate-900/60 border-y border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cam kết dịch vụ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Tại sao nên chọn HomeNest?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Chúng tôi tận tâm mang đến trải nghiệm mua sắm gia dụng an tâm tuyệt đối và tiện ích vượt trội cho mọi gia đình.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item) => (
            <div
              key={item.id}
              className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 hover:-translate-y-1 flex flex-col items-start"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 flex items-center justify-center mb-5 border border-emerald-100 dark:border-emerald-800">
                {renderIcon(item.icon)}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

