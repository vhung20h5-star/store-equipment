-- V8__seed_diverse_products.sql
-- Seed 20 additional diverse products (prod-11 to prod-30) across all 4 categories,
-- plus rich features and multi-image galleries for the catalog.

-- 1. Insert 20 New Products (5 per category: kitchen, cleaning, air, smart)
INSERT INTO products (
    id, category_slug, category_name, name, price, original_price, discount_percent,
    rating, reviews_count, badge, badge_type, image, description, specs_json,
    in_stock, stock_quantity, is_active
) VALUES
-- ==================== THIẾT BỊ NHÀ BẾP (kitchen: prod-11 -> prod-15) ====================
('prod-11', 'kitchen', 'Thiết bị nhà bếp', 'Bếp từ đôi âm mặt kính Schott Ceran HomeNest ChefPro 4000W',
 5490000, 7200000, 24, 4.9, 284, 'Bán chạy', 'bestseller',
 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80',
 'Mặt kính Schott Ceran nhập khẩu Đức chịu sốc nhiệt 800°C, tích hợp công nghệ biến tần Inverter tiết kiệm 35% điện năng và chức năng Booster đun sôi siêu tốc.',
 '{"Tổng công suất": "4000W (Booster 2200W/vùng)", "Mặt kính": "Schott Ceran (Đức)", "Công nghệ tiết kiệm điện": "Half-Bridge Inverter", "Kích thước cắt đá": "680 x 380 mm", "Bảo hành": "36 tháng tại nhà"}',
 TRUE, 22, TRUE),

('prod-12', 'kitchen', 'Thiết bị nhà bếp', 'Máy làm sữa hạt đa năng cách âm HomeNest NutriSilent 1.5L',
 1690000, 2350000, 28, 4.8, 319, 'Nổi bật', 'featured',
 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80',
 'Lồng chụp tiêu âm 5 lớp giảm tiếng ồn xuống dưới 52dB, lưỡi dao 8 cánh inox 304 xay mịn sữa hạt nguyên xác không cần lọc bã.',
 '{"Dung tích cối": "1.5 Lít (4 - 6 người)", "Công suất xay / nấu": "1000W / 800W", "Độ ồn vận hành": "< 52 dB (Có lồng cách âm)", "Mâm nhiệt": "Gốm Ceramic chống khê", "Bảo hành": "24 tháng"}',
 TRUE, 40, TRUE),

('prod-13', 'kitchen', 'Thiết bị nhà bếp', 'Lò nướng kiêm nồi chiên hơi nước HomeNest SteamBake 25L',
 3490000, 4500000, 22, 4.9, 156, 'Mới ra mắt', 'new',
 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
 'Sự kết hợp hoàn hảo giữa luồng khí nóng đối lưu và phun sương siêu nhiệt giúp món nướng giòn rụm bên ngoài, mềm mọng bên trong.',
 '{"Dung tích khoang lò": "25 Lít", "Công suất": "2000W", "Dải nhiệt độ": "40°C - 230°C", "Chất liệu khoang lò": "Inox 304 chuẩn thực phẩm", "Bảo hành": "24 tháng"}',
 TRUE, 15, TRUE),

('prod-14', 'kitchen', 'Thiết bị nhà bếp', 'Ấm đun siêu tốc kiểm soát nhiệt độ HomeNest BrewTemp 1.7L',
 690000, 950000, 27, 4.8, 428, 'Giảm sốc', 'sale',
 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
 'Bộ điều chỉnh nhiệt Strix Anh Quốc bền bỉ 10.000 lần đun, tùy chỉnh 5 mức nhiệt chuẩn xác để pha trà, pha sữa cho bé và cà phê.',
 '{"Dung tích": "1.7 Lít", "Công suất": "1850W", "Mức chỉnh nhiệt": "40°C / 60°C / 80°C / 90°C / 100°C", "Ruột ấm": "Inox 316 y tế đúc liền khối", "Bảo hành": "18 tháng"}',
 TRUE, 85, TRUE),

