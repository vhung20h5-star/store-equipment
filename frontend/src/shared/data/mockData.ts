import { Product, Category, Testimonial, Benefit } from "@/types";

export const CATEGORIES: Category[] = [
  {
    id: "cat-1",
    slug: "kitchen",
    name: "Thiết bị nhà bếp",
    description:
      "Nồi chiên không dầu, nồi cơm cao tần, máy pha cà phê chuẩn barista",
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    itemCount: 24,
  },
  {
    id: "cat-2",
    slug: "cleaning",
    name: "Thiết bị vệ sinh",
    description:
      "Robot hút bụi tự động, máy lau sàn đa năng, máy hút bụi cầm tay",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    itemCount: 18,
  },
  {
    id: "cat-3",
    slug: "air",
    name: "Chăm sóc không khí",
    description:
      "Máy lọc không khí True HEPA, máy tạo ẩm bù ẩm thông minh, quạt tháp",
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    itemCount: 15,
  },
  {
    id: "cat-4",
    slug: "smart",
    name: "Gia dụng thông minh",
    description:
      "Thiết bị kết nối App điều khiển từ xa, cảm biến tự động hóa gia đình",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
    itemCount: 20,
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Nồi chiên không dầu HomeNest DualZone 6.5L",
    category: "kitchen",
    categoryName: "Thiết bị nhà bếp",
    price: 1990000,
    originalPrice: 2890000,
    discountPercent: 31,
    rating: 4.9,
    reviewsCount: 342,
    badge: "Bán chạy",
    badgeType: "bestseller",
    image:
      "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80",
    description:
      "Công nghệ đối lưu Rapid Air 360 độ giúp giảm 90% dầu mỡ thừa, mặt kính cường lực quan sát thức ăn thông minh.",
    features: [
      "Dung tích cực đại 6.5L nướng nguyên con gà 2.5kg",
      "12 chế độ nấu cài đặt sẵn qua màn hình LED cảm ứng",
      "Lòng nồi chống dính ceramic cao cấp không chứa PFOA/PTFE",
      "Tự ngắt an toàn khi kéo khay và chống quá nhiệt",
    ],
    specs: {
      "Công suất": "1800W",
      "Dung tích": "6.5 Lít",
      "Chất liệu lòng nồi": "Ceramic chống dính",
      "Bảo hành": "24 tháng chính hãng",
    },
    inStock: true,
  },
  {
    id: "prod-2",
    name: "Robot hút bụi lau nhà OmniClean Pro X1",
    category: "cleaning",
    categoryName: "Thiết bị vệ sinh",
    price: 6290000,
    originalPrice: 8500000,
    discountPercent: 26,
    rating: 4.9,
    reviewsCount: 518,
    badge: "Bán chạy",
    badgeType: "bestseller",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    description:
      "Lực hút siêu mạnh 6000Pa kết hợp chổi lau xoay kép tự động giặt giẻ và sấy khô bằng khí nóng trên trạm sạc.",
    features: [
      "Hệ thống định vị LiDAR TrueMapping 3D tránh chướng ngại vật chuẩn xác",
      "Lực hút khủng 6000Pa hút sạch bụi mịn và lông thú cưng",
      "Trạm sạc đa năng tự hút rác, tự giặt và sấy khô giẻ lau",
      "Điều khiển qua ứng dụng tiếng Việt và giọng nói trợ lý ảo",
    ],
    specs: {
      "Lực hút": "6000Pa",
      "Thời lượng pin": "200 phút (5200mAh)",
      "Bình nước sạch / bẩn": "4.0L / 3.8L",
      "Bảo hành": "24 tháng",
    },
    inStock: true,
  },
  {
    id: "prod-3",
    name: "Máy lọc không khí AirPure Plasma True HEPA",
    category: "air",
    categoryName: "Chăm sóc không khí",
    price: 3150000,
    originalPrice: 4200000,
    discountPercent: 25,
    rating: 4.8,
    reviewsCount: 219,
    badge: "Nổi bật",
    badgeType: "featured",
    image:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    description:
      "Bộ lọc 5 lớp kết hợp màng lọc True HEPA H13 và công nghệ Plasma ion khử sạch 99.97% bụi mịn PM2.5, phấn hoa và vi khuẩn.",
    features: [
      "Màng lọc HEPA H13 chuẩn y tế loại bỏ bụi siêu mịn PM0.3",
      "Cảm biến laser đo chất lượng không khí hiển thị số thực trên màn hình",
      "Vận hành êm ái dưới 24dB trong chế độ ngủ",
      "Kết nối WiFi kiểm tra chất lượng không khí từ xa",
    ],
    specs: {
      "Diện tích phù hợp": "45 - 60 m²",
      "Tốc độ lọc CADR": "480 m³/h",
      "Độ ồn tối đa": "24 - 49 dB",
      "Bảo hành": "24 tháng",
    },
    inStock: true,
  },
  {
    id: "prod-4",
    name: "Máy xay sinh tố đa năng UltraBlend 1200W",
    category: "kitchen",
    categoryName: "Thiết bị nhà bếp",
    price: 1190000,
    originalPrice: 1650000,
    discountPercent: 28,
    rating: 4.7,
    reviewsCount: 185,
    badge: "Giảm sốc",
    badgeType: "sale",
    image:
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80",
    description:
      "Động cơ đồng nguyên chất 1200W với 6 lưỡi dao thép titan Nhật Bản xay nhuyễn đá bi và hạt cứng chỉ trong 10 giây.",
    features: [
      "Cối thủy tinh borosilicate chịu nhiệt cao cấp dung tích 1.75L",
      "6 chế độ xay tự động: sinh tố, sữa hạt, cháo dinh dưỡng, đá xay",
      "Chức năng tự làm sạch cối bằng một nút chạm",
      "Chân đế hút chân không chống rung lắc tuyệt đối",
    ],
    specs: {
      "Công suất": "1200W",
      "Dung tích cối": "1.75 Lít",
      "Số lưỡi dao": "6 cánh thép Titan 304",
      "Bảo hành": "18 tháng",
    },
    inStock: true,
  },
  {
    id: "prod-5",
    name: "Nồi cơm điện cao tần SmartIH 1.8L",
    category: "kitchen",
    categoryName: "Thiết bị nhà bếp",
    price: 1790000,
    originalPrice: 2450000,
    discountPercent: 27,
    rating: 4.9,
    reviewsCount: 412,
    badge: "Bán chạy",
    badgeType: "bestseller",
    image:
      "https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&w=800&q=80",
    description:
      "Công nghệ đốt nóng cảm ứng từ IH 360 độ giúp hạt cơm chín đều từ trong ra ngoài, giữ trọn vị ngọt tự nhiên của từng hạt gạo.",
    features: [
      "Lòng nồi hợp kim 8 lớp dày 3.0mm phủ chống dính Daikin Nhật Bản",
      "Chế độ nấu cơm gạo lứt, cơm niêu giòn đáy, cháo hoa, súp dinh dưỡng",
      "Hẹn giờ nấu thông minh lên đến 24 giờ",
      "Bảng điều khiển cảm ứng chống trầy hiện đại",
    ],
    specs: {
      "Công nghệ nấu": "Cảm ứng từ IH",
      "Dung tích": "1.8 Lít (phù hợp 4 - 6 người)",
      "Công suất": "1300W",
      "Bảo hành": "24 tháng",
    },
    inStock: true,
  },
  {
    id: "prod-6",
    name: "Máy pha cà phê Espresso Barista Touch",
    category: "kitchen",
    categoryName: "Thiết bị nhà bếp",
    price: 4200000,
    originalPrice: 5600000,
    discountPercent: 25,
    rating: 4.8,
    reviewsCount: 147,
    badge: "Mới ra mắt",
    badgeType: "new",
    image:
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80",
    description:
      "Áp suất chuẩn Ý 20 Bar, hệ thống gia nhiệt ThermoBlock siêu nhanh trong 25 giây mang đến ly cà phê béo ngậy lớp crema.",
    features: [
      "Bơm áp suất cao 20 Bar nhập khẩu từ Ý",
      "Vòi đánh sữa xoay 360 độ tạo bọt sữa mịn màng chuẩn Latte Art",
      "Bộ đo áp kế trực quan hiển thị áp suất chiết xuất hoàn hảo",
      "Khay làm ấm tách bằng inox cao cấp",
    ],
    specs: {
      "Áp suất": "20 Bar",
      "Bình chứa nước": "1.5 Lít tháo rời",
      "Công suất": "1450W",
      "Bảo hành": "24 tháng",
    },
    inStock: true,
  },
  {
    id: "prod-7",
    name: "Máy hút bụi không dây StormForce V12",
    category: "cleaning",
    categoryName: "Thiết bị vệ sinh",
    price: 2890000,
    originalPrice: 3800000,
    discountPercent: 24,
    rating: 4.8,
    reviewsCount: 276,
    badge: "Nổi bật",
    badgeType: "featured",
    image:
      "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80",
    description:
      "Trọng lượng chỉ 1.2kg siêu nhẹ, lực hút xoáy 25,000Pa cùng cụm đèn LED soi bụi ẩn gầm giường ghế thông minh.",
    features: [
      "Lực hút mạnh mẽ 25,000Pa hút sạch mạt bụi giường nệm",
      "Thời lượng pin lên đến 60 phút ở chế độ tiêu chuẩn",
      "Trang bị 4 đầu hút chuyên dụng: sàn nhà, khe hẹp, giường nệm, bàn phím",
      "Hộp bụi xả một chạm vệ sinh tiện lợi không dơ tay",
    ],
    specs: {
      "Lực hút": "25,000Pa",
      "Trọng lượng thân máy": "1.2 kg",
      "Dung lượng pin": "2500mAh tháo rời",
      "Bảo hành": "24 tháng",
    },
    inStock: true,
  },
  {
    id: "prod-8",
    name: "Quạt tháp không cánh làm mát & lọc bụi SilentWind",
    category: "air",
    categoryName: "Chăm sóc không khí",
    price: 2390000,
    originalPrice: 3200000,
    discountPercent: 25,
    rating: 4.7,
    reviewsCount: 163,
    badge: "Giảm sốc",
    badgeType: "sale",
    image:
      "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80",
    description:
      "Thiết kế không cánh an toàn tuyệt đối cho trẻ nhỏ, kết hợp lõi lọc không khí ion âm và góc quay rộng 90 độ.",
    features: [
      "Công nghệ khuếch tán gió êm dịu mô phỏng gió tự nhiên",
      "Độ ồn cực thấp dưới 28dB tạo giấc ngủ sâu",
      "Tích hợp lõi lọc sơ cấp và phát ion âm thanh lọc không khí",
      "Điều khiển cảm ứng mặt kính và remote từ xa 6m",
    ],
    specs: {
      "Góc quay": "90 độ tự động",
      "Số cấp độ gió": "9 cấp độ gió thông minh",
      "Công suất": "45W tiết kiệm điện",
      "Bảo hành": "24 tháng",
    },
    inStock: true,
  },
];

