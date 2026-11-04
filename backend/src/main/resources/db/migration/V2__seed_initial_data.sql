-- V2__seed_initial_data.sql
-- Seed data for categories and products

-- 1. Insert Categories
INSERT INTO categories (id, slug, name, description, image) VALUES
('cat-1', 'kitchen', 'Thiết bị nhà bếp', 'Nồi chiên không dầu, nồi cơm cao tần, máy pha cà phê chuẩn barista', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'),
('cat-2', 'cleaning', 'Thiết bị vệ sinh', 'Robot hút bụi tự động, máy lau sàn đa năng, máy hút bụi cầm tay', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'),
('cat-3', 'air', 'Chăm sóc không khí', 'Máy lọc không khí True HEPA, máy tạo ẩm bù ẩm thông minh, quạt tháp', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'),
('cat-4', 'smart', 'Gia dụng thông minh', 'Thiết bị kết nối App điều khiển từ xa, cảm biến tự động hóa gia đình', 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80');

-- 2. Insert Products
INSERT INTO products (id, category_slug, category_name, name, price, original_price, discount_percent, rating, reviews_count, badge, badge_type, image, description, specs_json, in_stock, stock_quantity) VALUES
('prod-1', 'kitchen', 'Thiết bị nhà bếp', 'Nồi chiên không dầu HomeNest DualZone 6.5L', 1990000, 2890000, 31, 4.9, 342, 'Bán chạy', 'bestseller',
 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80',
 'Công nghệ đối lưu Rapid Air 360 độ giúp giảm 90% dầu mỡ thừa, mặt kính cường lực quan sát thức ăn thông minh.',
 '{"Công suất": "1800W", "Dung tích": "6.5 Lít", "Chất liệu lòng nồi": "Ceramic chống dính", "Bảo hành": "24 tháng chính hãng"}',
 TRUE, 45),

('prod-2', 'cleaning', 'Thiết bị vệ sinh', 'Robot hút bụi lau nhà OmniClean Pro X1', 6290000, 8500000, 26, 4.9, 518, 'Bán chạy', 'bestseller',
 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
 'Lực hút siêu mạnh 6000Pa kết hợp chổi lau xoay kép tự động giặt giẻ và sấy khô bằng khí nóng trên trạm sạc.',
 '{"Lực hút": "6000Pa", "Thời lượng pin": "200 phút (5200mAh)", "Bình nước sạch / bẩn": "4.0L / 3.8L", "Bảo hành": "24 tháng"}',
 TRUE, 28),

('prod-3', 'air', 'Chăm sóc không khí', 'Máy lọc không khí AirPure Plasma True HEPA', 3150000, 4200000, 25, 4.8, 219, 'Nổi bật', 'featured',
 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
 'Bộ lọc 5 lớp kết hợp màng lọc True HEPA H13 và công nghệ Plasma ion khử sạch 99.97% bụi mịn PM2.5, phấn hoa và vi khuẩn.',
 '{"Diện tích phù hợp": "45 - 60 m²", "Tốc độ lọc CADR": "480 m³/h", "Độ ồn tối đa": "24 - 49 dB", "Bảo hành": "24 tháng"}',
 TRUE, 35),

('prod-4', 'kitchen', 'Thiết bị nhà bếp', 'Máy xay sinh tố đa năng UltraBlend 1200W', 1190000, 1650000, 28, 4.7, 185, 'Giảm sốc', 'sale',
 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80',
 'Động cơ đồng nguyên chất 1200W với 6 lưỡi dao thép titan Nhật Bản xay nhuyễn đá bi và hạt cứng chỉ trong 10 giây.',
 '{"Công suất": "1200W", "Dung tích cối": "1.75 Lít", "Số lưỡi dao": "6 cánh thép Titan 304", "Bảo hành": "18 tháng"}',
 TRUE, 60),

('prod-5', 'kitchen', 'Thiết bị nhà bếp', 'Nồi cơm điện cao tần SmartIH 1.8L', 1790000, 2450000, 27, 4.9, 412, 'Bán chạy', 'bestseller',
 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&w=800&q=80',
 'Công nghệ đốt nóng cảm ứng từ IH 360 độ giúp hạt cơm chín đều từ trong ra ngoài, giữ trọn vị ngọt tự nhiên của từng hạt gạo.',
 '{"Công nghệ nấu": "Cảm ứng từ IH", "Dung tích": "1.8 Lít (phù hợp 4 - 6 người)", "Công suất": "1300W", "Bảo hành": "24 tháng"}',
 TRUE, 50),

('prod-6', 'kitchen', 'Thiết bị nhà bếp', 'Máy pha cà phê Espresso Barista Touch', 4200000, 5600000, 25, 4.8, 147, 'Mới ra mắt', 'new',
 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',
 'Áp suất chuẩn Ý 20 Bar, hệ thống gia nhiệt ThermoBlock siêu nhanh trong 25 giây mang đến ly cà phê béo ngậy lớp crema.',
 '{"Áp suất": "20 Bar", "Bình chứa nước": "1.5 Lít tháo rời", "Công suất": "1450W", "Bảo hành": "24 tháng"}',
 TRUE, 20),

('prod-7', 'cleaning', 'Thiết bị vệ sinh', 'Máy hút bụi không dây StormForce V12', 2890000, 3800000, 24, 4.8, 276, 'Nổi bật', 'featured',
 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80',
 'Trọng lượng chỉ 1.2kg siêu nhẹ, lực hút xoáy 25,000Pa cùng cụm đèn LED soi bụi ẩn gầm giường ghế thông minh.',
 '{"Lực hút": "25,000Pa", "Trọng lượng thân máy": "1.2 kg", "Dung lượng pin": "2500mAh tháo rời", "Bảo hành": "24 tháng"}',
 TRUE, 30),

('prod-8', 'air', 'Chăm sóc không khí', 'Quạt tháp không cánh làm mát & lọc bụi SilentWind', 2390000, 3200000, 25, 4.7, 163, 'Giảm sốc', 'sale',
 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80',
 'Thiết kế không cánh an toàn tuyệt đối cho trẻ nhỏ, kết hợp lõi lọc không khí ion âm và góc quay rộng 90 độ.',
 '{"Góc quay": "90 độ tự động", "Số cấp độ gió": "9 cấp độ gió thông minh", "Công suất": "45W tiết kiệm điện", "Bảo hành": "24 tháng"}',
 TRUE, 40),

('prod-9', 'smart', 'Gia dụng thông minh', 'Ổ cắm thông minh HomeNest SmartPlug WiFi 16A', 250000, 350000, 29, 4.9, 98, 'Mới ra mắt', 'new',
 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
 'Đo điện năng tiêu thụ thời gian thực, bật tắt từ xa qua ứng dụng di động tiếng Việt và hẹn giờ tự động thông minh.',
 '{"Dòng tải tối đa": "16A - 3500W", "Kết nối": "WiFi 2.4GHz", "Chống cháy": "Nhựa PC chống cháy 750 độ C", "Bảo hành": "12 tháng"}',
 TRUE, 100),

('prod-10', 'smart', 'Gia dụng thông minh', 'Cảm biến nhiệt độ độ ẩm không khí HomeNest AirSensor', 390000, 520000, 25, 4.8, 86, 'Nổi bật', 'featured',
 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
 'Màn hình mực điện tử E-ink siêu nét, kết nối Bluetooth Mesh tự động kích hoạt máy lọc không khí và điều hòa.',
 '{"Màn hình": "E-ink 3.7 inch", "Độ chính xác nhiệt độ": "±0.1 độ C", "Độ chính xác độ ẩm": "±1% RH", "Bảo hành": "12 tháng"}',
 TRUE, 75);

-- 3. Insert Product Features
INSERT INTO product_features (product_id, feature_text, display_order) VALUES
('prod-1', 'Dung tích cực đại 6.5L nướng nguyên con gà 2.5kg', 1),
('prod-1', '12 chế độ nấu cài đặt sẵn qua màn hình LED cảm ứng', 2),
('prod-1', 'Lòng nồi chống dính ceramic cao cấp không chứa PFOA/PTFE', 3),
('prod-1', 'Tự ngắt an toàn khi kéo khay và chống quá nhiệt', 4),

('prod-2', 'Hệ thống định vị LiDAR TrueMapping 3D tránh chướng ngại vật chuẩn xác', 1),
('prod-2', 'Lực hút khủng 6000Pa hút sạch bụi mịn và lông thú cưng', 2),
('prod-2', 'Trạm sạc đa năng tự hút rác, tự giặt và sấy khô giẻ lau', 3),
('prod-2', 'Điều khiển qua ứng dụng tiếng Việt và giọng nói trợ lý ảo', 4),

('prod-3', 'Màng lọc HEPA H13 chuẩn y tế loại bỏ bụi siêu mịn PM0.3', 1),
('prod-3', 'Cảm biến laser đo chất lượng không khí hiển thị số thực trên màn hình', 2),
('prod-3', 'Vận hành êm ái dưới 24dB trong chế độ ngủ', 3),
('prod-3', 'Kết nối WiFi kiểm tra chất lượng không khí từ xa', 4),

('prod-4', 'Cối thủy tinh borosilicate chịu nhiệt cao cấp dung tích 1.75L', 1),
('prod-4', '6 chế độ xay tự động: sinh tố, sữa hạt, cháo dinh dưỡng, đá xay', 2),
('prod-4', 'Chức năng tự làm sạch cối bằng một nút chạm', 3),
('prod-4', 'Chân đế hút chân không chống rung lắc tuyệt đối', 4),

('prod-5', 'Lòng nồi hợp kim 8 lớp dày 3.0mm phủ chống dính Daikin Nhật Bản', 1),
('prod-5', 'Chế độ nấu cơm gạo lứt, cơm niêu giòn đáy, cháo hoa, súp dinh dưỡng', 2),
('prod-5', 'Hẹn giờ nấu thông minh lên đến 24 giờ', 3),
('prod-5', 'Bảng điều khiển cảm ứng chống trầy hiện đại', 4),

('prod-6', 'Bơm áp suất cao 20 Bar nhập khẩu từ Ý', 1),
('prod-6', 'Vòi đánh sữa xoay 360 độ tạo bọt sữa mịn màng chuẩn Latte Art', 2),
('prod-6', 'Bộ đo áp kế trực quan hiển thị áp suất chiết xuất hoàn hảo', 3),
('prod-6', 'Khay làm ấm tách bằng inox cao cấp', 4),

('prod-7', 'Lực hút mạnh mẽ 25,000Pa hút sạch mạt bụi giường nệm', 1),
('prod-7', 'Thời lượng pin lên đến 60 phút ở chế độ tiêu chuẩn', 2),
('prod-7', 'Trang bị 4 đầu hút chuyên dụng: sàn nhà, khe hẹp, giường nệm, bàn phím', 3),
('prod-7', 'Hộp bụi xả một chạm vệ sinh tiện lợi không dơ tay', 4),

('prod-8', 'Công nghệ khuếch tán gió êm dịu mô phỏng gió tự nhiên', 1),
('prod-8', 'Độ ồn cực thấp dưới 28dB tạo giấc ngủ sâu', 2),
('prod-8', 'Tích hợp lõi lọc sơ cấp và phát ion âm thanh lọc không khí', 3),
('prod-8', 'Điều khiển cảm ứng mặt kính và remote từ xa 6m', 4),

('prod-9', 'Đo điện năng tiêu thụ thiết bị theo ngày/tháng', 1),
('prod-9', 'Lập lịch bật tắt tự động theo giờ sinh hoạt gia đình', 2),
('prod-9', 'Tương thích Google Assistant và Alexa', 3),

('prod-10', 'Màn hình hiển thị nhiệt độ và độ ẩm trực quan', 1),
('prod-10', 'Thời lượng pin sử dụng lên đến 1 năm', 2),
('prod-10', 'Lưu biểu đồ biến thiên chất lượng không khí trong 6 tháng', 3);