('prod-15', 'kitchen', 'Thiết bị nhà bếp', 'Máy rửa bát độc lập sấy khí nóng HomeNest DishPure 12 Bộ',
 8990000, 11500000, 22, 4.9, 112, 'Nổi bật', 'featured',
 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
 'Rửa nước nóng 75°C đánh bay dầu mỡ cứng đầu, sấy khô Turbo khí nóng kết hợp tia UV diệt khuẩn 99.99% và bảo quản bát đĩa 72 giờ.',
 '{"Sức chứa": "12 bộ đồ ăn châu Âu (3 giàn rửa)", "Lượng nước tiêu thụ": "9.5 Lít / chu trình", "Độ ồn": "44 dB êm ái", "Công nghệ sấy": "Sấy khí nóng PTC + Tia UV-C", "Bảo hành": "36 tháng tận nơi"}',
 TRUE, 4, TRUE),

-- ==================== THIẾT BỊ VỆ SINH (cleaning: prod-16 -> prod-20) ====================
('prod-16', 'cleaning', 'Thiết bị vệ sinh', 'Máy hút bụi lau sàn khô ướt tự giặt con lăn HomeNest AquaWash H14',
 4590000, 6200000, 26, 4.9, 267, 'Bán chạy', 'bestseller',
 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
 'Vừa hút vừa lau xử lý gọn cả vết bẩn khô lẫn chất lỏng đổ ra sàn, con lăn tràn viền 2 cạnh cùng chế độ tự giặt bằng nước nóng 60°C.',
 '{"Lực hút": "18,000Pa", "Thời gian hoạt động": "45 phút liên tục", "Bình nước sạch / bẩn": "880ml / 650ml", "Góc ngả phẳng": "180 độ luồn gầm giường", "Bảo hành": "24 tháng"}',
 TRUE, 32, TRUE),

('prod-17', 'cleaning', 'Thiết bị vệ sinh', 'Máy hút mạt bụi giường nệm tia UV-C HomeNest MiteGuard Pro',
 1250000, 1750000, 29, 4.8, 390, 'Giảm sốc', 'sale',
 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80',
 'Tần số rung đập 12.000 lần/phút kết hợp đèn UV-C bước sóng 253.7nm và luồng khí nóng 55°C tiêu diệt tận gốc mạt bụi và tác nhân dị ứng.',
 '{"Lực hút": "14,000Pa", "Công suất": "500W", "Nhiệt độ sấy": "55°C khử ẩm nệm", "Hộp chứa bụi": "Cốc lọc kép xoáy lốc 0.5L", "Bảo hành": "18 tháng"}',
 TRUE, 55, TRUE),

('prod-18', 'cleaning', 'Thiết bị vệ sinh', 'Cây lau nhà hơi nước nóng tiệt trùng HomeNest SteamMop S3',
 1590000, 2100000, 24, 4.7, 174, 'Nổi bật', 'featured',
 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=800&q=80',
 'Tạo hơi nước nóng 120°C chỉ sau 15 giây khởi động, làm sạch sâu vết dầu mỡ sàn gỗ và gạch men mà không cần dùng hóa chất tẩy rửa.',
 '{"Công suất": "1300W", "Nhiệt độ hơi nước": "120°C tiệt trùng", "Dung tích bình nước": "450 ml", "Chiều dài dây nguồn": "5 mét linh hoạt", "Bảo hành": "18 tháng"}',
 TRUE, 38, TRUE),