export const BENEFITS: Benefit[] = [
  {
    id: "ben-1",
    title: "Sản phẩm chất lượng",
    description:
      "Ưu tiên các sản phẩm có nguồn gốc rõ ràng và chất lượng đáng tin cậy.",
    icon: "ShieldCheck",
  },
  {
    id: "ben-2",
    title: "Giao hàng tiện lợi",
    description:
      "Đặt hàng dễ dàng, theo dõi trạng thái giao hàng nhanh chóng toàn quốc.",
    icon: "Truck",
  },
  {
    id: "ben-3",
    title: "Giá cả hợp lý",
    description:
      "Nhiều lựa chọn phù hợp với nhu cầu và ngân sách của mọi gia đình.",
    icon: "BadgePercent",
  },
  {
    id: "ben-4",
    title: "Hỗ trợ tận tâm",
    description:
      "Hỗ trợ tư vấn và giải đáp thắc mắc khi mua sắm 24/7 nhiệt tình.",
    icon: "Headset",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    name: "Chị Minh Anh",
    location: "Khu đô thị Vinhomes, Hà Nội",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    purchasedProduct: "Nồi chiên không dầu DualZone 6.5L",
    comment:
      "Nồi chiên dùng cực kỳ thích! Nhà mình có 2 bé nhỏ, từ ngày mua nồi chiên HomeNest các món chiên rán vừa giòn vừa không sợ ngấy mỡ. Thiết kế mặt kính nhìn rất sang trọng trong căn bếp.",
  },
  {
    id: "test-2",
    name: "Anh Hoàng Long",
    location: "Quận 7, TP. Hồ Chí Minh",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    purchasedProduct: "Robot hút bụi lau nhà OmniClean Pro X1",
    comment:
      "Robot hút cực sạch và tự giặt sấy giẻ lau thật sự cứu cánh cho dân văn phòng bận rộn như mình. Về đến nhà là sàn bóng loáng sạch sẽ. Giao hàng nhanh và đóng gói rất cẩn thận!",
  },
  {
    id: "test-3",
    name: "Chị Thu Thảo",
    location: "Hải Châu, TP. Đà Nẵng",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    purchasedProduct: "Máy lọc không khí AirPure Plasma",
    comment:
      "Máy lọc không khí chạy rất êm, đêm ngủ không nghe thấy tiếng động nào. Nhà mình nuôi mèo mà từ lúc bật máy là không còn mùi hôi hay bay lông tơ nữa. Rất đáng đồng tiền bát gạo!",
  },
];