('prod-19', 'cleaning', 'Thiết bị vệ sinh', 'Robot lau kính thông minh chống rơi HomeNest WinBot W2',
 3290000, 4300000, 23, 4.8, 95, 'Mới ra mắt', 'new',
 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80',
 'Lực bám hút chân không 3800Pa an toàn tuyệt đối cho cửa kính chung cư cao tầng, hệ thống phun sương siêu âm kép lau sạch bóng không vệt nước.',
 '{"Lực hút bám kính": "3800Pa", "Pin dự phòng UPS": "Giữ bám 30 phút khi mất điện", "Chế độ di chuyển": "Z / N / Tự động thông minh", "Dây đai an toàn": "Chịu tải 150 kg", "Bảo hành": "24 tháng"}',
 TRUE, 18, TRUE),

('prod-20', 'cleaning', 'Thiết bị vệ sinh', 'Máy giặt thảm & sofa cầm tay phun hút sâu HomeNest SpotClean C5',
 2190000, 2890000, 24, 4.8, 210, 'Giảm sốc', 'sale',
 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=800&q=80',
 'Công nghệ phun nước áp lực cao thẩm thấu sâu vào sợi vải và hút sạch vết cà phê, nước sốt, vết bẩn thú cưng trên ghế sofa, nệm và thảm.',
 '{"Lực hút": "13,000Pa", "Công suất": "650W", "Bình nước sạch / bẩn": "1.4L / 1.2L", "Đầu hút đi kèm": "Đầu bàn chải tiêu chuẩn + Đầu hút khe", "Bảo hành": "24 tháng"}',
 FALSE, 0, TRUE),

-- ==================== CHĂM SÓC KHÔNG KHÍ (air: prod-21 -> prod-25) ====================
('prod-21', 'air', 'Chăm sóc không khí', 'Máy hút ẩm kiêm lọc không khí HEPA HomeNest DryAir 20L',
 4190000, 5500000, 24, 4.9, 334, 'Bán chạy', 'bestseller',
 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80',
 'Giải pháp hoàn hảo cho mùa nồm ẩm: công suất hút ẩm 20 lít/ngày kết hợp màng lọc HEPA và chế độ sấy quần áo khô nhanh không mùi hôi.',
 '{"Công suất hút ẩm": "20 Lít / ngày (30°C, 80% RH)", "Diện tích phòng": "30 - 50 m²", "Dung tích bình chứa": "4.5 Lít (Có ống xả liên tục)", "Độ ồn": "38 dB", "Bảo hành": "24 tháng"}',
 TRUE, 25, TRUE),

('prod-22', 'air', 'Chăm sóc không khí', 'Máy tạo độ ẩm siêu âm kháng khuẩn UV HomeNest MistPure 5L',
 990000, 1390000, 29, 4.8, 245, 'Giảm sốc', 'sale',
 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
 'Phun sương hạt nano siêu mịn bù ẩm tức thì cho phòng bật điều hòa, tích hợp đèn UV-C khử khuẩn nguồn nước và khay khuếch tán tinh dầu thư giãn.',
 '{"Dung tích bình nước": "5.0 Lít (Dùng 36 giờ)", "Lưu lượng phun sương": "350 ml/h", "Cảm biến độ ẩm": "Tự động duy trì 45% - 75% RH", "Độ ồn": "25 dB siêu tĩnh", "Bảo hành": "18 tháng"}',
 TRUE, 64, TRUE),

('prod-23', 'air', 'Chăm sóc không khí', 'Quạt tuần hoàn không khí đối lưu 3D HomeNest AeroFlow DC',
 1450000, 1950000, 26, 4.8, 189, 'Nổi bật', 'featured',
 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
 'Động cơ DC Inverter không chổi than tạo luồng gió xoắn ốc thổi xa 15 mét, giúp cân bằng nhiệt độ phòng điều hòa nhanh gấp 3 lần.',
 '{"Động cơ": "DC Inverter không chổi than", "Góc đảo gió 3D": "Ngang 90° + Dọc 100° tự động", "Số cấp độ gió": "12 cấp độ + Gió ngủ", "Công suất": "24W siêu tiết kiệm", "Bảo hành": "24 tháng"}',
 TRUE, 48, TRUE),

('prod-24', 'air', 'Chăm sóc không khí', 'Máy lọc không khí khử mùi thú cưng HomeNest PetCare H13',
 3690000, 4800000, 23, 4.9, 142, 'Mới ra mắt', 'new',
 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
 'Thiết kế cửa hút gió 360 độ sát sàn chuyên thu gom lông mèo, lông chó bay lơ lửng cùng lõi than hoạt tính gấp đôi khử sạch mùi hôi thú cưng.',
 '{"Tốc độ lọc CADR": "520 m³/h", "Diện tích sử dụng": "50 - 65 m²", "Màng lọc chuyên dụng": "Lọc sơ cấp giặt được + HEPA H13 + Than hoạt tính kép", "Kết nối": "App HomeNest Smart", "Bảo hành": "24 tháng"}',
 TRUE, 3, TRUE),

('prod-25', 'air', 'Chăm sóc không khí', 'Máy sưởi gốm Ceramic bù ẩm không khô da HomeNest WarmCozy 2200W',
 1850000, 2490000, 26, 4.7, 128, 'Nổi bật', 'featured',
 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
 'Làm ấm phòng chỉ sau 3 giây với thanh nhiệt gốm PTC không đốt cháy oxy, tích hợp hộp tạo ẩm phun sương giúp giữ ấm cổ họng và làn da mùa đông.',
 '{"Công suất": "2200W (3 mức nhiệt ECO)", "Công nghệ sưởi": "Gốm PTC không phát sáng", "Tính năng an toàn": "Tự ngắt khi nghiêng đổ & quá nhiệt", "Góc quay": "70 độ", "Bảo hành": "24 tháng"}',
 TRUE, 29, TRUE),

-- ==================== GIA DỤNG THÔNG MINH (smart: prod-26 -> prod-30) ====================
('prod-26', 'smart', 'Gia dụng thông minh', 'Khóa cửa vân tay thông minh 5 trong 1 HomeNest SafeLock FaceID',
 3890000, 5200000, 25, 4.9, 205, 'Bán chạy', 'bestseller',
 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
 'Mở khóa siêu nhạy bằng nhận diện khuôn mặt 3D, vân tay bán dẫn FPC Thụy Điển, mã số ảo chống nhìn trộm, thẻ từ NFC và ứng dụng điện thoại.',
 '{"Phương thức mở khóa": "FaceID 3D, Vân tay, Mã số, Thẻ từ, Chìa cơ, App", "Chất liệu thân khóa": "Hợp kim kẽm nguyên khối CNC", "Nguồn điện": "Pin sạc Lithium 4200mAh (Cổng sạc khẩn cấp USB-C)", "Cảnh báo an ninh": "Chống cạy cửa, báo cháy, khóa trái trong", "Bảo hành": "24 tháng"}',
 TRUE, 19, TRUE),

('prod-27', 'smart', 'Gia dụng thông minh', 'Camera an ninh AI 360 độ 2K HomeNest CamGuard Pro',
 790000, 1150000, 31, 4.8, 512, 'Giảm sốc', 'sale',
 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
 'Độ phân giải siêu nét 2K QHD, ống kính xoay 360° tự động bám theo chuyển động người, đàm thoại 2 chiều to rõ và nhìn đêm có màu Starlight.',
 '{"Độ phân giải": "2K QHD (2304 x 1296 px)", "Góc quan sát": "Xoay ngang 360°, dọc 115°", "Tính năng AI": "Phát hiện người, tiếng khóc trẻ em, cảnh báo vùng", "Lưu trữ": "Thẻ nhớ MicroSD 256GB / Cloud", "Bảo hành": "24 tháng"}',
 TRUE, 90, TRUE),

('prod-28', 'smart', 'Gia dụng thông minh', 'Bộ trung tâm điều khiển nhà thông minh Zigbee 3.0 HomeNest Hub M2',
 650000, 890000, 27, 4.9, 134, 'Mới ra mắt', 'new',
 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
 'Trái tim của ngôi nhà thông minh: kết nối đồng thời 128 cảm biến và công tắc, tích hợp mắt hồng ngoại 360° điều khiển tivi và điều hòa từ xa.',
 '{"Giao thức kết nối": "Zigbee 3.0 + WiFi + Bluetooth Mesh + Hồng ngoại IR", "Số thiết bị hỗ trợ": "Tối đa 128 thiết bị con", "Cổng nguồn": "USB Type-C (5V - 1A) + Cổng LAN RJ45", "Tương thích": "Apple HomeKit, Google Home, Alexa", "Bảo hành": "18 tháng"}',
 TRUE, 52, TRUE),

('prod-29', 'smart', 'Gia dụng thông minh', 'Đèn bàn học chống cận thông minh chuẩn Ra98 HomeNest EyeCare Desk',
 890000, 1250000, 29, 4.8, 223, 'Nổi bật', 'featured',
 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
 'Chỉ số hoàn màu CRI Ra98 mô phỏng ánh sáng mặt trời tự nhiên buổi sáng, cảm biến quang học tự động điều chỉnh độ sáng bảo vệ mắt trẻ nhỏ.',
 '{"Chỉ số hoàn màu": "CRI Ra98 (Ánh sáng toàn phổ)", "Nhiệt độ màu": "3000K - 5000K vô cấp", "Chế độ thông minh": "Cảm biến tự chỉnh sáng + Nhắc nghỉ mắt sau 45 phút", "Công suất": "14W LED chống chói RG0", "Bảo hành": "24 tháng"}',
 TRUE, 44, TRUE),

('prod-30', 'smart', 'Gia dụng thông minh', 'Động cơ rèm cửa tự động điều khiển giọng nói HomeNest CurtainBot',
 1490000, 1990000, 25, 4.8, 118, 'Mới ra mắt', 'new',
 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
 'Lắp đặt trong 30 giây lên thanh rèm có sẵn không cần khoan đục, tự động mở rèm đón nắng theo đồng hồ báo thức hoặc cảm biến ánh sáng.',
 '{"Tải trọng kéo tối đa": "12 kg", "Thời lượng pin": "6 - 8 tháng / lần sạc (Pin 4000mAh)", "Loại thanh rèm hỗ trợ": "Thanh chữ U, chữ I và thanh tròn", "Điều khiển": "App, Giọng nói, Hẹn giờ, Kéo nhẹ tay", "Bảo hành": "18 tháng"}' ,
 FALSE, 0, TRUE);

-- 2. Insert Product Features for prod-11 to prod-30
INSERT INTO product_features (product_id, feature_text, display_order) VALUES
('prod-11', 'Mặt kính Schott Ceran vát 4 cạnh chống trầy xước và chịu lực cao', 1),
('prod-11', 'Công nghệ Inverter duy trì nhiệt liu riu không bật tắt liên tục', 2),
('prod-11', 'Chức năng khóa trẻ em, tự ngắt khi tràn nước và cảnh báo nhiệt dư', 3),
('prod-11', 'Bảng điều khiển trượt Slide độc lập cho từng vùng nấu', 4),

('prod-12', 'Lồng chụp cách âm tháo rời giảm 60% tiếng ồn khi xay sáng sớm', 1),
('prod-12', '10 chương trình nấu tự động: sữa hạt, cháo mịn, súp, sinh tố, hầm canh', 2),
('prod-12', 'Chế độ tự vệ sinh khử khuẩn bằng nước nóng 100°C', 3),
('prod-12', 'Hẹn giờ nấu thông minh 12 tiếng, sáng thức dậy có ngay sữa nóng', 4),

('prod-13', 'Bình chứa nước 1.2L tạo hơi nước siêu nhiệt giữ trọn độ ẩm thực phẩm', 1),
('prod-13', '3 chế độ chuyên sâu: Chiên không dầu, Nướng hơi nước, Hấp nguyên bản', 2),
('prod-13', 'Cửa kính 3 lớp cách nhiệt an toàn kèm đèn chiếu sáng khoang lò', 3),
('prod-13', 'Đi kèm khay nướng, vỉ chiên, khay hấp inox 304 chống gỉ', 4),

('prod-14', 'Màn hình LED hiển thị nhiệt độ nước thời gian thực ngay trên tay cầm', 1),
('prod-14', 'Chức năng giữ ấm thông minh suốt 12 giờ cho mẹ bỉm pha sữa đêm', 2),
('prod-14', 'Vỏ ấm 2 lớp cách nhiệt chống bỏng tuyệt đối khi chạm vào', 3),
('prod-14', 'Lõi inox 316 chuẩn y tế không bám cặn và không mùi kim loại', 4),

('prod-15', '3 giàn rửa linh hoạt điều chỉnh độ cao, xếp gọn cả xoong nồi lớn', 1),
('prod-15', '6 chương trình rửa chuyên biệt: Rửa chuyên sâu, Eco, Thủy tinh, Rửa nhanh 29 phút', 2),
('prod-15', 'Chế độ bảo quản FreshAir lưu thông khí tươi chống ẩm mốc 72 giờ', 3),
('prod-15', 'Cảm biến độ đục nước thông minh tự động tối ưu lượng nước và điện', 4),

('prod-16', 'Con lăn tràn viền 2 bên làm sạch sát chân tường chỉ 1mm', 1),
('prod-16', 'Tự động giặt con lăn bằng nước nóng 60°C và sấy khô khí nóng trong 30 phút', 2),
('prod-16', 'Khử trùng nước điện phân thời gian thực tiêu diệt 99.9% vi khuẩn sàn nhà', 3),
('prod-16', 'Trợ lực kéo đẩy hai chiều nhẹ nhàng bằng một tay', 4),

('prod-17', 'Đèn UV-C tự động tắt khi nhấc máy khỏi bề mặt nệm để bảo vệ mắt', 1),
('prod-17', 'Cảm biến phát hiện mật độ mạt bụi thông minh báo đèn LED 3 màu', 2),
('prod-17', 'Luồng khí nóng 55°C hút ẩm chăn ga trong những ngày mưa phùn', 3),
('prod-17', 'Bộ lọc HEPA giặt rửa tái sử dụng nhiều lần', 4),

('prod-18', 'Làm nóng cực nhanh 15 giây, phun hơi nước áp lực mạnh đánh bay vết bẩn khô', 1),
('prod-18', '3 mức điều chỉnh lượng hơi nước phù hợp sàn gỗ, gạch men và đá hoa cương', 2),
('prod-18', 'Khớp xoay 180 độ dễ dàng luồn lách dưới gầm bàn ghế', 3),
('prod-18', 'Tặng kèm 3 miếng khăn lau sợi Microfiber siêu thấm hút', 4),

('prod-19', 'Thuật toán lập bản đồ đường đi thông minh không bỏ sót góc kính', 1),
('prod-19', 'Cảm biến phát hiện cạnh khung cửa thích hợp cho cả kính không viền', 2),
('prod-19', 'Vòi phun sương siêu âm kép làm mềm bụi bẩn khô cứng', 3),
('prod-19', 'Pin lưu điện khẩn cấp giữ máy bám chặt trên kính 30 phút kèm còi báo', 4),

('prod-20', 'Phun nước sạch và hút ngược nước bẩn đồng thời không làm ướt lõi nệm', 1),
('prod-20', 'Đánh bay vết cà phê, trà, rượu vang, nước tiểu thú cưng trong 30 giây', 2),
('prod-20', 'Thiết kế nhỏ gọn xách tay, cất gọn trong tủ đồ gia đình', 3),
('prod-20', 'Bình nước sạch và nước bẩn tách biệt hoàn toàn, tháo lắp dễ dàng', 4),

('prod-21', 'Hút ẩm mạnh mẽ 20L/ngày giữ nhà cửa khô ráo suốt mùa nồm miền Bắc', 1),
('prod-21', 'Tích hợp màng lọc HEPA H13 lọc sạch bụi mịn và bào tử nấm mốc', 2),
('prod-21', 'Chế độ sấy quần áo chuyên dụng giúp đồ khô nhanh, thơm tho', 3),
('prod-21', 'Bánh xe xoay 360 độ di chuyển nhẹ nhàng giữa các phòng', 4),

('prod-22', 'Thiết kế châm nước từ phía trên tiện lợi không cần tháo bình', 1),
('prod-22', 'Đèn UV-C diệt khuẩn nước trước khi phun sương bảo vệ hệ hô hấp', 2),
('prod-22', 'Cảm biến độ ẩm thông minh tự ngắt khi đạt độ ẩm lý tưởng', 3),
('prod-22', 'Khay tinh dầu riêng biệt mang lại hương thơm dịu nhẹ cho phòng ngủ', 4),

('prod-23', 'Đảo gió 3D tự động 2 chiều giúp không khí lưu thông khắp phòng', 1),
('prod-23', 'Chiều cao thay đổi linh hoạt từ quạt để bàn sang quạt cây đứng', 2),
('prod-23', 'Động cơ DC siêu êm chỉ 20dB ở mức gió thấp nhất', 3),
('prod-23', 'Điều khiển từ xa nam châm hít gọn ngay trên lồng quạt', 4),

('prod-24', 'Lưới lọc sơ cấp chuyên dụng giữ lại 99% lông thú cưng, tháo giặt dễ dàng', 1),
('prod-24', 'Công nghệ khử mùi Amoniac và H2S chuyên biệt cho gia đình nuôi chó mèo', 2),
('prod-24', 'Dây nguồn bọc chống cắn và khóa bảng điều khiển chống thú cưng dẫm phải', 3),
('prod-24', 'Chế độ Pet Mode tăng cường luồng hút sát mặt sàn', 4),

('prod-25', 'Làm ấm tức thì không đốt oxy, không gây khó thở trong phòng kín', 1),
('prod-25', 'Tích hợp bình nước tạo ẩm phun sương khắc phục hoàn toàn tình trạng khô da', 2),
('prod-25', 'Cảm biến ECO tự động điều chỉnh công suất theo nhiệt độ phòng', 3),
('prod-25', 'Vỏ nhựa ABS chống cháy V0 an toàn tuyệt đối cho gia đình có trẻ nhỏ', 4),

('prod-26', 'Cảm biến nhận diện khuôn mặt 3D hồng ngoại mở cửa trong 0.5 giây cả trong đêm', 1),
('prod-26', 'Cảm biến vân tay FPC Thụy Điển nhận diện 360 độ chống làm giả', 2),
('prod-26', 'Gửi thông báo lịch sử mở cửa thời gian thực về điện thoại', 3),
('prod-26', 'Tạo mật khẩu dùng 1 lần từ xa cho khách hoặc người giúp việc', 4),

('prod-27', 'Hình ảnh 2K QHD sắc nét gấp đôi Full HD, zoom kỹ thuật số 6x', 1),
('prod-27', 'AI nhận diện dáng người chuẩn xác, giảm 95% báo động giả do côn trùng', 2),
('prod-27', 'Chế độ riêng tư vật lý cụp ống kính vào trong vỏ khi gia đình ở nhà', 3),
('prod-27', 'Đàm thoại 2 chiều khử tiếng vọng rõ ràng từ mọi nơi', 4),

('prod-28', 'Kết nối ổn định tới 128 thiết bị Zigbee ngay cả khi mất mạng Internet', 1),
('prod-28', 'Tích hợp bộ phát hồng ngoại điều khiển điều hòa, TV, quạt truyền thống', 2),
('prod-28', 'Tạo kịch bản tự động hóa: Mở cửa tự bật đèn, nhiệt độ cao tự bật điều hòa', 3),
('prod-28', 'Cổng mạng LAN RJ45 đảm bảo độ trễ phản hồi dưới 50ms', 4),

('prod-29', 'Ánh sáng toàn phổ Ra98 tái tạo màu sắc trung thực như ánh sáng tự nhiên', 1),
('prod-29', 'Cảm biến ánh sáng môi trường tự động tăng giảm độ sáng phù hợp mắt', 2),
('prod-29', 'Cổ đèn gập xoay 3 trục chiếu sáng đều toàn bộ mặt bàn học 1.2m', 3),
('prod-29', 'Không nhấp nháy (Flicker-free) và lọc ánh sáng xanh có hại chuẩn RG0', 4),

('prod-30', 'Lắp đặt trực tiếp lên thanh rèm cũ trong 30 giây không cần thay rèm', 1),
('prod-30', 'Cảm biến ánh sáng tự động đóng rèm khi nắng gắt buổi trưa', 2),
('prod-30', 'Tính năng Touch & Go: kéo nhẹ tay 5cm động cơ tự chạy tiếp phần còn lại', 3),
('prod-30', 'Pin sạc 4000mAh hoạt động bền bỉ tới 8 tháng mới cần sạc lại', 4);

-- 3. Insert Multi-Image Gallery for all products (prod-1 to prod-30) so Detail Page has rich galleries
INSERT INTO product_gallery (product_id, image_url, display_order) VALUES
('prod-1', 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80', 1),
('prod-1', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80', 2),
('prod-1', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80', 3),

('prod-2', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80', 1),
('prod-2', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80', 2),
('prod-2', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80', 3),

('prod-3', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 1),
('prod-3', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', 2),
('prod-3', 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80', 3),

('prod-4', 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80', 1),
('prod-4', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80', 2),

('prod-5', 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&w=800&q=80', 1),
('prod-5', 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80', 2),

('prod-6', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80', 1),
('prod-6', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80', 2),

('prod-7', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80', 1),
('prod-7', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80', 2),

('prod-8', 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80', 1),
('prod-8', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', 2),

('prod-9', 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80', 1),
('prod-9', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', 2),

('prod-10', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', 1),
('prod-10', 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80', 2),

('prod-11', 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80', 1),
('prod-11', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80', 2),
('prod-11', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80', 3),

('prod-12', 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80', 1),
('prod-12', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80', 2),

('prod-13', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80', 1),
('prod-13', 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80', 2),

('prod-14', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80', 1),
('prod-14', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80', 2),

('prod-15', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 1),
('prod-15', 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80', 2),

('prod-16', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80', 1),
('prod-16', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80', 2),

('prod-17', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80', 1),
('prod-17', 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=800&q=80', 2),

('prod-18', 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=800&q=80', 1),
('prod-18', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80', 2),

('prod-19', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80', 1),
('prod-19', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80', 2),

('prod-20', 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=800&q=80', 1),
('prod-20', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80', 2),

('prod-21', 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80', 1),
('prod-21', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 2),

('prod-22', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', 1),
('prod-22', 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80', 2),

('prod-23', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80', 1),
('prod-23', 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80', 2),

('prod-24', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 1),
('prod-24', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', 2),

('prod-25', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', 1),
('prod-25', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 2),

('prod-26', 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80', 1),
('prod-26', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', 2),

('prod-27', 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80', 1),
('prod-27', 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80', 2),

('prod-28', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', 1),
('prod-28', 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80', 2),

('prod-29', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80', 1),
('prod-29', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', 2),

('prod-30', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', 1),
('prod-30', 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80', 2);

